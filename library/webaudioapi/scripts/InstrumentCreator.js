import { Note } from './Constants.js';
import { gzipSync } from './Fflate.js';

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

export async function createInstrument(fileList) {
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
