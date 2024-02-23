/**
 * Module containing all {@link WebAudioAPI} instrument decompilation functionality.
 * @module InstrumentDecompiler
 */

/**
 * Module containing all {@link WebAudioAPI} instrument decompilation functionality.
 * @namespace InstrumentDecompiler
 * @global
 */

import { InstrumentEncodingType } from './Constants.mjs';
import { WavFileEncoder } from './WavFileEncoder.mjs';
import './jszip.min.js';

/**
 * Decompiles an existing {@link Instrument} object into its constituent audio files.
 * 
 * @param {string} instrumentFile - Audio files containing the {@link Instrument} to decompile
 * @returns {Uint8Array} Zip file containing all decompiled audio from the corresponding {@link Instrument}
 * @async
 */
export async function decompileInstrument(instrumentFile) {

  // Private internal Instrument functions
  function loadNumberFromArray(array, numBytes, offset) {
    let number = 0;
    for (let i = numBytes - 1; i >= 0; --i)
      number = (number * 256) + array[offset + i];
    return number;
  }

  function parseMetadata(data) {
    const metadata = {};
    if (data[0] != 87 || data[1] != 65 || data[2] != 73 || data[3] != 78) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Invalid File:', value: instrumentFile.name } }));
      return null;
    }
    metadata.version = [ data[4], data[5], data[6] ];
    if (metadata.version[0] != 0 || metadata.version[1] != 1) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Unknown File Version:', value: version.join('.') } }));
      return null;
    }
    if (data.byteLength < 60) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Unexpected File Format:', value: instrumentFile.name } }));
      return null;
    }
    metadata.metadataLength = loadNumberFromArray(data, 2, 7);
    if (metadata.metadataLength != 60) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Unexpected File Format:', value: instrumentFile.name } }));
      return null;
    }
    metadata.dataLength = loadNumberFromArray(data, 4, 9);
    let nameLength = 0;
    while ((nameLength < 33) && data[13 + nameLength]) ++nameLength;
    metadata.name = new TextDecoder().decode(new Uint8Array(data.buffer, 13, nameLength));
    metadata.numNotes = data[46]; metadata.minValidNote = data[47]; metadata.maxValidNote = data[48]; metadata.sustainedNotesDecay = Boolean(data[49]);
    metadata.sampleRate = loadNumberFromArray(data, 4, 50);
    metadata.bitRate = loadNumberFromArray(data, 4, 54);
    metadata.format = loadNumberFromArray(data, 2, 58);
    if (metadata.format != InstrumentEncodingType.PCM && metadata.format != InstrumentEncodingType.WEBM_OPUS) {
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Unexpected Encoding Format:', value: metadata.format } }));
      return null;
    }
    return metadata;
  }

  async function decompilePCM(audioContext, data, metadata) {
    const zippedBlob = new Blob([data]);
    const decompressor = new DecompressionStream('gzip');
    const decompressedStream = zippedBlob.stream().pipeThrough(decompressor);
    const decompressedData = new Float32Array(await new Response(decompressedStream).arrayBuffer());
    const audioBuffer = audioContext.createBuffer(1, decompressedData.length, metadata.sampleRate);
    audioBuffer.copyToChannel(decompressedData, 0);
    return await new WavFileEncoder().encode(audioBuffer);
  }

  async function decompile(audioContext, data, metadata) {
    let decompiledBlob = new Blob([new ArrayBuffer(1)]);
    if (metadata.format == InstrumentEncodingType.WEBM_OPUS)
      decompiledBlob = new Blob([data], { type: 'audio/webm;codecs=opus' });
    else if (metadata.format == InstrumentEncodingType.PCM)
      decompiledBlob = await decompilePCM(audioContext, data, metadata);
    else
      window.dispatchEvent(new CustomEvent('webaudioapi_error', { detail: { tag: 'Invalid Format:', value: metadata.format } }));
    return new Uint8Array(await decompiledBlob.arrayBuffer());
  }

  async function loadNotes(data, metadata) {
    let noteIndex = 0;
    const noteData = {};
    const audioContext = new AudioContext();
    for (let i = 0; i < metadata.numNotes; ++i) {
      const note = loadNumberFromArray(data, 2, noteIndex);
      noteIndex += 2;
      const noteOffset = loadNumberFromArray(data, 4, noteIndex);
      noteIndex += 4;
      const noteDataLength = loadNumberFromArray(data, 4, noteIndex);
      noteIndex += 4;
      noteData[note] = await decompile(audioContext, new Uint8Array(data.buffer, noteOffset, noteDataLength), metadata);
    }
    return noteData;
  }

  // Actually load and return the audio data
  const zip = new JSZip();
  const instrumentData = new Uint8Array(await instrumentFile.arrayBuffer());
  const metadata = parseMetadata(instrumentData);
  const noteData = metadata ? await loadNotes(new Uint8Array(instrumentData.buffer, metadata.metadataLength), metadata) : null;
  const formatString = (metadata.format == InstrumentEncodingType.WEBM_OPUS) ? '.webm' : '.wav';
  for (const [midiNumber, noteDatum] of Object.entries(noteData))
    zip.file(metadata.name + '/audio/' + midiNumber + formatString, noteDatum);
  return [await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }), metadata];
}
