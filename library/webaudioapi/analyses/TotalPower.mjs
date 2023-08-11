import { AnalysisBase } from './AnalysisBase.mjs';

/**
 * Class representing an acoustic "total power" analysis algorithm.
 * 
 * Total power analysis determines the total cumulative spectral power present across all
 * frequencies within an audio signal.
 * 
 * @extends AnalysisBase
 */
export class TotalPower extends AnalysisBase {

   /**
    * Constructs a new {@link TotalPower} analysis object.
    */
   constructor() {
      super();
   }

   /**
    * Performs a total power spectral analysis on the passed-in buffer containing audio
    * frequency content.
    * 
    * @param {Uint8Array} frequencyContent - {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array} containing audio frequency data
    * @returns {number} Total power content across all frequencies in the specified frequency data
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array}
    */
   static analyze(frequencyContent) {
      return undefined;
   }
}
