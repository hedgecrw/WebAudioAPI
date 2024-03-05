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
import { InstrumentEncodingType } from './Constants.mjs';
import { WebmOpusEncoder } from './WebmOpusEncoder.mjs';

/**
 * Generates the raw data needed to load into an {@link Instrument} object.
 * 
 * The `fileList` parameter should contain an array of audio files representing individual notes
 * being played on the specified instrument. The naming format of the audio files **must** be either:
 * 
 * [MIDI_NOTE_NUMBER].[EXTENSION]
 * 
 * or
 * 
 * [NOTE][OCTAVE][MODIFIER].[EXTENSION]
 * 
 * where the letters 's', 'ss', 'b', or 'bb' should be used for the MODIFIER to indicate a '♯',
 * '♯♯', '♭', or '♭♭', respectively. As an example, a WAV audio file for note 'F4♭' would be either
 * 'F4b.wav' or '64.wav', and an OGG audio file for note 'C2' would be either 'C2.ogg' or '36.ogg'.
 * 
 * @param {string} name - Name to assign to the new instrument
 * @param {string[]} fileList - List of audio files from which to create the new {@link Instrument} data
 * @param {number} sampleRate - Desired sample rate at which to store the audio data
 * @param {number} bitRate - Desired bit rate of the stored audio data
 * @param {number} format - Format in which to store the audio data corresponding to a valid {@link InstrumentEncodingType}
 * @param {number} minValidNote - MIDI number of the minimum playable note on the corresponding instrument
 * @param {number} maxValidNote - MIDI number of the maximum playable note on the corresponding instrument
 * @param {boolean} sustainedNotesDecay - Whether a sustained note naturally decays in amplitude over time
 * @param {boolean} slideNotesPossible - Whether notes can slide smoothly from one to another
 * @returns {Uint8Array} Data ready to be loaded into an {@link Instrument}
 * @async
 */
export async function createInstrument(name, fileList, sampleRate, bitRate, format, minValidNote, maxValidNote, sustainedNotesDecay, slideNotesPossible) {

  // Private internal InstrumentCreator functions
  async function encodeDataPCM(audioBuffer) {
    const audioArray = new ArrayBuffer(4 * audioBuffer.numberOfChannels * audioBuffer.length);
    const audioArrayFloats = new Float32Array(audioArray);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ++ch)
      audioArrayFloats.set(audioBuffer.getChannelData(ch), ch * audioBuffer.length);
    return new Blob([gzipSync(new Uint8Array(audioArray), { level: 9, mem: 8 })]);
  }

  async function encodeData(audioContext, file) {
    let encodedBlob = new Blob([new ArrayBuffer(1)]);
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    if (format == InstrumentEncodingType.WEBM_OPUS)
      encodedBlob = await new WebmOpusEncoder().encode(audioBuffer, { bitRate: bitRate });
    else if (format == InstrumentEncodingType.PCM)
      encodedBlob = await encodeDataPCM(audioBuffer);
    else
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Invalid Format:', value: format } }));
    return new Uint8Array(await encodedBlob.arrayBuffer());
  }

  function storeNumberInArray(array, number, numBytes, offset) {
    for (let i = 0; i < numBytes; ++i) {
      const byte = number & 0xFF;
      array[offset + i] = byte;
      number = (number - byte) / 256;
    }
  }

  function parseNoteValueFromFileName(fileName) {
    const noteName = fileName.split('.').slice(0, -1).join('.');
    const noteValue = parseInt(noteName);
    if (Object.values(Note).includes(noteValue))
      return noteValue;
    else
      return Note.hasOwnProperty(noteName) ? Note[noteName] : false;
  }

  async function parseNoteData(fileList, noteData) {
    const resamplingContext = new AudioContext({ sampleRate: sampleRate });
    let numValidNotes = 0, totalLength = 0;
    for (const file of fileList) {
      const noteValue = parseNoteValueFromFileName(file.name);
      if (noteValue === false)
        window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Invalid File Name:', value: file.name } }));
      else {
        noteData[noteValue] = await encodeData(resamplingContext, file);
        totalLength += noteData[noteValue].byteLength;
        ++numValidNotes;
      }
    }
    return [numValidNotes, totalLength];
  }

  function generateMetadata(numValidNotes, dataLength) {
    // 'WAIN', Format Version (Major,Minor,Patch), Metadata Length (2 bytes), Instrument Data Length (4 bytes),
    // Inst Name (max 33 bytes), Num Notes (1 byte), Valid Note Range (2 bytes), Sustained Notes Decay (1 byte),
    // Slide Notes Possible (1 byte), Sample Rate (4 bytes), Bit Rate (4 bytes), Audio Format (2 bytes)
    const version = [0,1,0], metadataLength = 61;
    const metadata = new Uint8Array(metadataLength);
    if (name.length > 32) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Name Too Long (>32 characters):', value: name } }));
      return metadata;
    }
    metadata.set([87, 65, 73, 78], 0);
    metadata.set(version, 4);
    storeNumberInArray(metadata, metadataLength, 2, 7);
    storeNumberInArray(metadata, dataLength, 2, 9);
    metadata.set(new TextEncoder().encode(name), 13);
    metadata[46] = numValidNotes;
    metadata[47] = minValidNote;
    metadata[48] = maxValidNote;
    metadata[49] = sustainedNotesDecay;
    metadata[50] = slideNotesPossible;
    storeNumberInArray(metadata, sampleRate, 4, 51);
    storeNumberInArray(metadata, bitRate, 4, 55);
    storeNumberInArray(metadata, format, 2, 59);
    return metadata;
  }

  // Create an array containing all of the data necessary to load into an Instrument
  const noteData = {};
  const [numParsedNotes, dataLength] = await parseNoteData(fileList, noteData);
  const metadata = generateMetadata(numParsedNotes, dataLength);
  const instrumentData = new Uint8Array(metadata.byteLength + (10 * numParsedNotes) + dataLength);
  let noteIndex = metadata.byteLength, noteOffset = metadata.byteLength + (10 * numParsedNotes);
  instrumentData.set(metadata);
  for (const note in noteData) {
    storeNumberInArray(instrumentData, Number(note), 2, noteIndex);
    noteIndex += 2;
    storeNumberInArray(instrumentData, noteOffset, 4, noteIndex);
    noteIndex += 4;
    instrumentData.set(noteData[note], noteOffset);
    noteOffset += noteData[note].byteLength;
    storeNumberInArray(instrumentData, noteData[note].byteLength, 4, noteIndex);
    noteIndex += 4;
  }
  return instrumentData;
}
