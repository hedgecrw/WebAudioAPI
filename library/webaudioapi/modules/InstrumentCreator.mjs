/**
 * Module containing all {@link WebAudioAPI} instrument creation functionality.
 * 
 * @module InstrumentCreator
 */

/**
 * Object containing all {@link WebAudioAPI} instrument creation functionality.
 * @namespace InstrumentCreator
 * @global
 */

import { Note } from './Constants.mjs';
import { gzipSync } from './Fflate.js';

/**
 * Generates the raw data needed to load into an {@link Instrument} object.
 * 
 * The `fileList` parameter should contain an array of audio files representing individual notes
 * being played on the specified instrument. The naming format of the audio files **must** be:
 * 
 * [NOTE][OCTAVE][MODIFIER].[EXTENSION]
 * 
 * where the letters 's', 'ss', 'b', or 'bb' should be used for the MODIFIER to indicate a '♯',
 * '♯♯', '♭', or '♭♭', respectively. As an example, a WAV audio file for note 'F4♭' would be
 * 'F4b.wav', and an OGG audio file for note 'C2' would be 'C2.ogg'.
 * 
 * @param {string[]} fileList - List of audio files from which to create the new {@link Instrument} data
 * @returns {Uint8Array} Data ready to be loaded into an {@link Instrument}
 * @async
 */
export async function createInstrument(fileList) {
   
   // Private internal InstrumentCreator functions
   function storeNumberInArray(array, number, numBytes, offset) {
      for (let i = 0; i < numBytes; ++i) {
         const byte = number & 0xFF;
         array[offset + i] = byte;
         number = (number - byte) / 256;
      }
   }

   function parseNoteValueFromFileName(fileName) {
      const noteName = fileName.split('.').slice(0, -1).join('.');
      return Note.hasOwnProperty(noteName) ? Note[noteName] : false;
   }

   async function parseNoteData(fileList, compressedNoteData) {
      let numValidNotes = 0, totalCompressedLength = 0;
      for (const file of fileList) {
         const noteValue = parseNoteValueFromFileName(file.name);
         if (noteValue === false)
            window.dispatchEvent(new CustomEvent('invalidfilename', { detail: file.name }));
         else {
            compressedNoteData[noteValue] = gzipSync(new Uint8Array(await file.arrayBuffer()), { level: 9, mem: 8 });
            totalCompressedLength += compressedNoteData[noteValue].length;
            ++numValidNotes;
         }
      }
      return [numValidNotes, totalCompressedLength];
   }

   // Create an array containing all of the data necessary to load into an Instrument
   const compressedNoteData = {};
   const [numParsedNotes, compressedLength] = await parseNoteData(fileList, compressedNoteData);
   const instrumentData = new Uint8Array(2 + (10 * numParsedNotes) + compressedLength);
   let noteIndex = 2, noteOffset = 2 + (10 * numParsedNotes);
   storeNumberInArray(instrumentData, numParsedNotes, 2, 0);
   for (const note in compressedNoteData) {
      storeNumberInArray(instrumentData, Number(note), 2, noteIndex);
      noteIndex += 2;
      storeNumberInArray(instrumentData, noteOffset, 4, noteIndex);
      noteIndex += 4;
      instrumentData.set(compressedNoteData[note], noteOffset);
      noteOffset += compressedNoteData[note].length;
      storeNumberInArray(instrumentData, noteOffset, 4, noteIndex);
      noteIndex += 4;
   }
   return instrumentData;
}
