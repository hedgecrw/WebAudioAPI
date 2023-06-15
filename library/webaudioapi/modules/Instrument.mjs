/**
 * Contains all instrument-specific WebAudioAPI functionality.
 * 
 * @module Instrument
 */

import { Frequency, Note } from './Constants.mjs';
import { decompressSync } from './Fflate.js';

export async function loadInstrument(audioContext, name, url) {

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

   console.log('Loading instrument:', name + '...');
   if (url == null) {
      function getNote(note) {
         return new OscillatorNode(audioContext, { frequency: Frequency[note] });
      }
      return { name, getNote };
   }
   else {
      const noteData = await loadInstrument(url);
      function getNote(note) {
         return new AudioBufferSourceNode(audioContext, noteData[note]);
      }
      return { name, getNote };
   }
}
