/**
 * Module containing functionality to create new {@link WebAudioAPI} tracks.
 * @module Track
 */

/**
 * Object containing all track-specific {@link WebAudioAPI} functionality.
 * @namespace Track
 * @global
 */

import { MidiCommand, getMidiCommand, getMidiNote, getMidiVelocity } from './Midi.mjs';
import { loadEffect } from './Effect.mjs';

/**
 * Creates a new audio {@link Track} object capable of playing sequential audio.
 * 
 * @param {string} name - Name of the track to create
 * @param {AudioContext} audioContext - Reference to the global browser {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @param {Tempo} tempo - Reference to the {@link Tempo} object stored in the global {@link WebAudioAPI} object
 * @param {AudioNode} trackAudioSink - Reference to the {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode} to which the output of this track should be connected
 * @returns {Track} Newly created audio {@link Track}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
 * @see {@link Track}
 * @see {@link Tempo}
 */
export function createTrack(name, audioContext, tempo, trackAudioSink) {

   // Track-local variable definitions
   let instrument = null, midiDevice = null;
   const audioSources = [], asyncAudioSources = [], effects = [];
   const audioSink = new GainNode(audioContext);
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
      const newEffect = existingEffect ? existingEffect : await loadEffect(audioContext, effectName, effectType);
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
    * @param {Object} effectOptions - Effect-specific options (TODO)
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    * @memberof Track
    * @instance
    */
   async function updateEffect(effectName, effectOptions, updateTime) {
      for (const effect of effects)
         if (effect.name == effectName)
            return await effect.update(effectOptions, updateTime);
      return false;
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
      if (instrument) {
         const noteSource = instrument.getNote(note); // TODO: Method to getNoteContinuous so it loops
         const noteVolume = new GainNode(audioContext);
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(velocity, 0.0);
         const noteStorage = createAsyncNote(note, noteSource, noteVolume);
         noteSource.onended = stopNoteAsync.bind(this, noteStorage); // TODO: Don't need this if continuous instrument
         asyncAudioSources.push(noteStorage);
         noteSource.start(audioContext.currentTime);
         return noteStorage;
      }
      return null;
   }

   /**
    * Schedules a note to be played on the current track for some duration of time.
    * 
    * Note that the `duration` parameter should correspond to the beat scaling factor
    * associated with one of the note durations from
    * {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()}.
    * Likewise, the `note` parameter should correspond to a valid MIDI note number.
    * 
    * @param {number} note - MIDI {@link module:Constants.Note Note} number to be played
    * @param {number} velocity - Intensity of the note being played between [0.0, 1.0]
    * @param {number} startTime - Global API time at which to start playing the note
    * @param {number} duration - {@link module:Constants.Duration Duration} for which to continue playing the note
    * @returns {number} Duration (in seconds) of the note being played
    * @memberof Track
    * @instance
    */
   function playNote(note, velocity, startTime, duration) {
      if (instrument) {
         const durationSeconds = 60.0 / ((duration / tempo.beatBase) * tempo.beatsPerMinute);
         const noteSource = instrument.getNote(note);
         const noteVolume = new GainNode(audioContext);
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(velocity, 0.0);
         noteVolume.gain.setTargetAtTime(0.0, startTime + durationSeconds - 0.03, 0.03);
         noteSource.onended = sourceEnded.bind(this, noteSource, noteVolume);
         audioSources.push(noteSource);
         noteSource.start(startTime);
         noteSource.stop(startTime + durationSeconds);
         return durationSeconds;
      }
      return 0;
   }

   /**
    * Schedules an audio clip to be played on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio clip will
    * play to completion.
    * 
    * @param {ArrayBuffer} buffer - Buffer containing raw, audio-encoded data
    * @param {number} startTime - Global API time at which to start playing the clip
    * @param {number|null} [duration] -  Number of seconds for which to continue playing the clip
    * @returns {Promise<number>} Duration (in seconds) of the clip being played
    * @memberof Track
    * @instance
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer ArrayBuffer}
    */
   async function playClip(buffer, startTime, duration) {
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      const clipSource = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
      audioSources.push(clipSource);
      if (duration) {
         const clipVolume = new GainNode(audioContext);
         clipSource.connect(clipVolume).connect(audioSink);
         clipVolume.gain.setTargetAtTime(0.0, startTime + duration - 0.03, 0.03);
         clipSource.onended = sourceEnded.bind(this, clipSource, clipVolume);
         clipSource.start(startTime, 0, duration);
      }
      else {
         clipSource.connect(audioSink);
         clipSource.onended = sourceEnded.bind(this, clipSource, null);
         clipSource.start(startTime);
      }
      return (duration && (duration < audioBuffer.duration)) ? duration : audioBuffer.duration;
   }

   /**
    * Schedules an audio file to be played on the current track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio file will
    * play to completion.
    * 
    * @param {string} fileURL - URL location pointing to an audio file
    * @param {number} startTime - Global API time at which to start playing the file
    * @param {number|null} [duration] - Number of seconds for which to continue playing the file
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
    * Connects the current track to the specified MIDI device so that any incoming events will be
    * automatically played in real-time.
    * 
    * @param {MIDIInput} midiInput - MIDI device to which to connect the current track
    * @returns {boolean}  Whether connection to the MIDI device was successful
    * @memberof Track
    * @instance
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MIDIInput MIDIInput}
    */
   function connectToMidiDevice(midiInput) {
      disconnectFromMidiDevice();
      midiInput.addEventListener('midimessage', midiEventReceived);
      midiDevice = midiInput;
      return true;
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
      for (const source of audioSources)
         source.stop();
      for (const source of asyncAudioSources)
         source.sourceNode.stop();
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
      updateInstrument, removeInstrument, applyEffect, updateEffect, removeEffect, stopNoteAsync,
      playNoteAsync, playNote, playClip, playFile, connectToMidiDevice, disconnectFromMidiDevice, deleteTrack
   };
}
