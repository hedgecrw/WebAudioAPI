/** Class representing all built-in {@link WebAudioAPI} audio encoders */
export class EncoderBase {

   /**
    * Called by a concrete encoder instance to initialize the inherited {@link EncoderBase} data
    * structure.
    */
   constructor() {}

   /**
    * Encodes the corresponding audio buffer, and returns a
    * {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob} containing the newly
    * encoded data.
    * 
    * @param {AudioBuffer} audioData - {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer} containing the data to encode
    * @returns {Blob} Data {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob} containing the newly encoded audio
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer AudioBuffer}
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob Blob}
    */
   encode(audioData) { return undefined; }
}
