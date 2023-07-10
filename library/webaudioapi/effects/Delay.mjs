import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Delay effect.
 * 
 * A Delay effect replicates an audio signal and plays back one or more possibly attenuated
 * copies at a later, user-specified time.
 * 
 * @extends EffectBase
 */
export class Delay extends EffectBase {

   // Effect-specific private variables
   /** @type {DelayNode} */
   #delayNode;

   /**
    * Constructs a new {@link Delay} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#delayNode = new DelayNode(audioContext);
   }

   /**
    * Returns a list of all available parameters for manipulation in the `effectOptions` parameter
    * of the {@link EffectBase#update update()} function for this {@link Effect}.
    * 
    * @returns {EffectParameter[]} List of effect-specific parameters for use in the effect's {@link EffectBase#update update()} function
    * @see {@link EffectParameter}
    */
   static getParameters() {
      return [];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Delay} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} feedback - Number of echoes and the resonance between each echo
    * @param {number} time - Number of seconds between the original signal and its echo
    * @param {number} cutoffFrequencyLower - Frequency below which to block acoustic content
    * @param {number} cutoffFrequencyUpper - Frequency above which to block acoustic content
    * @param {number} intensityPercent - Ratio of delayed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({feedback, time, cutoffFrequencyLower, cutoffFrequencyUpper}, intensityPercent, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
