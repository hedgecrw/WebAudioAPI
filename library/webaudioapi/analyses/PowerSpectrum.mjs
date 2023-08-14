import { AnalysisBase } from './AnalysisBase.mjs';

/**
 * Class representing an acoustic "power spectrum" analysis algorithm.
 * 
 * A Power Spectrum is an array in which each bin contains the power attributed to a discrete
 * range of frequencies within an audio signal.
 * 
 * @extends AnalysisBase
 */
export class PowerSpectrum extends AnalysisBase {

   /**
    * Constructs a new {@link PowerSpectrum} analysis object.
    */
   constructor() {
      super();
   }

   /**
    * Performs a power spectrum analysis on the passed-in buffer containing audio
    * frequency content. The bins of the resulting power spectrum will contain values between
    * [0, 255], where 0 represents silence and 255 represents the maximum representable power.
    * 
    * @param {Uint8Array} frequencyContent - {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array} containing audio frequency data
    * @returns {Uint8Array} Array containing the power spectrum corresponding to the specified frequency data as values between [0, 255]
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array}
    */
   static analyze(frequencyContent) {
      return frequencyContent;
   }
}
