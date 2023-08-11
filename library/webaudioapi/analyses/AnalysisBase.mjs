/** Class representing all base-level {@link WebAudioAPI} audio analysis functions */
export class AnalysisBase {

   /**
    * Called by a concrete analysis instance to initialize the inherited {@link AnalysisBase} data
    * structure.
    */
   constructor() { /* Empty constructor */ }

   /**
    * Performs a spectral analysis corresponding to an underlying concrete class on the passed-in
    * buffer containing audio frequency content.
    * 
    * @param {Uint8Array} frequencyContent - {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array} containing audio frequency data
    * @returns {Object} Object containing the results of the specified acoustic analysis
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Uint8Array Uint8Array}
    */
   static analyze(frequencyContent) { return undefined; }
}
