/**
 * Module containing all instrument-specific {@link WebAudioAPI} functionality.
 * @module Instrument
 */

/**
 * Object containing all instrument-specific {@link WebAudioAPI} functionality.
 * @namespace Instrument
 * @global
 */

import { Frequency, Note, InstrumentEncodingType } from './Constants.mjs';
import * as WebAudioApiErrors from './Errors.mjs';

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
   
   function parseMetadata(data) {
      const metadata = {};
      if (data[0] != 87 || data[1] != 65 || data[2] != 73 || data[3] != 78)
         return null;
      metadata.version = [ data[4], data[5], data[6] ];
      if (metadata.version[0] != 0 || metadata.version[1] != 1 || data.byteLength < 61)
         return null;
      metadata.metadataLength = loadNumberFromArray(data, 2, 7);
      if (metadata.metadataLength != 61)
         return null;
      metadata.dataLength = loadNumberFromArray(data, 4, 9);
      let nameLength = 0;
      while ((nameLength < 33) && data[13 + nameLength]) ++nameLength;
      metadata.name = new TextDecoder().decode(new Uint8Array(data.buffer, 13, nameLength));
      metadata.numNotes = data[46]; metadata.minValidNote = data[47]; metadata.maxValidNote = data[48];
      metadata.sustainedNotesDecay = Boolean(data[49]); metadata.slideNotesPossible = Boolean(data[50]);
      metadata.sampleRate = loadNumberFromArray(data, 4, 51);
      metadata.bitRate = loadNumberFromArray(data, 4, 55);
      metadata.format = loadNumberFromArray(data, 2, 59);
      return (metadata.format == InstrumentEncodingType.PCM || metadata.format == InstrumentEncodingType.WEBM_OPUS) ? metadata : null;
   }

   async function decompilePCM(data, metadata) {
      const zippedBlob = new Blob([data]);
      const decompressor = new DecompressionStream('gzip');
      const decompressedStream = zippedBlob.stream().pipeThrough(decompressor);
      const decompressedData = new Float32Array(await new Response(decompressedStream).arrayBuffer());
      const audioBuffer = audioContext.createBuffer(1, decompressedData.length, metadata.sampleRate);
      audioBuffer.copyToChannel(decompressedData, 0);
      return audioBuffer;
   }

   async function decompile(data, metadata) {
      return (metadata.format == InstrumentEncodingType.PCM) ? await decompilePCM(data, metadata) :
         await audioContext.decodeAudioData(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
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
      for (let note = 1; note < noteData.length; ++note)
         if (noteData[note] === undefined) {
            const closestValidNote = findClosestValidNote(noteData, note);
            missingData[note] = {
               'buffer': noteData[closestValidNote].buffer,
               'detune': 100 * (note - closestValidNote),
               'loop': noteData[closestValidNote].loop,
               'loopStart': noteData[closestValidNote].loopStart,
               'loopEnd': noteData[closestValidNote].loopEnd
            };
         }
      missingData[0] = { 'buffer': null, 'detune': 0 };
   }
   
   async function loadNotesAndInterpolate(instrumentData, noteData, missingData, metadata) {
      let noteIndex = 0;
      noteData.length = missingData.length = 1 + Note['B9'];
      for (let i = 0; i < metadata.numNotes; ++i) {
         const note = loadNumberFromArray(instrumentData, 2, noteIndex);
         noteIndex += 2;
         const noteOffset = loadNumberFromArray(instrumentData, 4, noteIndex);
         noteIndex += 4;
         const noteDataLength = loadNumberFromArray(instrumentData, 4, noteIndex);
         noteIndex += 4;
         const audioBuffer = await decompile(new Uint8Array(instrumentData.buffer, noteOffset, noteDataLength), metadata);
         noteData[note] = {
            'buffer': audioBuffer,
            'detune': 0,
            'loop': !metadata.sustainedNotesDecay,
            'loopStart': audioBuffer.duration - 1.0,
            'loopEnd': audioBuffer.duration
         };
      }
      fillInMissingNotes(noteData, missingData);
   }
   
   async function loadInstrument(url) {
      const noteData = [], foundData = [], missingData = [];
      const response = await fetch(url);
      const resource = await response.arrayBuffer();
      const instrumentData = new Uint8Array(resource);
      const metadata = parseMetadata(instrumentData);
      if (!metadata)
         throw new WebAudioApiErrors.WebAudioInstrumentError(`The specified instrument file at ${url} is corrupt or of an unexpected type`);
      await loadNotesAndInterpolate(new Uint8Array(instrumentData.buffer, metadata.metadataLength), foundData, missingData, metadata);
      for (let i = 0; i < foundData.length; ++i)
         noteData[i] = (foundData[i] === undefined) ? missingData[i] : foundData[i];
      return [noteData, metadata];
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
      getNote: null,

      /**
       * Returns an {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode AudioScheduledSourceNode}
       * that can be used to play back the specified MIDI `note` from an {@link OfflineAudioContext}.
       * 
       * @function
       * @param {OfflineAudioContext} - Offline audio context whicih will be used to play back the note
       * @param {number} note - MIDI note number for which to generate a playable note
       * @memberof Instrument
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode AudioScheduledSourceNode}
       */
      getNoteOffline: null
   };

   // Actually load and return the instrument
   console.log('Loading instrument:', name + '...');
   if (url == null) {
      instrumentInstance.getNote = function (note) {
         return new OscillatorNode(audioContext, { frequency: Frequency[note] });
      };
      instrumentInstance.getNoteOffline = function (offlineContext, note) {
         return new OscillatorNode(offlineContext, { frequency: Frequency[note] });
      };
   }
   else {
      const [noteData, metadata] = await loadInstrument(url);
      instrumentInstance.getNote = function (note) {
         if (note && (note < metadata.minValidNote) || (note > metadata.maxValidNote))
            throw new WebAudioApiErrors.WebAudioInstrumentError(`The specified note (${note}) is unplayable on this instrument. Valid notes are [${metadata.minValidNote}, ${metadata.maxValidNote}]`);
         return new AudioBufferSourceNode(audioContext, noteData[note]);
      };
      instrumentInstance.getNoteOffline = function (offlineContext, note) {
         if (note && (note < metadata.minValidNote) || (note > metadata.maxValidNote))
            throw new WebAudioApiErrors.WebAudioInstrumentError(`The specified note (${note}) is unplayable on this instrument. Valid notes are [${metadata.minValidNote}, ${metadata.maxValidNote}]`);
         return new AudioBufferSourceNode(offlineContext, noteData[note]);
      };
   }
   return instrumentInstance;
}
