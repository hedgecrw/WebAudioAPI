import { Note } from './Constants.js'
import { decompressSync } from './Fflate.js';

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

async function loadNotesAndInterpolate(audioContext, instrumentData, noteData, missingData) {
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

export class Instrument {
   #noteData = [];

   constructor(name) {
      this.name = name;
   }

   async #loadFromDataBuffer(audioContext, instrumentData) {
      const noteData = [], missingData = [];
      await loadNotesAndInterpolate(audioContext, instrumentData, noteData, missingData);
      for (let i = 0; i < noteData.length; ++i)
         this.#noteData[i] = (noteData[i] === undefined) ? missingData[i] : noteData[i];
   }

   async #load(audioContext, url) {
      console.log('Loading instrument:', this.name + '...');
      const response = await fetch(url);
      const resource = await response.arrayBuffer();
      await this.#loadFromDataBuffer(audioContext, new Uint8Array(resource));
   }

   static async loadInstrument(audioContext, name, url) {
      const instrument = new Instrument(name);
      const loadPromise = instrument.#load(audioContext, url);
      return new Promise(async resolve => { await loadPromise; resolve(instrument); });
   }

   getNote(audioContext, note) {
      return new AudioBufferSourceNode(audioContext, this.#noteData[note]);
   }
}
