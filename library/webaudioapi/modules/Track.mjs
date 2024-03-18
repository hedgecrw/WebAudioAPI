/**
 * Module containing functionality to create new {@link WebAudioAPI} tracks.
 * @module Track
 */

/**
 * Object containing all track-specific {@link WebAudioAPI} functionality.
 * @namespace Track
 * @global
 */

import { canModifySequence, getModificationParameters, inferModificationParametersFromSequence,
   loadModification, NoteDetails, GlobalDynamic } from './Modification.mjs';
import { MidiCommand, getMidiCommand, getMidiNote, getMidiVelocity } from './Midi.mjs';
import { EncodingType, AnalysisType, ModificationType } from './Constants.mjs';
import * as WebAudioApiErrors from './Errors.mjs';
import { getEncoderFor } from './Encoder.mjs';
import { loadEffect } from './Effect.mjs';

/**
 * Creates a new audio {@link Track} object capable of playing sequential audio.
 * 
 * @param {string} name - Name of the track to create
 * @param {AudioContext} audioContext - Reference to the global browser {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @param {Tempo} tempo - Reference to the {@link Tempo} object stored in the global {@link WebAudioAPI} object
 * @param {Key} keySignature - Reference to the {@link Key} object stored in the global {@link WebAudioAPI} object
 * @param {AudioNode} trackAudioSink - Reference to the {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode} to which the output of this track should be connected
 * @returns {Track} Newly created audio {@link Track}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
 * @see {@link Key}
 * @see {@link Track}
 * @see {@link Tempo}
 */
export function createTrack(name, audioContext, tempo, keySignature, trackAudioSink) {

   // Track-local variable definitions
   let instrument = null, midiDevice = null, audioDeviceInput = null;
   let currentVelocity = 0.5, chordIndex = 0, chordDynamicUpdated = false;
   const audioSources = [], asyncAudioSources = [], effects = [], notesInWaiting = {}, waitingTies = [];
   const audioSink = new AnalyserNode(audioContext, { fftSize: 1024, maxDecibels: -10.0, smoothingTimeConstant: 0.5 });
   const analysisBuffer = new Uint8Array(audioSink.frequencyBinCount);
   audioSink.connect(trackAudioSink);

   // Private internal Track functions
   function createAsyncNote(noteValue, sourceNode, volumeNode) {
      return { noteValue, sourceNode, volumeNode };
   }

   function midiEventReceived(event) {
      const command = getMidiCommand(event.data);
      if (command === MidiCommand.NoteOff) {
         for (const asyncSource of asyncAudioSources)
            if (asyncSource.noteValue == getMidiNote(event.data)) {
               stopNoteAsync(asyncSource);
               break;
            }
      }
      else if ((command === MidiCommand.NoteOn) && (getMidiVelocity(event.data) > 0))
         playNoteAsync(getMidiNote(event.data), getMidiVelocity(event.data));
   }
   
   function sourceEnded(source, sourceVolume) {
      if (sourceVolume == null)
         sourceVolume = source;
      sourceVolume.disconnect();
      audioSources.splice(audioSources.indexOf(source), 1);
   }

   /**
    * Updates the instrument used to play back audio on the current track.
    * 
    * @param {Instrument} instrumentData - Instrument object to use when generating audio on the current track
    * @memberof Track
    * @instance
    */
   function updateInstrument(instrumentObject) {
      instrument = instrumentObject;
   }

   /**
    * Removes the instrument used to play back audio on the current track.
    * 
    * @memberof Track
    * @instance
    */
   function removeInstrument() {
      instrument = null;
   }

   /**
    * Returns a buffer containing the realtime frequency content of the audio being produced by
    * the current track.
    * 
    * @param {number} analysisType - Audio {@link module:Constants.AnalysisType AnalysisType} for which the buffer will be used
    * @returns {Uint8Array} Array containing time or frequency content of the track's current audio output
    * @memberof Track
    * @instance
    */
   function getAnalysisBuffer(analysisType) {
      if (analysisType == AnalysisType.TimeSeries)
         audioSink.getByteTimeDomainData(analysisBuffer);
      else
         audioSink.getByteFrequencyData(analysisBuffer);
      return analysisBuffer;
   }

   /**
    * Applies a new track effect at the specified time.
    * 
    * Calling this function affects the sequential ordering in which effects will be
    * processed, with each new call appending the corresponding effect to the *end* of the
    * processing sequence.
    * 
    * If an effect with the specified `effectName` has already been applied , then calling
    * this function will simply re-order the effect to move it to the very end of the effect
    * processing sequence, without changing its parameter values.
    * 
    * @param {string} effectName - User-defined name to associate with the track effect
    * @param {number} effectType - Track {@link module:Constants.EffectType EffectType} to apply
    * @see {@link module:Constants.EffectType EffectType}
    * @memberof Track
    * @instance
    */
   async function applyEffect(effectName, effectType) {
      const existingEffect = await this.removeEffect(effectName);
      const newEffect = existingEffect || await loadEffect(audioContext, effectName, effectType);
      newEffect.output.connect(trackAudioSink);
      if (effects.length) {
         const previousEffect = effects.slice(-1)[0];
         previousEffect.output.disconnect();
         previousEffect.output.connect(newEffect.input);
      }
      else {
         audioSink.disconnect();
         audioSink.connect(newEffect.input);
      }
      effects.push(newEffect);
   }

   /**
    * Updates the parameters of a track effect at the specified time.
    * 
    * Calling this function will **not** affect the sequential processing order of any applied
    * effects.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {string} effectName - Name of the track effect to be updated
    * @param {Object} effectOptions - Effect-specific options as returned by {@link WebAudioAPI#getAvailableEffectParameters getAvailableEffectParameters()}
    * @param {number} updateTime - Global API time at which to update the effect
    * @param {number} timeConstant - Time constant defining an exponential approach to the target
    * @memberof Track
    * @instance
    */
   async function updateEffect(effectName, effectOptions, updateTime, timeConstant) {
      for (const effect of effects)
         if (effect.name == effectName) {
            await effect.update(effectOptions, updateTime, timeConstant);
            return;
         }
      throw new WebAudioApiErrors.WebAudioTargetError(`The target track effect (${effectName}) does not exist`);
   }

   /**
    * Returns the current parameter settings for the specified track effect.
    * 
    * @param {string} effectName - Name of the track effect for which to retrieve current settings
    * @returns {Object} Effect-specific parameter values with keys as returned by {@link WebAudioAPI#getAvailableEffectParameters getAvailableEffectParameters()}
    * @memberof Track
    * @instance
    */
   function getCurrentEffectParameters(effectName) {
      for (const effect of effects)
         if (effect.name == effectName)
            return effect.currentParameterValues();
      throw new WebAudioApiErrors.WebAudioTargetError(`The target track effect (${effectName}) does not exist`);
   }

   /**
    * Removes the specified track effect from being applied.
    * 
    * @param {string} effectName - Name of the track effect to be removed
    * @returns {Effect|null} Existing effect or null
    * @memberof Track
    * @instance
    */
   async function removeEffect(effectName) {
      let existingEffect = null;
      for (const [index, effect] of effects.entries())
         if (effect.name == effectName) {
            existingEffect = effects.splice(index, 1)[0];
            if (index == 0) {
               audioSink.disconnect();
               audioSink.connect(effects.length ? effects[0].input : trackAudioSink);
            }
            else {
               effects[index-1].output.disconnect();
               effects[index-1].output.connect((effects.length > index) ? effects[index].input : trackAudioSink);
            }
            existingEffect.input.disconnect();
            existingEffect.output.disconnect();
            break;
         }
      return existingEffect;
   }

   /**
    * Immediately stop playing a note on the current track. The note to be stopped must be a
    * reference to an actively playing note that was previously returned from the
    * {@link Track#playNoteAsync playNoteAsync()} function.
    * 
    * @param {Object} noteObject - Reference to an active note that was started using {@link Track#playNoteAsync playNoteAsync()}
    * @memberof Track
    * @instance
    */
   function stopNoteAsync(noteObject) {
      noteObject.sourceNode.onended = null;
      asyncAudioSources.splice(asyncAudioSources.indexOf(noteObject), 1);
      noteObject.volumeNode.gain.setTargetAtTime(0.0, audioContext.currentTime, 0.03);
      setTimeout(() => {
         noteObject.sourceNode.stop();
         noteObject.volumeNode.disconnect();
      }, 200);
   }

   /**
    * Immediately begins playing a note on the current track. Playback continues until the note
    * is explicitly stopped using the {@link Track#stopNoteAsync stopNoteAsync()} function.
    * 
    * Note that the `note` parameter should correspond to a valid MIDI note number.
    * 
    * @param {number} note -  MIDI {@link module:Constants.Note Note} number to be played
    * @param {number} velocity - Intensity of the note to play between [0.0, 1.0]
    * @returns {Object} Reference to the newly scheduled note
    * @memberof Track
    * @instance
    */
   function playNoteAsync(note, velocity) {
      if (!instrument)
         throw new WebAudioApiErrors.WebAudioTrackError(`The current track (${name}) cannot play a note without first setting up an instrument`);
      const noteSource = instrument.getNote(note);
      const noteVolume = new GainNode(audioContext, { gain: velocity });
      noteSource.connect(noteVolume).connect(audioSink);
      const noteStorage = createAsyncNote(note, noteSource, noteVolume);
      noteSource.onended = stopNoteAsync.bind(this, noteStorage);
      asyncAudioSources.push(noteStorage);
      noteSource.start(audioContext.currentTime);
      return noteStorage;
   }

   /**
    * Schedules a note to be played on the current track for some duration of time.
    * 
    * Note that the `duration` parameter should correspond to the beat scaling factor
    * associated with one of the note durations from
    * {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()}.
    * Likewise, the `note` parameter should correspond to a valid MIDI note number.
    * 
    * The `modifications` parameter may either be a single {@link ModificationDetails}
    * structure or a list of such structures.
    * 
    * @param {number} note - MIDI {@link module:Constants.Note Note} number to be played
    * @param {number} startTime - Global API time at which to start playing the note
    * @param {number} duration - {@link module:Constants.Duration Duration} for which to continue playing the note
    * @param {ModificationDetails[]} modifications - One or more {@link ModificationDetails Modifications} to apply to the note
    * @param {boolean} [fromChord=false] - Whether this note is being played from the {@link playChord playChord()} function
    * @returns {number} Duration (in seconds) of the note being played
    * @memberof Track
    * @instance
    */
   function playNote(note, startTime, duration, modifications, fromChord=false) {
      if (!instrument)
         throw new WebAudioApiErrors.WebAudioTrackError(`The current track (${name}) cannot play a note without first setting up an instrument`);

      // Infer missing modification details for any notes in waiting
      const waitingNoteDetails = [], newTies = [];
      for (const noteInWaitingPitch in notesInWaiting) {
         const noteInWaiting = notesInWaiting[noteInWaitingPitch];
         if (!fromChord || (noteInWaiting.chordIndex != chordIndex)) {
            let noteDetails = [new NoteDetails(noteInWaiting.note, currentVelocity, noteInWaiting.duration)];
            const sequence = [[noteInWaiting.note, noteInWaiting.duration], [note, duration]];
            for (const modification of noteInWaiting.pendingModifications)
               modification.value = inferModificationParametersFromSequence(modification.type, sequence, 1, modification.value);
            for (const modification of noteInWaiting.modifications) {
               const modClass = loadModification(modification.type, tempo, keySignature, noteDetails[0]);
               noteDetails = modClass.getModifiedNoteDetails(modification.value);
               if (modification.type == ModificationType.Tie)
                  newTies.push(noteDetails[0].note);
               for (const noteDetail of noteDetails) {
                  noteDetail.startTimeOffset -= (startTime - noteInWaiting.startTime);
                  noteDetail.wasWaitingNote = true;
               }
            }
            delete notesInWaiting[noteInWaitingPitch];
            waitingNoteDetails.push(...noteDetails);
         }
      }

      // Remove any duplicate modifications, keeping only the last one
      const exists = [];
      for (let i = modifications.length - 1; i >= 0; --i)
         if (modifications[i].type in exists)
            modifications.splice(i, 1);
         else
            exists.push(modifications[i].type);

      // Order modifications by type so that they make sense when applied: GlobalDynamic < Loudness < Start Time Offsets < Durations < Adds notes
      modifications.sort((a, b) => { return a.type - b.type; });

      // Get concrete note details based on any applied modifications
      let requiresWaiting = false, totalDurationSeconds = 0.0;
      let noteDetails = [new NoteDetails(note, currentVelocity, duration)];
      for (const modification of modifications) {

         // Determine if the modification requires that we wait for the next note to infer missing details
         let modRequiresWaiting = false;
         const neededParams = getModificationParameters(modification.type).optional.singleNote;
         if (neededParams.length && canModifySequence(modification.type)) {
            for (const neededParam of neededParams)
               if (!('value' in modification) || !(neededParam in modification.value) && ((neededParams.length > 1) || !('implicit' in modification.value))) {
                  if (!(note in notesInWaiting))
                     notesInWaiting[note] = { note: note, duration: duration, startTime: startTime, chordIndex: chordIndex, modifications: modifications, pendingModifications: [] };
                  notesInWaiting[note].pendingModifications.push(modification);
                  requiresWaiting = modRequiresWaiting = true;
               }
         }

         // Update the concrete note details based on the current modification
         if (!modRequiresWaiting) {
            const modClass = loadModification(modification.type, tempo, keySignature, noteDetails[0]);
            noteDetails = modClass.getModifiedNoteDetails(modification.value);
            if (((modification.type == ModificationType.Crescendo) || (modification.type == ModificationType.Decrescendo) ||
                 (modification.type == ModificationType.Diminuendo) || (modClass instanceof GlobalDynamic)) &&
                (!fromChord || !chordDynamicUpdated)) {
               currentVelocity = noteDetails[0].velocity;
               chordDynamicUpdated = fromChord;
            }
            else if (modification.type == ModificationType.Tie)
               newTies.push(noteDetails[0].note);
         }
         else
            totalDurationSeconds = (noteDetails[0].usedDuration < 0) ? -noteDetails[0].usedDuration : (60.0 / ((noteDetails[0].usedDuration / tempo.beatBase) * tempo.beatsPerMinute));
      }

      // Schedule all notes for playback
      noteDetails = (requiresWaiting ? waitingNoteDetails : waitingNoteDetails.concat(noteDetails));
      for (const note of noteDetails) {
         const durationSeconds = (note.duration < 0) ? -note.duration : (60.0 / ((note.duration / tempo.beatBase) * tempo.beatsPerMinute));
         if (waitingTies.includes(note.note))
            waitingTies.splice(waitingTies.indexOf(note.note), 1);
         else {
            const noteSource = instrument.getNote(note.note);
            const noteVolume = new GainNode(audioContext, { gain: note.velocity });
            noteSource.connect(noteVolume).connect(audioSink);
            noteVolume.gain.setTargetAtTime(0.0, startTime + note.startTimeOffset + durationSeconds, 0.03);
            noteSource.onended = sourceEnded.bind(this, noteSource, noteVolume);
            audioSources.push(noteSource);
            noteSource.start(startTime + note.startTimeOffset, 0, durationSeconds + 0.200);
         }
         if (newTies.includes(note.note))
            waitingTies.push(newTies.splice(newTies.indexOf(note.note), 1)[0]);
         if (!note.wasWaitingNote)
            totalDurationSeconds += (note.usedDuration <= 0) ? -note.usedDuration : (60.0 / ((note.usedDuration / tempo.beatBase) * tempo.beatsPerMinute));
      }
      return totalDurationSeconds;
   }

   /**
    * Schedules a chord of notes to be played on the current track.
    * 
    * Note that the `chord` parameter should be an array of `[note, duration, mods]` tuples,
    * where the `note` parameter should correspond to a valid MIDI note number, the `duration`
    * parameter should correspond to the beat scaling factor associated with one of the note
    * durations from {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()},
    * and `mods` may either be a single modification to the chord, a list of modifications, or
    * omitted completely.
    * 
    * The `modifications` parameter may either be a single {@link ModificationDetails}
    * structure or a list of such structures.
    * 
    * @param {Array<Array>}} chord - Array of `[note, duration, mods]` corresponding to the chord to be played
    * @param {number} startTime - Global API time at which to start playing the chord
    * @param {ModificationDetails[]} modifications - One or more {@link ModificationDetails Modifications} to apply to the chord
    * @returns {number} Duration (in seconds) of the chord being played
    * @memberof Track
    * @instance
    */
   function playChord(chord, startTime, modifications) {
      chordIndex = (chordIndex + 1) % 2;
      let minDuration = Number.POSITIVE_INFINITY;
      for (const chordItem of chord) {
         const [note, duration, noteMods] = chordItem;
         const mods = modifications.concat(noteMods ? (Array.isArray(noteMods) ? noteMods : [noteMods]) : []);
         minDuration = Math.min(minDuration, playNote(Number(note), startTime, Number(duration), mods, true));
      }
      chordDynamicUpdated = false;
      return minDuration;
   }

   /**
    * Schedules a musical sequence to be played on the current track.
    * 
    * Note that the `sequence` parameter should be an array containing either chords (as
    * defined in the {@link playChord playChord()} function) or `[note, duration, mods]` tuples,
    * where the `note` parameter should correspond to a valid MIDI note number, the `duration`
    * parameter should correspond to the beat scaling factor associated with one of the note
    * durations from {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()},
    * and `mods` may either be a single modification that affects the whole sequence, a list of
    * modifications, or omitted completely.
    * 
    * The `modifications` parameter may either be a single {@link ModificationDetails}
    * structure or a list of such structures.
    * 
    * @param {Array<Array|Array<Array>>} sequence - Array of `[note, duration, mods]` and/or chords corresponding to the sequence to be played
    * @param {number} startTime - Global API time at which to start playing the sequence
    * @param {ModificationDetails[]} modifications - One or more {@link ModificationDetails Modifications} to apply to the sequence
    * @returns {number} Duration (in seconds) of the sequence being played
    * @memberof Track
    * @instance
    */
   function playSequence(sequence, startTime, modifications) {
      let noteIndex = 0;
      const originalStartTime = startTime;
      for (const sequenceItem of sequence) {
         ++noteIndex;
         for (const modification of modifications)
            modification.value = inferModificationParametersFromSequence(modification.type, sequence, noteIndex, modification.value);
         if (Array.isArray(sequenceItem[0]))
            startTime += playChord(sequenceItem, startTime, modifications);
         else {
            const [note, duration, noteMods] = sequenceItem;
            const mods = (noteMods ? (Array.isArray(noteMods) ? noteMods : [noteMods]) : []).concat(modifications);
            startTime += playNote(Number(note), startTime, Number(duration), mods);
         }
      }
      return startTime - originalStartTime;
   }

   /**
    * Schedules an audio clip to be played on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio clip will
    * play to completion.
    * 
    * @param {ArrayBuffer|Blob|MidiClip|AudioClip} audioClip - Object containing audio data to play
    * @param {number} startTime - Global API time at which to start playing the clip
    * @param {number} [duration] -  Number of seconds for which to continue playing the clip
    * @returns {Promise<number>} Duration (in seconds) of the clip being played
    * @memberof Track
    * @instance
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer ArrayBuffer}
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
    * @see {@link MidiClip}
    */
   async function playClip(audioClip, startTime, duration) {
      let expectedDuration = null;
      if (audioClip instanceof ArrayBuffer || audioClip instanceof Blob || audioClip.clipType == 'audio') {
         const audioBuffer = await audioContext.decodeAudioData(audioClip instanceof ArrayBuffer ? audioClip : (audioClip instanceof Blob ? await audioClip.arrayBuffer() : await audioClip.getRawData().arrayBuffer()));
         const clipSource = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
         audioSources.push(clipSource);
         if (duration) {
            const clipVolume = new GainNode(audioContext);
            clipSource.connect(clipVolume).connect(audioSink);
            clipVolume.gain.setTargetAtTime(0.0, startTime + duration, 0.03);
            clipSource.onended = sourceEnded.bind(this, clipSource, clipVolume);
            clipSource.start(startTime, 0, duration + 0.200);
         }
         else {
            clipSource.connect(audioSink);
            clipSource.onended = sourceEnded.bind(this, clipSource, null);
            clipSource.start(startTime);
         }
         expectedDuration = (duration && (duration < audioBuffer.duration)) ? duration : audioBuffer.duration;
      }
      else {
         if (!instrument)
            throw new WebAudioApiErrors.WebAudioTrackError(`The current track (${name}) cannot play a MIDI clip without first setting up an instrument`);
         const unmatchedNotes = {};
         for (const [noteTime, midiData] of Object.entries(audioClip.getRawData()))
            if (!duration || (Number(noteTime) < duration)) {
               const command = getMidiCommand(midiData), note = getMidiNote(midiData);
               if ((command === MidiCommand.NoteOn) && (getMidiVelocity(midiData) > 0))
                  unmatchedNotes[note] = [ Number(noteTime), getMidiVelocity(midiData) ];
               else if ((command === MidiCommand.NoteOff) && (note in unmatchedNotes)) {
                  const noteDuration = ((!duration || (Number(noteTime) <= duration)) ? Number(noteTime) : duration) - unmatchedNotes[note][0];
                  playNote(note, startTime + unmatchedNotes[note][0], -noteDuration, [{ type: ModificationType.Velocity, value: unmatchedNotes[note][1] }]);
                  delete unmatchedNotes[note];
               }
            }
         for (const [note, noteData] of Object.entries(unmatchedNotes)) {
            const noteDuration = audioClip.getDuration() - noteData[0];
            playNote(note, startTime + noteData[0], -noteDuration, [{ type: ModificationType.Velocity, value: noteData[1] }]);
         }
         expectedDuration = (duration && (duration < audioClip.getDuration())) ? duration : audioClip.getDuration();
      }
      return expectedDuration;
   }

   /**
    * Schedules a MIDI clip to be recorded on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the MIDI clip will
    * continue to record until manually stopped by the {@link MidiClip#finalize finalize()}
    * function on the returned {@link MidiClip} object.
    * 
    * Note that the recorded MIDI clip will **not** include any effects that might exist on
    * the track. This is so that recording and then immediately playing back on the same track
    * will not cause any underlying effects to be doubled.
    * 
    * @param {number} startTime - Global API time at which to start recording the MIDI clip
    * @param {number} [duration] - Number of seconds for which to continue recording the MIDI clip
    * @returns {MidiClip} Reference to a {@link MidiClip} object representing the MIDI data to be recorded
    * @memberof Track
    * @instance
    * @see {@link MidiClip}
    */
   function recordMidiClip(startTime, duration) {

      /**
       * Object containing all data needed to record and render a MIDI audio clip.
       * @namespace MidiClip
       * @global
       */

      // MIDI clip-local variable definitions
      let thisMidiDevice = midiDevice, recordedDuration = null, completionCallback = null;
      const midiLog = {}, noteSources = [];

      // Ensure that a MIDI device is currently connected to this track
      if (!thisMidiDevice)
         throw new WebAudioApiErrors.WebAudioRecordingError(`The current track (${name}) has no MIDI device associated with it from which to record`);

      // Private MIDI handling functions
      function midiEventToRecord(event) {
         if ((audioContext.currentTime >= startTime) && (!duration || (audioContext.currentTime < startTime + duration)))
            midiLog[audioContext.currentTime - startTime] = event.data;
      }

      function playNoteOffline(offlineContext, note, velocity, startTime, duration) {
         const noteSource = instrument.getNoteOffline(offlineContext, note);
         const noteVolume = new GainNode(offlineContext, { gain: velocity });
         noteSource.connect(noteVolume).connect(offlineContext.destination);
         noteVolume.gain.setTargetAtTime(0.0, startTime + duration, 0.03);
         noteSource.start(startTime, 0, duration + 0.200);
         noteSources.push(noteSource);
      }

      /**
       * Returns a dictionary of all MIDI event data within the {@link MidiClip}, stored according
       * to the relative times (in seconds) that they were received.
       * 
       * @returns {Object} Dictionary containing MIDI event data stored according to their relative reception times
       * @memberof MidiClip
       * @instance
       */
      function getRawData() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve raw data from this MIDI clip because recording has not yet completed');
         return midiLog;
      }

      /**
       * Returns the total duration of the MIDI clip in seconds.
       * 
       * @returns {number} Duration of the MIDI clip in seconds
       * @memberof MidiClip
       * @instance
       */
      function getDuration() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve duration of this MIDI clip because recording has not yet completed');
         return recordedDuration;
      }

      /**
       * Stops recording any future MIDI data within the {@link MidiClip}, finalizes the internal
       * storage of all recorded data, and calls the user-completion notification callback, if
       * registered.
       * 
       * Note that this function is called automatically if the original call to
       * {@link Track#recordMidiClip recordMidiClip()} specified a concrete duration for the clip.
       * If no duration was specified, then this function **must** be called in order to stop
       * recording. A {@link MidiClip} is unable to be used or played back until this function
       * has been called.
       * 
       * @memberof MidiClip
       * @instance
       */
      async function finalize() {
         if (!recordedDuration) {
            if (duration) {
               while ((startTime + duration) > audioContext.currentTime)
                  await new Promise(r => setTimeout(r, 10));
               recordedDuration = duration;
            }
            else
               recordedDuration = audioContext.currentTime - startTime;
            thisMidiDevice.removeEventListener('midimessage', midiEventToRecord);
            thisMidiDevice = null;
            if (completionCallback)
               completionCallback(this);
            completionCallback = null;
         }
      }

      /**
       * Allows a user to register a callback for notification when all MIDI recording activities
       * have been completed for this {@link MidiClip}. This corresponds to the time when the
       * {@link MidiClip#finalize finalize()} function gets called, either manually or
       * automatically.
       * 
       * A user-defined notification callback will be called with a single parameter which is a
       * reference to this {@link MidiClip}.
       * 
       * @param {RecordCompleteCallback} notificationCallback - Callback to fire when recording of this clip has completed
       * @memberof MidiClip
       * @instance
       */
      function notifyWhenComplete(notificationCallback) {
         if (!recordedDuration)
            completionCallback = notificationCallback;
         else
            notificationCallback(this);
      }

      /**
       * Encodes this {@link MidiClip} into a {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * containing raw audio data according to the {@link module:Constants.EncodingType EncodingType}
       * specified in the `encodingType` parameter.
       * 
       * @param {number} encodingType - Numeric value corresponding to the desired {@link module:Constants.EncodingType EncodingType}
       * @returns {Blob} Data {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob} containing the newly encoded audio data
       * @memberof MidiClip
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * @see {@link module:Constants.EncodingType EncodingType}
       */
      async function getEncodedData(encodingType) {
         if (!Object.values(EncodingType).includes(Number(encodingType)))
            throw new WebAudioApiErrors.WebAudioTargetError(`An encoder for the target type identifier (${encodingType}) does not exist`);
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot render this MIDI clip because recording has not yet completed');
         if (!instrument)
            throw new WebAudioApiErrors.WebAudioTrackError(`The current track (${name}) cannot render a MIDI clip without first setting up an instrument`);
         const unmatchedNotes = {}, offlineContext = new OfflineAudioContext(1, 44100 * recordedDuration, 44100);
         for (const [startTime, midiData] of Object.entries(midiLog)) {
            const command = getMidiCommand(midiData), note = getMidiNote(midiData);
            if ((command === MidiCommand.NoteOn) && (getMidiVelocity(midiData) > 0))
               unmatchedNotes[note] = [ Number(startTime), getMidiVelocity(midiData) ];
            else if ((command === MidiCommand.NoteOff) && (note in unmatchedNotes)) {
               playNoteOffline(offlineContext, note, unmatchedNotes[note][1], unmatchedNotes[note][0], Number(startTime) - unmatchedNotes[note][0]);
               delete unmatchedNotes[note];
            }
         }
         for (const [note, noteData] of Object.entries(unmatchedNotes)) {
            const noteDuration = recordedDuration - noteData[0];
            playNoteOffline(offlineContext, note, noteData[1], noteData[0], noteDuration);
         }
         const renderedData = await offlineContext.startRendering();
         noteSources.splice(0, noteSources.length);
         return await getEncoderFor(Number(encodingType)).encode(renderedData);
      }

      // Begin listening for all incoming MIDI events and optionally set a timer to stop listening
      thisMidiDevice.addEventListener('midimessage', midiEventToRecord);
      if (duration)
         setTimeout(finalize, startTime + duration - audioContext.currentTime);

      // Returns an object containing functions and attributes within the MidiClip namespace
      return { clipType: 'midi', getRawData, getDuration, finalize, getEncodedData, notifyWhenComplete };
   }

   /**
    * Schedules an audio clip to be recorded on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio clip will
    * continue to record until manually stopped by the {@link AudioClip#finalize finalize()}
    * function on the returned {@link AudioClip} object.
    * 
    * Note that the recorded audio clip will **not** include any effects that might exist on
    * the track. This is so that recording and then immediately playing back on the same track
    * will not cause any underlying effects to be doubled.
    * 
    * @param {number} startTime - Global API time at which to start recording the audio clip
    * @param {number} [duration] - Number of seconds for which to continue recording the audio clip
    * @returns {AudioClip} Reference to an {@link AudioClip} object representing the audio data to be recorded
    * @memberof Track
    * @instance
    * @see {@link AudioClip}
    */
   function recordAudioClip(startTime, duration) {

      /**
       * Object containing all data needed to record and render an audio clip.
       * @namespace AudioClip
       * @global
       */

      // Audio clip-local variable definitions
      let recorderDestination = audioContext.createMediaStreamDestination();
      let recorder = new MediaRecorder(recorderDestination.stream);
      let thisAudioInputDevice = audioDeviceInput, audioData = null;
      let recordedDuration = null, completionCallback = null;

      // Ensure that an audio input device is currently connected to this track
      if (!thisAudioInputDevice)
         throw new WebAudioApiErrors.WebAudioRecordingError(`The current track (${name}) has no audio input device associated with it from which to record`);

      // Private audio data handling functions
      function startRecording() {
         if (startTime >= (audioContext.currentTime + 0.001))
            setTimeout(startRecording, 1);
         else
            recorder.start(duration ? (1000 * duration) : undefined);
      }

      recorder.ondataavailable = (event) => {
         if (!audioData) {
            audioData = event.data;
            recordedDuration = duration || (audioContext.currentTime - startTime);
            finalize();
         }
      };

      recorder.onstop = async () => {
         thisAudioInputDevice.disconnect();
         thisAudioInputDevice = null;
         if (completionCallback)
            completionCallback(this);
         completionCallback = null;
         recorderDestination = null;
         recorder = null;
      };

      /**
       * Returns a {@link Blob} containing all of the recorded audio data.
       * 
       * @returns {Blob} Buffer containing all recorded audio data
       * @memberof AudioClip
       * @instance
       */
      function getRawData() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve raw data from this audio clip because recording has not yet completed');
         return audioData;
      }

      /**
       * Returns the total duration of the audio clip in seconds.
       * 
       * @returns {number} Duration of the audio clip in seconds
       * @memberof AudioClip
       * @instance
       */
      function getDuration() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve duration of this audio clip because recording has not yet completed');
         return recordedDuration;
      }

      /**
       * Stops recording any future audio data within the {@link AudioClip}, finalizes the internal
       * storage of all recorded data, and calls the user-completion notification callback, if
       * registered.
       * 
       * Note that this function is called automatically if the original call to
       * {@link Track#recordAudioClip recordAudioClip()} specified a concrete duration for the
       * clip. If no duration was specified, then this function **must** be called in order to stop
       * recording. An {@link AudioClip} is unable to be used or played back until this function
       * has been called.
       * 
       * @memberof AudioClip
       * @instance
       */
      async function finalize() {
         if (duration) {
            while ((startTime + duration) > audioContext.currentTime)
               await new Promise(r => setTimeout(r, 10));
         }
         if (recorder.state != 'inactive')
            recorder.stop();
      }

      /**
       * Allows a user to register a callback for notification when all audio recording activities
       * have been completed for this {@link AudioClip}. This corresponds to the time when the
       * {@link AudioClip#finalize finalize()} function gets called, either manually or
       * automatically.
       * 
       * A user-defined notification callback will be called with a single parameter which is a
       * reference to this {@link AudioClip}.
       * 
       * @param {RecordCompleteCallback} notificationCallback - Callback to fire when recording of this clip has completed
       * @memberof AudioClip
       * @instance
       */
      function notifyWhenComplete(notificationCallback) {
         if (!recordedDuration)
            completionCallback = notificationCallback;
         else
            notificationCallback(this);
      }

      /**
       * Encodes this {@link AudioClip} into a {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * containing raw audio data according to the {@link module:Constants.EncodingType EncodingType}
       * specified in the `encodingType` parameter.
       * 
       * @param {number} encodingType - Numeric value corresponding to the desired {@link module:Constants.EncodingType EncodingType}
       * @returns {Blob} Data {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob} containing the newly encoded audio data
       * @memberof AudioClip
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * @see {@link module:Constants.EncodingType EncodingType}
       */
      async function getEncodedData(encodingType) {
         if (!Object.values(EncodingType).includes(Number(encodingType)))
            throw new WebAudioApiErrors.WebAudioTargetError(`An encoder for the target type identifier (${encodingType}) does not exist`);
         if (!recordedDuration || !(audioData instanceof Blob))
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot render this audio clip because recording has not yet completed');
         const offlineContext = new OfflineAudioContext(1, 44100 * recordedDuration, 44100);
         const audioBuffer = await offlineContext.decodeAudioData(await audioData.arrayBuffer());
         const clipSource = new AudioBufferSourceNode(offlineContext, { buffer: audioBuffer });
         clipSource.connect(offlineContext.destination);
         clipSource.start();
         const renderedData = await offlineContext.startRendering();
         return await getEncoderFor(Number(encodingType)).encode(renderedData);
      }

      // Begin listening for incoming audio data
      thisAudioInputDevice.connect(recorderDestination);
      startRecording();

      // Returns an object containing functions and attributes within the AudioClip namespace
      return { clipType: 'audio', getRawData, getDuration, finalize, getEncodedData, notifyWhenComplete };
   }

   /**
    * Schedules an audio recording to be executed on the cumulative output of the current track
    * for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio recording will
    * continue until manually stopped by the {@link AudioRecording#finalize finalize()} function
    * on the returned {@link AudioRecording} object.
    * 
    * Note that the recorded audio **will** include **all** effects that exist on the track.
    * 
    * @param {number} startTime - Global API time at which to start recording the audio output
    * @param {number} [duration] - Number of seconds for which to continue recording the audio output
    * @returns {AudioRecording} Reference to an {@link AudioRecording} object representing the audio recording
    * @memberof Track
    * @instance
    * @see {@link AudioRecording}
    */
   function recordOutput(startTime, duration) {

      /**
       * Object containing all data needed to render a full audio recording.
       * @namespace AudioRecording
       * @global
       */

      // Audio recording-local variable definitions
      let recorderDestination = audioContext.createMediaStreamDestination();
      let recorder = new MediaRecorder(recorderDestination.stream), isRecording = true;
      let audioData = null, recordedDuration = null, completionCallback = null;

      // Private audio data handling functions
      function startRecording() {
         if (startTime >= (audioContext.currentTime + 0.001))
            setTimeout(startRecording, 1);
         else {
            startTime = audioContext.currentTime;
            recorder.start(duration ? (1000 * duration) : undefined);
         }
      }

      recorder.ondataavailable = (event) => {
         if (!audioData) {
            audioData = event.data;
            recordedDuration = duration || (audioContext.currentTime - startTime);
            finalize();
         }
         isRecording = false;
      };

      recorder.onstop = async () => {
         trackAudioSink.disconnect(recorderDestination);
         if (completionCallback)
            completionCallback(this);
         completionCallback = null;
         recorderDestination = null;
         recorder = null;
      };

      /**
       * Returns a {@link Blob} containing all of the recorded audio data.
       * 
       * @returns {Blob} Buffer containing all recorded audio data
       * @memberof AudioRecording
       * @instance
       */
      function getRawData() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve raw data from this audio recording because recording has not yet completed');
         return audioData;
      }

      /**
       * Returns the total duration of the audio recording in seconds.
       * 
       * @returns {number} Duration of the audio recording in seconds
       * @memberof AudioRecording
       * @instance
       */
      function getDuration() {
         if (!recordedDuration)
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot retrieve duration of this audio recording because recording has not yet completed');
         return recordedDuration;
      }

      /**
       * Stops recording any future audio data within the {@link AudioRecording}, finalizes the
       * internal storage of all recorded data, and calls the user-completion notification
       * callback, if registered.
       * 
       * Note that this function is called automatically if the original call to
       * {@link Track#recordOutput recordOutput()} specified a concrete duration for the
       * recording. If no duration was specified, then this function **must** be called in order
       * to stop recording. An {@link AudioRecording} is unable to be used or played back until
       * this function has been called.
       * 
       * @memberof AudioRecording
       * @instance
       */
      async function finalize() {
         if (duration) {
            while ((startTime + duration) > audioContext.currentTime)
               await new Promise(r => setTimeout(r, 10));
         }
         if (recorder.state != 'inactive') {
            recorder.stop();
            while (isRecording)
               await new Promise(r => setTimeout(r, 1));
         }
      }

      /**
       * Allows a user to register a callback for notification when all audio recording activities
       * have been completed for this {@link AudioRecording}. This corresponds to the time when the
       * {@link AudioRecording#finalize finalize()} function gets called, either manually or
       * automatically.
       * 
       * A user-defined notification callback will be called with a single parameter which is a
       * reference to this {@link AudioRecording}.
       * 
       * @param {RecordCompleteCallback} notificationCallback - Callback to fire when this recording has completed
       * @memberof AudioRecording
       * @instance
       */
      function notifyWhenComplete(notificationCallback) {
         if (!recordedDuration)
            completionCallback = notificationCallback;
         else
            notificationCallback(this);
      }

      /**
       * Encodes this {@link AudioRecording} into a {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * containing raw audio data according to the {@link module:Constants.EncodingType EncodingType}
       * specified in the `encodingType` parameter.
       * 
       * @param {number} encodingType - Numeric value corresponding to the desired {@link module:Constants.EncodingType EncodingType}
       * @returns {Blob} Data {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob} containing the newly encoded audio data
       * @memberof AudioRecording
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
       * @see {@link module:Constants.EncodingType EncodingType}
       */
      async function getEncodedData(encodingType) {
         if (!Object.values(EncodingType).includes(Number(encodingType)))
            throw new WebAudioApiErrors.WebAudioTargetError(`An encoder for the target type identifier (${encodingType}) does not exist`);
         if (!recordedDuration || !(audioData instanceof Blob))
            throw new WebAudioApiErrors.WebAudioRecordingError('Cannot render this audio recording because recording has not yet completed');
         const offlineContext = new OfflineAudioContext(1, 44100 * recordedDuration, 44100);
         const audioBuffer = await offlineContext.decodeAudioData(await audioData.arrayBuffer());
         const clipSource = new AudioBufferSourceNode(offlineContext, { buffer: audioBuffer });
         clipSource.connect(offlineContext.destination);
         clipSource.start();
         const renderedData = await offlineContext.startRendering();
         return await getEncoderFor(Number(encodingType)).encode(renderedData);
      }

      // Begin listening for incoming audio data
      trackAudioSink.connect(recorderDestination);
      startRecording();

      // Returns an object containing functions and attributes within the AudioClip namespace
      return { getRawData, getDuration, finalize, getEncodedData, notifyWhenComplete };
   }

   /**
    * Schedules an audio file to be played on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio file will
    * play to completion.
    * 
    * @param {string} fileURL - URL location pointing to an audio file
    * @param {number} startTime - Global API time at which to start playing the file
    * @param {number} [duration] - Number of seconds for which to continue playing the file
    * @returns {Promise<number>} Duration (in seconds) of the file being played
    * @memberof Track
    * @instance
    */
   async function playFile(fileURL, startTime, duration) {
      const response = await fetch(fileURL);
      const arrayBuffer = await response.arrayBuffer();
      return await playClip(arrayBuffer, startTime, duration);
   }

   /**
    * Disconnects the current track from the specified MIDI device so that no further MIDI events
    * will be received.
    * 
    * @memberof Track
    * @instance
    */
   function disconnectFromMidiDevice() {
      if (midiDevice != null)
         midiDevice.removeEventListener('midimessage', midiEventReceived);
      midiDevice = null;
   }

   /**
    * Disconnects the current track from the specified audio input device so that no further audio
    * events will be received.
    * 
    * @memberof Track
    * @instance
    */
   function disconnectFromAudioInputDevice() {
      if (audioDeviceInput != null)
         audioDeviceInput.disconnect();
      audioDeviceInput = null;
   }

   /**
    * Connects the current track to the specified MIDI device so that any incoming events will be
    * automatically played in real-time.
    * 
    * @param {MIDIInput} midiInput - MIDI device to which to connect the current track
    * @memberof Track
    * @instance
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MIDIInput MIDIInput}
    */
   function connectToMidiDevice(midiInput) {
      disconnectFromMidiDevice();
      midiInput.addEventListener('midimessage', midiEventReceived);
      midiDevice = midiInput;
   }

   /**
    * Connects the current track to the specified audio input device so that any incoming audio
    * will be automatically played in real-time.
    * 
    * @param {string} audioDeviceID - ID of the audio input device to which to connect the current track
    * @memberof Track
    * @instance
    */
   async function connectToAudioInputDevice(audioDeviceID) {
      disconnectFromAudioInputDevice();
      try {
         const audioStream = await navigator.mediaDevices.getUserMedia({ audio: {'deviceId': audioDeviceID}, video: false });
         audioDeviceInput = audioContext.createMediaStreamSource(audioStream);
         audioDeviceInput.connect(audioSink);
      }
      catch (err) {
         throw WebAudioApiErrors.WebAudioDeviceError('Unable to connect to the requested audio input device. Error was: ' + err);
      }
   }

   /**
    * Cancels any current or scheduled audio from playing on the current track.
    * 
    * @memberof Track
    * @instance
    */
   function clearTrack() {
      for (const source of audioSources)
         source.stop();
      for (const source of asyncAudioSources)
         source.sourceNode.stop();
   }

   /**
    * Deletes the current track and cancels any scheduled audio from playing or from starting
    * to play in the future.
    * 
    * @memberof Track
    * @instance
    */
   function deleteTrack() {
      disconnectFromMidiDevice();
      clearTrack();
      for (const effect of effects)
         effect.output.disconnect();
   }

   // Returns an object containing functions and attributes within the public Track namespace
   return {
      /**
       * Name of the {@link Track}.
       * @memberof Track
       * @instance
       */
      name,
      updateInstrument, removeInstrument, applyEffect, updateEffect, getCurrentEffectParameters, removeEffect, stopNoteAsync,
      playNoteAsync, playNote, playChord, playSequence, playClip, playFile, recordMidiClip, recordAudioClip, recordOutput,
      connectToMidiDevice, disconnectFromMidiDevice, connectToAudioInputDevice, disconnectFromAudioInputDevice, deleteTrack,
      clearTrack, getAnalysisBuffer
   };
}
