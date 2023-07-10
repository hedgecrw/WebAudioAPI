import { Note, Duration, EffectType } from './modules/Constants.mjs';
import { createTrack as createTrackImpl } from './modules/Track.mjs';
import { loadEffect, getEffectParameters } from './modules/Effect.mjs';
import { loadInstrument } from './modules/Instrument.mjs';
import * as WebAudioApiErrors from './modules/Errors.mjs';
import { version } from '../../package.json';

/**
 * Required function prototype to use when registering a MIDI device callback.
 * 
 * @callback MidiEventCallback
 * @param {MIDIMessageEvent} event - Object containing the detected MIDI event
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MIDIMessageEvent MIDIMessageEvent}
 */

/**
 * Composite object type for holding all tempo-related information.
 * 
 * @typedef {Object} Tempo
 * @property {number} beatBase - Note {@link module:Constants.Duration Duration} corresponding to a global beat
 * @property {number} beatsPerMinute - Number of global beats per minute
 * @property {number} timeSignatureNumerator - Number of beats per measure
 * @property {number} timeSignatureDenominator - Note {@link module:Constants.Duration Duration} corresponding to a measure beat
 * @property {number} measureLengthSeconds - Length (in seconds) of a measure
 */

/**
 * Composite object type for holding a set of concrete {@link Effect} parameter details.
 * 
 * @typedef {Object} EffectParameter
 * @property {string} name - Name of the effect parameter
 * @property {string} type - Type of effect parameter value (either "string" or "number")
 * @property {Array<string|number>} validValues - For "string" types, a listing of all valid values; for "number" types, the min/max values
 * @property {string|number} defaultValue - Default effect value before any updates
 */

/** Contains all WebAudioAPI top-level functionality. */
export class WebAudioAPI {

   // Singleton instance of the WebAudioAPI class
   static #instance = null;

   // WebAudioAPI private variable definitions
   #audioContext = new AudioContext(); #started = false; #midiCallbacks = {};
   #tracks = {}; #effects = []; #instrumentListing = {}; #loadedInstruments = {};
   #tempo = { measureLengthSeconds: (4 * 60.0 / 100.0), beatBase: 4, beatsPerMinute: 100, timeSignatureNumerator: 4, timeSignatureDenominator: 4 };

   // Required audio nodes
   /** @type {(null|MIDIAccess)} */
   #midiDeviceAccess = null;
   /** @type {DynamicsCompressorNode} */
   #compressorNode;
   /** @type {GainNode} */
   #sourceSinkNode;

   /**
    * Returns a singleton instance of the WebAudioAPI interface.
    */
   constructor() {
      // Create or return the singleton instance if it already exists
      if (WebAudioAPI.#instance)
         return WebAudioAPI.#instance;
      WebAudioAPI.#instance = this;
      
      // Generate and connect all required audio nodes
      this.#sourceSinkNode = new GainNode(this.#audioContext);
      this.#compressorNode = new DynamicsCompressorNode(this.#audioContext);
      this.#sourceSinkNode.connect(this.#compressorNode).connect(this.#audioContext.destination);
   }

   /**
    * Returns the current {@link WebAudioAPI} library version number.
    * 
    * @returns {string} Current library version number
    */
   getVersion() {
      return version;
   }
   
   /**
    * Returns the current global time since the {@link WebAudioAPI} library was started or
    * resumed using the {@link WebAudioAPI#start start()} function.
    * 
    * @returns {number} Current global time since the {@link WebAudioAPI} library was started
    */
   getCurrentTime() {
      return this.#audioContext.currentTime;
   }

   /**
    * Returns a full listing of recognized musical notes by the {@link WebAudioAPI} library.
    * 
    * This function can be used to enumerate available note options for displaying on a web page.
    * Note, however, that the `note` parameter passed to the {@link WebAudioAPI#playNote playNote()}
    * function must be the **numeric MIDI value** associated with a certain
    * {@link module:Constants.Note Note}, not a string-based key.
    * 
    * @returns {Object.<string, number>} Listing of recognized musical notes by the {@link WebAudioAPI} library
    * @see {@link module:Constants.Note Note}
    */
   getAvailableNotes() {
      return Note;
   }

   /**
    * Returns a full listing of recognized note durations by the {@link WebAudioAPI} library.
    * 
    * This function can be used to enumerate available duration options for displaying on a
    * web page. Note, however, that the `duration` parameter passed to the
    * {@link WebAudioAPI#playNote playNote()} function must be the **numeric value** associated
    * with a certain {@link module:Constants.Duration Duration}, not a string-based key.
    * 
    * @returns {Object.<string, number>} Listing of recognized note durations by the {@link WebAudioAPI} library
    * @see {@link module:Constants.Duration Duration}
    */
   getAvailableNoteDurations() {
      return Duration;
   }

   /**
    * Returns a listing of all available effects in the {@link WebAudioAPI} library.
    * 
    * This function can be used to enumerate available effect options for displaying on a
    * web page. Note, however, that the `effectType` parameter passed to either the
    * {@link WebAudioAPI#applyMasterEffect applyMasterEffect()} or the
    * {@link WebAudioAPI#applyTrackEffect applyTrackEffect()} function must be the
    * **numeric value** associated with a certain {@link module:Constants.EffectType EffectType},
    * not a string-based key.
    * 
    * @returns {Object.<string, number>} Listing of all available effect types in the {@link WebAudioAPI} library
    * @see {@link module:Constants.EffectType EffectType}
    */
   getAvailableEffects() {
      return EffectType;
   }

   /**
    * Returns a list of effect-specific {@link EffectParameter EffectParameters} for manipulation
    * in the `effectOptions` parameter of the {@link WebAudioAPI#updateMasterEffect updateMasterEffect()}
    * or the {@link WebAudioAPI#updateTrackEffect updateTrackEffect()} function.
    * 
    * This function can be used to enumerate available effect parameters for displaying on a
    * web page. Note, however, that the `effectType` parameter must be the **numeric value**
    * associated with a certain {@link module:Constants.EffectType EffectType}, not a
    * string-based key.
    * 
    * @param {number} effectType - {@link module:Constants.EffectType EffectType} for which to return a parameter list
    * @returns {EffectParameter[]} List of effect-specific parameters available for updating
    * @see {@link module:Constants.EffectType EffectType}
    * @see {@link EffectParameter}
    */
   getAvailableEffectParameters(effectType) {
      return getEffectParameters(effectType);
   }

   /**
    * Returns a listing of the available instruments located in the specified asset library.
    * 
    * Individual results from this function call can be passed directly to the
    * {@link WebAudioAPI#updateInstrument updateInstrument()} function to load a specific
    * instrument into an audio track.
    * 
    * @param {string} instrumentLibraryLocation - Absolute or relative URL pointing to a {@link WebAudioAPI} instrument library
    * @returns {Promise<string[]>} Listing of all available instrument names
    */
   async getAvailableInstruments(instrumentLibraryLocation) {
      if (Object.keys(this.#instrumentListing).length === 0) {
         this.#instrumentListing['Synthesizer'] = null;
         const cleanLocation = instrumentLibraryLocation.replace(/\/$/, '');
         const response = await fetch(cleanLocation + '/instrumentLibrary.json', {
            headers: { 'Accept': 'application/json' }
         });
         const instrumentData = await response.json();
         Object.keys(instrumentData).forEach(instrumentName => {
            this.#instrumentListing[instrumentName] = cleanLocation + instrumentData[instrumentName];
         });
      }
      return Object.keys(this.#instrumentListing);
   }

   /**
    * Returns a listing of the available MIDI devices connected to the client device.
    * 
    * Individual results from this function call can be passed directly to the
    * {@link connectMidiDeviceToTrack()} function to attach a MIDI device to a specified audio track.
    * 
    * @returns {Promise<string[]>} Listing of all available MIDI devices connected to the client device
    */
   async getAvailableMidiDevices() {
      let midiDevices = [];
      if (navigator.requestMIDIAccess && this.#midiDeviceAccess === null) {
         try {
            this.#midiDeviceAccess = await navigator.requestMIDIAccess();
            for (const midiDevice of this.#midiDeviceAccess.inputs.values())
               midiDevices.push(midiDevice.name);
         } catch (err) {
            this.#midiDeviceAccess = null;
            throw WebAudioApiErrors.MidiError('MIDI permissions are required in order to enumerate available MIDI devices!');
         }
      }
      return midiDevices;
   }

   /**
    * Creates a track capable of playing sequential audio. A single track can only utilize a
    * single instrument at a time.
    * 
    * @param {string} name - Name of the newly created track
    */
   createTrack(name) {
      this.removeTrack(name);
      this.#tracks[name] = createTrackImpl(name, this.#audioContext, this.#tempo, this.#sourceSinkNode);
   }

   /**
    * Removes the specified audio track and cancels any audio scheduled for playback on this
    * track from playing or starting to play in the future.
    * 
    * @param {string} name - Name of the track to remove
    */
   removeTrack(name) {
      if (name in this.#tracks) {
         this.#tracks[name].deleteTrack();
         delete this.#tracks[name];
      }
   }

   /**
    * Removes all existing audio tracks and cancels all current and scheduled audio.
    */
   removeAllTracks() {
      for (const name in this.#tracks)
         this.removeTrack(name);
   }

   /**
    * Updates the instrument used to play back audio on the specified track.
    * 
    * The instrument name must refer to a valid instrument as returned by the
    * {@link WebAudioAPI#getAvailableInstruments getAvailableInstruments()} function.
    * 
    * @param {string} trackName - Name of the track for which to update the instrument
    * @param {string} instrumentName - Name of the instrument to assign to the track
    */
   async updateInstrument(trackName, instrumentName) {
      if (trackName in this.#tracks && instrumentName in this.#instrumentListing) {
         if (!(instrumentName in this.#loadedInstruments))
            this.#loadedInstruments[instrumentName] = await loadInstrument(this.#audioContext, instrumentName, this.#instrumentListing[instrumentName]);
         this.#tracks[trackName].updateInstrument(this.#loadedInstruments[instrumentName]);
      }
   }

   /**
    * Removes the instrument used to play back audio on the specified track.
    * 
    * @param {string} trackName - Name of the track from which to remove the current instrument
    */
   async removeInstrument(trackName) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].removeInstrument();
   }

   /**
    * Updates the global tempo parameters for all audio tracks.
    * 
    * The `beatBase` parameter should correspond to the beat scaling factor associated with one of
    * the note durations from {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()}.
    * 
    * Any parameter may be set to `null` to keep it unchanged between consecutive function calls.
    * 
    * @param {(number|null)} beatBase - Note {@link module:Constants.Duration Duration} corresponding to a global beat
    * @param {(number|null)} beatsPerMinute - Number of global beats per minute
    * @param {(number|null)} timeSignatureNumerator - Number of beats per measure
    * @param {(number|null)} timeSignatureDenominator - Note {@link module:Constants.Duration Duration} corresponding to a measure beat
    */
   updateTempo(beatBase, beatsPerMinute, timeSignatureNumerator, timeSignatureDenominator) {
      this.#tempo.beatBase = beatBase ? beatBase : this.#tempo.beatBase;
      this.#tempo.beatsPerMinute = beatsPerMinute ? beatsPerMinute : this.#tempo.beatsPerMinute;
      this.#tempo.timeSignatureNumerator = timeSignatureNumerator ? timeSignatureNumerator : this.#tempo.timeSignatureNumerator;
      this.#tempo.timeSignatureDenominator = timeSignatureDenominator ? timeSignatureDenominator : this.#tempo.timeSignatureDenominator;
      this.#tempo.measureLengthSeconds = (60.0 / this.#tempo.beatsPerMinute) * this.#tempo.beatBase * this.#tempo.timeSignatureNumerator / this.#tempo.timeSignatureDenominator;
   }

   /**
    * Applies a new master effect to the aggregate output from all tracks at the specified time.
    * 
    * Calling this function affects the sequential ordering in which master effects will be
    * processed, with each new call appending the corresponding effect to the *end* of the
    * processing sequence.
    * 
    * The parameters of the added effect will be set to their default values such that the result
    * of adding the effect will not be audible. In order to manipulate and utilize this effect,
    * use the {@link WebAudioAPI#updateMasterEffect updateMasterEffect()} function.
    * 
    * If a master effect with the specified `effectName` has already been applied, then calling
    * this function will simply re-order the effect to move it to the very end of the effect
    * processing sequence, without changing its parameter values.
    * 
    * @param {string} effectName - User-defined name to associate with the master effect
    * @param {number} effectType - Master {@link module:Constants.EffectType EffectType} to apply
    * @see {@link module:Constants.EffectType EffectType}
    */
   async applyMasterEffect(effectName, effectType) {
      const existingEffect = await this.removeMasterEffect(effectName);
      const newEffect = existingEffect ? existingEffect : await loadEffect(this.#audioContext, effectName, effectType);
      newEffect.output.connect(this.#compressorNode);
      if (this.#effects.length) {
         const previousEffect = this.#effects.slice(-1)[0];
         previousEffect.output.disconnect();
         previousEffect.output.connect(newEffect.input);
      }
      else {
         this.#sourceSinkNode.disconnect();
         this.#sourceSinkNode.connect(newEffect.input);
      }
      this.#effects.push(newEffect);
   }

   /**
    * Applies a new effect to the specified track at the specified time.
    * 
    * Calling this function affects the sequential ordering in which effects will be processed
    * within the specified track, with each new call appending the corresponding effect to the
    * *end* of the processing sequence.
    * 
    * The parameters of the added effect will be set to their default values such that the result
    * of adding the effect will not be audible. In order to manipulate and utilize this effect,
    * use the {@link WebAudioAPI#updateTrackEffect updateTrackEffect()} function.
    * 
    * If an effect with the specified `effectName` has already been applied to the specified
    * track, then calling this function will simply re-order the effect to move it to the very end
    * of the effect processing sequence, without changing its parameter values.
    * 
    * @param {string} trackName - Name of the track on which to apply the effect
    * @param {string} effectName - User-defined name to associate with the track effect
    * @param {number} effectType - Track-specific {@link module:Constants.EffectType EffectType} to apply
    * @see {@link module:Constants.EffectType EffectType}
    */
   async applyTrackEffect(trackName, effectName, effectType) {
      if (trackName in this.#tracks)
         await this.#tracks[trackName].applyEffect(effectName, effectType);
   }

   /**
    * Updates the intensity and parameters of a master effect at the specified time.
    * 
    * Calling this function will **not** affect the sequential processing order of any applied
    * effects.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {string} effectName - Name of the master effect to be updated
    * @param {Object} effectOptions - Effect-specific options (TODO)
    * @param {number} percent - Intensity of the effect as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async updateMasterEffect(effectName, effectOptions, percent, updateTime) {
      // TODO: Verify percent within valid range, Errors.mjs
      for (const effect of this.#effects)
         if (effect.name == effectName)
            return await effect.update(effectOptions, percent, updateTime);
      return false;
   }

   /**
    * Updates the intensity and parameters of a track-specific effect at the specified time.
    * 
    * Calling this function will **not** affect the sequential processing order of any applied
    * effects.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {string} trackName - Name of the track for which to update the effect
    * @param {string} effectName - Name of the track effect to be updated
    * @param {Object} effectOptions - Effect-specific options (TODO)
    * @param {number} percent - Intensity of the effect as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async updateTrackEffect(trackName, effectName, effectOptions, percent, updateTime) {
      // TODO: Verify percent within valid range, Errors.mjs
      return (trackName in this.#tracks) ? await this.#tracks[trackName].updateEffect(effectName, effectOptions, percent, updateTime) : false;
   }

   /**
    * Removes the specified master effect from being applied.
    * 
    * @param {string} effectName - Name of the master effect to be removed
    * @returns {Promise<Effect|null>} The effect that was removed, if any
    * @see {@link Effect}
    */
   async removeMasterEffect(effectName) {
      let existingEffect = null;
      for (const [index, effect] of this.#effects.entries())
         if (effect.name == effectName) {
            existingEffect = this.#effects.splice(index, 1)[0];
            if (index == 0) {
               this.#sourceSinkNode.disconnect();
               this.#sourceSinkNode.connect(this.#effects.length ? this.#effects[0].input : this.#compressorNode);
            }
            else {
               this.#effects[index-1].output.disconnect();
               this.#effects[index-1].output.connect((this.#effects.length > index) ? this.#effects[index].input : this.#compressorNode);
            }
            existingEffect.input.disconnect();
            existingEffect.output.disconnect();
            break;
         }
      return existingEffect;
   }

   /**
    * Removes the specified effect from being applid on the corresponding track.
    * 
    * @param {string} trackName - Name of the track from which to remove the effect
    * @param {string} effectName - Name of the track effect to be removed
    */
   async removeTrackEffect(trackName, effectName) {
      if (trackName in this.#tracks)
         await this.#tracks[trackName].removeEffect(effectName);
   }

   /**
    * Registers a callback function to receive incoming events from the specified MIDI device.
    * 
    * The `midiEventCallback` parameter should be a function that receives one parameter of type
    * {@link https://developer.mozilla.org/en-US/docs/Web/API/MIDIMessageEvent MIDIMessageEvent}.
    * 
    * **Note:** A callback may be registered for a MIDI device that is also connected to an audio
    * track; however, only one top-level event callback can be registered to a MIDI device at
    * a time.
    * 
    * @param {string} midiDeviceName - Name of the MIDI device for which to receive events
    * @param {MidiEventCallback} midiEventCallback - Callback to fire when a MIDI event is received
    * @returns {boolean} Whether the event callback registration was successful
    */
   registerMidiDeviceCallback(midiDeviceName, midiEventCallback) {
      this.deregisterMidiDeviceCallback(midiDeviceName);
      if (this.#midiDeviceAccess) {
         for (const midiDevice of this.#midiDeviceAccess.inputs.values())
            if (midiDeviceName == midiDevice.name) {
               midiDevice.addEventListener('midimessage', midiEventCallback);
               this.#midiCallbacks[midiDeviceName] = { device: midiDevice, callback: midiEventCallback };
               return true;
            }
      }
      return false;
   }

   /**
    * Removes a user-registered callback from the specified MIDI device so that it will no
    * longer fire upon reception of a MIDI event.
    * 
    * @param {string} midiDeviceName - Name of the MIDI device for which to stop receiving events
    */
   deregisterMidiDeviceCallback(midiDeviceName) {
      if (midiDeviceName in this.#midiCallbacks) {
         const midiObject = this.#midiCallbacks[midiDeviceName];
         midiObject.device.removeEventListener('midimessage', midiObject.callback);
         delete this.#midiCallbacks[midiDeviceName];
      }
   }

   /**
    * Connects a MIDI device to the specified audio track.
    * 
    * **Note:** A single MIDI device can be connected to multiple audio tracks, but an audio track
    * can only be connected to a single MIDI device.
    * 
    * @param {string} trackName - Name of the track to which to connect the MIDI device
    * @param {string} midiDeviceName - Name of the MIDI device to connect to the track
    * @returns {Promise<boolean>} Whether connecting the MIDI device to the track was successful
    */
   async connectMidiDeviceToTrack(trackName, midiDeviceName) {
      if (this.#midiDeviceAccess && trackName in this.#tracks) {
         for (const midiDevice of this.#midiDeviceAccess.inputs.values())
            if (midiDeviceName == midiDevice.name)
               return this.#tracks[trackName].connectToMidiDevice(midiDevice);
      }
      return false;
   }

   /**
    * Disconnects all MIDI devices from the specified audio track.
    * 
    * @param {string} trackName - Name of the track from which to disconnect the MIDI device
    */
   async disconnectMidiDeviceFromTrack(trackName) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].disconnectFromMidiDevice();
   }

   /**
    * Schedules a note to be played on a specific track for some duration of time.
    * 
    * Note that the `duration` parameter should correspond to the beat scaling factor
    * associated with one of the note durations from
    * {@link WebAudioAPI#getAvailableNoteDurations getAvailableNoteDurations()}.
    * Likewise, the `note` parameter should correspond to a MIDI note number as
    * associated with one of the notes returned from
    * {@link WebAudioAPI#getAvailableNotes getAvailableNotes()}.
    * 
    * @param {string} trackName - Name of the track on which to play the note
    * @param {number} note - MIDI {@link module:Constants.Note Note} number to be played
    * @param {number} startTime - Global API time at which to start playing the note
    * @param {number} duration - {@link module:Constants.Duration Duration} for which to continue playing the note
    * @param {number} [velocity=0.75] - Intensity of the note being played between [0.0, 1.0]
    * @returns {Promise<number>} Duration (in seconds) of the note being played
    * @see {@link module:Constants.Note Note}
    * @see {@link module:Constants.Duration Duration}
    */
   async playNote(trackName, note, startTime, duration, velocity=0.75) {
      // TODO: Verify velocity within valid range, Errors.mjs
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playNote(note, velocity, startTime, duration) : 0;
   }

   /**
    * Schedules an audio clip to be played on a specific track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio clip will
    * play to completion.
    * 
    * @param {string} trackName - Name of the track on which to play the clip
    * @param {ArrayBuffer} buffer - Buffer containing raw, audio-encoded data
    * @param {number} startTime - Global API time at which to start playing the clip
    * @param {number|null} [duration] - Number of seconds for which to continue playing the clip
    * @returns {Promise<number>} Duration (in seconds) of the clip being played
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer ArrayBuffer}
    */
   async playClip(trackName, buffer, startTime, duration) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playClip(buffer, startTime, duration) : 0;
   }

   /**
    * Schedules an audio file to be played on a specific track for some duration of time.
    * 
    * If the `duration` parameter is not specified or is set to `null`, the audio file will
    * play to completion.
    * 
    * @param {string} trackName - Name of the track on which to play the file
    * @param {string} fileURL - URL location pointing to an audio file
    * @param {string} startTime - Global API time at which to start playing the file
    * @param {number|null} [duration] - Number of seconds for which to continue playing the file
    * @returns {Promise<number>} Duration (in seconds) of the file being played
    */
   async playFile(trackName, fileURL, startTime, duration) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playFile(fileURL, startTime, duration) : 0;
   }

   /**
    * Immediately begins playing a note on the specified track. Playback continues until the note
    * is explicitly stopped using the {@link WebAudioAPI#stopNote stopNote()} function.
    * 
    * Note that the `note` parameter should correspond to a MIDI note number as associated
    * with one of the notes returned from {@link WebAudioAPI#getAvailableNotes getAvailableNotes()}.
    * 
    * @param {string} trackName - Name of the track on which to start playing the note
    * @param {number} note - MIDI {@link module:Constants.Note Note} number to be played
    * @param {number} [velocity=0.75] - Intensity of the note to play between [0.0, 1.0]
    * @returns {Promise<Object>} Reference to the newly scheduled note
    * @see {@link module:Constants.Note Note}
    */
   async startNote(trackName, note, velocity=0.75) {
      // TODO: Verify velocity within valid range, Errors.mjs
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playNoteAsync(note, velocity) : {};
   }

   /**
    * Immediately stop playing a note on the specified track. The note to be stopped must be a
    * reference to an actively playing note that was previously returned from the
    * {@link WebAudioAPI#startNote startNote()} function.
    * 
    * @param {string} trackName - Name of the track on which to stop playing the note
    * @param {Object} note - Reference to an active note that was started using {@link WebAudioAPI#startNote startNote()}
    */
   async stopNote(trackName, note) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].stopNoteAsync(note);
   }

   /**
    * Starts the {@link WebAudioAPI} library and allows audio playback to resume.
    */
   async start() {
      this.#started = true;
      await this.#audioContext.resume();
   }
 
   /**
    * Stops the {@link WebAudioAPI} library and pauses any currently playing audio.
    */
   stop() {
      this.#started = false;
      setTimeout(async () => { if (!this.#started) await this.#audioContext.suspend(); }, 200);
   }
}

// Attach a WebAudioAPI reference to "window" so that it can be accessed from non-module Javascript files
window.WebAudioAPI = WebAudioAPI;
