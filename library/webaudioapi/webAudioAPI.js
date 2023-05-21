import { Track } from './scripts/Track.js';
import { Duration, Note, Effect } from './scripts/Constants.js';
import { getAvailableInstruments, loadInstrument } from './scripts/InstrumentLibrary.js';
import { getAvailableReverbEffects, loadEffect } from './scripts/EffectLibrary.js';

class WebAudioAPI {
   #tracks = {};
 
   constructor() {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.beatBase = 4;
      this.globalVolume = 0.5;
      this.beatsPerMinute = 100;
      this.measureLengthSeconds = (60.0 / this.beatsPerMinute) * this.beatBase;
      this.volumeControl = this.audioContext.createGain();
      this.panningControl = this.audioContext.createStereoPanner();
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.sourceSinkNode = this.audioContext.createDelay(1);
      this.sourceSinkNode.connect(this.volumeControl)
                         .connect(this.panningControl)
                         .connect(this.compressor)
                         .connect(this.audioContext.destination);
      this.panningControl.pan.setValueAtTime(0.0, 0.0);
      this.sourceSinkNode.delayTime.setValueAtTime(0.0, 0.0);
      this.updateTempo(this.beatBase, this.beatsPerMinute, 4, 4);
      this.updateVolume(this.globalVolume);
   }
 
   get currentTime() {
      return this.audioContext.currentTime;
   }

   get availableInstruments() {
      return getAvailableInstruments();
   }

   get availableReverbEffects() {
      return getAvailableReverbEffects();
   }

   async retrieveInstrument(instrumentName) {
      return loadInstrument(this.audioContext, instrumentName);
   }

   async retrieveEffect(effectName) {
      return loadEffect(this.audioContext, effectName);
   }

   createTrack(trackName) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].delete();
      this.#tracks[trackName] = new Track(this, trackName, this.sourceSinkNode);
      return this.#tracks[trackName];
   }

   deleteTrack(trackName) {
      if (trackName in this.#tracks) {
         this.#tracks[trackName].delete();
         delete this.#tracks[trackName];
      }
   }
 
   deleteAllTracks() {
      this.volumeControl.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.01);
      for (const trackName in this.#tracks) {
         this.#tracks[trackName].delete();
         delete this.#tracks[trackName];
      }
      setTimeout((function() { this.audioContext.suspend(); }).bind(this), 200);
   }
 
   currentInstrumentName(trackName) {
      return (trackName in this.#tracks) ? this.#tracks[trackName].instrumentName : 'None';
   }

   changeInstrument(trackName, instrument) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].changeInstrument(instrument);
   }

   updateTempo(beatBase, beatsPerMinute, timeSignatureNumerator, timeSignatureDenominator) {
      this.beatBase = beatBase;
      this.beatsPerMinute = beatsPerMinute;
      this.measureLengthSeconds = (60.0 / beatsPerMinute) * beatBase * timeSignatureNumerator / timeSignatureDenominator;
   }

   updateVolume(percent) {
      this.globalVolume = percent;
      this.volumeControl.gain.setTargetAtTime(this.globalVolume, this.audioContext.currentTime, 0.01);
   }

   updatePanning(percent) {
      this.panningControl.pan.setTargetAtTime((2 * percent) - 1, this.audioContext.currentTime, 0.01);
   }

   updateTrackVolume(trackName, percent, updateTime) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].updateVolume(percent, updateTime);
   }

   updateTrackPanning(trackName, percent, updateTime) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].updatePanning(percent, updateTime);
   }

   async playNote(trackName, note, startTime, duration) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playNote(note, startTime, duration) : 0;
   }

   async playClip(trackName, buffer, startTime) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playClip(buffer, startTime) : null;
   }

   async playFile(trackName, file, startTime) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playFile(file, startTime) : null;
   }

   async startNote(trackName, note) {
      return (trackName in this.#tracks) ? await this.#tracks[trackName].playNoteAsync(note) : null;
   }

   stopNote(trackName, note) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].stopNoteAsync(note);
   }

   start() {
      this.volumeControl.gain.setTargetAtTime(this.globalVolume, this.audioContext.currentTime, 0.01);
      this.audioContext.resume();
   }
 
   stop() {
      this.volumeControl.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.01);
      setTimeout((function() { this.audioContext.suspend(); }).bind(this), 200);
   }
}

window.Note = Note;
window.Effect = Effect;
window.Duration = Duration;
window.WebAudioAPI = WebAudioAPI;
