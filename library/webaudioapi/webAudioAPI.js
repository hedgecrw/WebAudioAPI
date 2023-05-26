import { Duration, Note } from './scripts/Constants.js';
import { createTrack as createTrackImpl } from './scripts/Track.js';
import { Instrument } from './scripts/Instrument.js';
import { Effect } from './scripts/Effect.js';

class WebAudioAPI {
   #tracks = {};
   #effectListing = {};
   #instrumentListing = {};
 
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
      return Object.keys(this.#instrumentListing);
   }

   get availableEffects() {
      return Object.keys(this.#effectListing);
   }

   async loadInstrumentAssets(instrumentAssetsLibraryLocation) {
      const cleanLocation = instrumentAssetsLibraryLocation.replace(/\/$/, '');
      const response = await fetch(cleanLocation + '/instrumentLibrary.json', {
         headers: { 'Accept': 'application/json' }
      });
      const instrumentListing = await response.json();
      Object.keys(instrumentListing).forEach((instrumentName) => {
         this.#instrumentListing[instrumentName] = cleanLocation + instrumentListing[instrumentName];
      });
   }

   async loadEffectAssets(effectAssetsLibraryLocation) {
      const cleanLocation = effectAssetsLibraryLocation.replace(/\/$/, '');
      const response = await fetch(cleanLocation + '/effectLibrary.json', {
         headers: { 'Accept': 'application/json' }
      });
      const effectListing = await response.json();
      Object.keys(effectListing).forEach((effectName) => {
         this.#effectListing[effectName] = cleanLocation + effectListing[effectName];
      });
   }

   async retrieveInstrument(instrumentName) {
      return (instrumentName in this.#instrumentListing) ?
         await Instrument.loadInstrument(this.audioContext, instrumentName, this.#instrumentListing[instrumentName]) :
         null;
   }

   async retrieveEffect(effectName) {
      return (effectName in this.#effectListing) ?
         await Effect.loadEffect(this.audioContext, effectName, this.#effectListing[effectName]) :
         null;
   }

   createTrack(trackName) {
      if (trackName in this.#tracks)
         this.#tracks[trackName].deleteTrack();
      this.#tracks[trackName] = createTrackImpl(this, trackName, this.sourceSinkNode);
      return this.#tracks[trackName];
   }

   deleteTrack(trackName) {
      if (trackName in this.#tracks) {
         this.#tracks[trackName].deleteTrack();
         delete this.#tracks[trackName];
      }
   }
 
   deleteAllTracks() {
      this.volumeControl.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.01);
      for (const trackName in this.#tracks) {
         this.#tracks[trackName].deleteTrack();
         delete this.#tracks[trackName];
      }
      setTimeout((function() { this.audioContext.suspend(); }).bind(this), 200);
   }
 
   currentInstrumentName(trackName) {
      return (trackName in this.#tracks) ? this.#tracks[trackName].instrumentName() : 'None';
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
