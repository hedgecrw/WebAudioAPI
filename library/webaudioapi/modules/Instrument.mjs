/**
 * Module containing all instrument-specific {@link WebAudioAPI} functionality.
 * @module Instrument
 */

/**
 * Object containing all instrument-specific {@link WebAudioAPI} functionality.
 * @namespace Instrument
 * @global
 */

import { Frequency, Note } from './Constants.mjs';
import { decompressSync } from './Fflate.js';

/**
 * Loads an existing {@link Instrument} object capable of mapping audio data to musical output.
 * 
 * If the `url` parameter is set to `null`, a sine-wave oscillator will be used to generate
 * all audio output.
 * 
 * @param {AudioContext} audioContext - Reference to the global browser {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @param {string} name - Name of the instrument to load
 * @param {string|null} url - URL pointing to the instrument data to load or `null`
 * @returns {Promise<Instrument>} Newly loaded {@link Instrument}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @see {@link Instrument}
 * @async
 */
export async function loadInstrument(audioContext, name, url) {

   // Private internal Instrument functions
   function loadNumberFromArray(array, numBytes, offset) {
      let number = 0;
      for (let i = numBytes - 1; i >= 0; --i)
         number = (number * 256) + array[offset + i];
      return number;
   }
   
   function findClosestValidNote(noteData, noteIndex) {
      let nearestLowerNote = -10000, nearestHigherNote = 10000;
      for (let i = noteIndex - 1; i >= 0; --i)
         if (noteData[i] !== undefined) {
            nearestLowerNote = i;
            break;
         }
      for (let i = noteIndex + 1; i < noteData.length; ++i)
         if (noteData[i] !== undefined) {
            nearestHigherNote = i;
            break;
         }
      return ((noteIndex - nearestLowerNote) > (nearestHigherNote - noteIndex)) ? nearestHigherNote : nearestLowerNote;
   }
   
   function fillInMissingNotes(noteData, missingData) {
      for (let note = 0; note < noteData.length; ++note)
         if (noteData[note] === undefined) {
            const closestValidNote = findClosestValidNote(noteData, note);
            missingData[note] = {
               'buffer': noteData[closestValidNote].buffer,
               'detune': 100 * (note - closestValidNote)
            };
         }
   }
   
   async function loadNotesAndInterpolate(instrumentData, noteData, missingData) {
      let noteIndex = 2;
      noteData.length = missingData.length = 1 + Note['B9'];
      const numValidNotes = loadNumberFromArray(instrumentData, 2, 0);
      for (let i = 0; i < numValidNotes; ++i) {
         const note = loadNumberFromArray(instrumentData, 2, noteIndex);
         noteIndex += 2;
         const noteOffset = loadNumberFromArray(instrumentData, 4, noteIndex);
         noteIndex += 4;
         const noteOffsetEnd = loadNumberFromArray(instrumentData, 4, noteIndex);
         noteIndex += 4;
         noteData[note] = {
            'buffer': await audioContext.decodeAudioData(decompressSync(instrumentData.slice(noteOffset, noteOffsetEnd)).buffer),
            'detune': 0 };
      }
      fillInMissingNotes(noteData, missingData);
   }
   
   async function loadInstrument(url) {
      const noteData = [], foundData = [], missingData = [];
      const response = await fetch(url);
      const resource = await response.arrayBuffer();
      const instrumentData = new Uint8Array(resource);
      await loadNotesAndInterpolate(instrumentData, foundData, missingData);
      for (let i = 0; i < foundData.length; ++i)
         noteData[i] = (foundData[i] === undefined) ? missingData[i] : foundData[i];
      return noteData;
   }

   // Create an instance of the Instrument object
   const instrumentInstance = {
      /**
       * Name of the {@link Instrument}.
       * @memberof Instrument
       * @instance
       */
      name,

      /**
       * Returns an {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode AudioScheduledSourceNode}
       * that can be used to play back the specified MIDI `note`.
       * 
       * @function
       * @param {number} note - MIDI note number for which to generate a playable note
       * @memberof Instrument
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode AudioScheduledSourceNode}
       */
      getNote: null
   };

   // Actually load and return the instrment
   console.log('Loading instrument:', name + '...');
   if (url == null) {
      instrumentInstance.getNote = function (note) {
         return new OscillatorNode(audioContext, { frequency: Frequency[note] });
      };
   }
   else {
      const noteData = await loadInstrument(url);
      instrumentInstance.getNote = function (note) {
         return new AudioBufferSourceNode(audioContext, noteData[note]);
      };
   }
   return instrumentInstance;
}
