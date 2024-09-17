/**
 * Module containing functionality to create and utilize {@link WebAudioAPI} data encoders.
 * @module Encoder
 */

import { EncodingType } from './Constants.mjs';
import { WavFileEncoder } from '../encoders/WavFileEncoder.mjs';
import { WebmOpusEncoder } from '../encoders/WebmOpusEncoder.mjs';

const EncoderClasses = {
   [EncodingType.WAV]: WavFileEncoder,
   [EncodingType.WEBM]: WebmOpusEncoder,
};

/**
 * Returns a concrete encoder implementation for the specified file type. The value passed
 * to the `fileType` parameter must be the **numeric value** associated with a certain
 * {@link module:Constants.EncodingType EncodingType}, not a string-based key.
 * 
 * @param {number} encodingType - Numeric value corresponding to the desired file {@link module:Constants.EncodingType EncodingType}
 * @returns {EncoderBase} Concrete encoder implementation for the specified {@link module:Constants.EncodingType EncodingType}
 * @see {@link module:Constants.EncodingType EncodingType}
 * @see {@link EncoderBase}
 */
export function getEncoderFor(encodingType) {
   return new EncoderClasses[encodingType]();
}
