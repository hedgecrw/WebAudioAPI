/** Class representing all base-level {@link WebAudioAPI} effects */
export class EffectBase {

   // Reference to the stored global AudioContext
   /** @type {AudioContext} */
   audioContext = null;

   /**
    * Called by a concrete effect instance to initialize the inherited {@link EffectBase} data
    * structure.
    * 
    * @param {AudioContext} audioContext - Reference to the global browser {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
    */
   constructor(audioContext) {
      this.audioContext = audioContext;
   }

   /**
    * Loads the necessary data to implement the corresponding {@link Effect}, which can then be
    * applied to an individual {@link Track} or to the aggregate output of all tracks.
    */
   async load() { return; }

   /**
    * Updates the parameters of the effect at the specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {Object} effectOptions - Effect-specific options (TODO)
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update(effectOptions, updateTime) { return false; }
   // TODO: Verify correct options within each concrete update() function, Errors.mjs

   /**
    * Returns a reference to the {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
    * to which all source {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNodes}
    * should be connected in order to activate this {@link Effect}.
    * 
    * @returns {AudioNode} Reference to the first {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode} in the effect sequencing pipeline
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
    */
   getInputNode() { return undefined; }

   /**
    * Returns a reference to the {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
    * from which all effect-modified output audio is produced.
    * 
    * @returns {AudioNode} Reference to the final {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode} in the effect sequencing pipeline
    * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
    */
   getOutputNode() { return undefined; }
}
