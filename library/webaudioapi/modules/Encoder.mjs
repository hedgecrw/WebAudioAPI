/**
 * Module containing functionality to create and utilize {@link WebAudioAPI} data encoders.
 * @module Encoder
 */

/**
 * Object containing all encoder-specific {@link WebAudioAPI} functionality.
 * @namespace Encoder
 * @global
 */

import { EncodingType } from './Constants.mjs';
import { WavFileEncoder } from '../encoders/WavFileEncoder.mjs';

const EncoderClasses = {
   [EncodingType.WAV]: WavFileEncoder,
};

/**
 * Returns a concrete encoder implementation for the specified file type. The value passed
 * to the `fileType` parameter must be the **numeric value** associated with a certain
 * {@link module:Constants.EncodingType EncodingType}, not a string-based key.
 * 
 * @param {number} fileType - Numeric value corresponding to the desired file {@link module:Constants.EncodingType EncodingType}
 * @returns {EncoderBase} Concrete encoder implementation for the specified {@link module:Constants.EncodingType EncodingType}
 * @see {@link module:Constants.EncodingType EncodingType}
 * @see {@link EncoderBase}
 */
export function getEncoderFor(fileType) {
   return new EncoderClasses[fileType]();
}
