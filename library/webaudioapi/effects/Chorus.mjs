import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Chorus effect.
 * 
 * A Chorus effect is an audio modulation effect that replicates an audio signal and modulates
 * and delays the result, such that it comes directly after and alters the original signal's
 * pitch. This effect is used to thicken the tone of an audio signal and create an epic feeling.
 * 
 * @extends EffectBase
 */
export class Chorus extends EffectBase {

   /**
    * Constructs a new {@link Chorus} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
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
    * Updates the {@link Chorus} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the delayed chorus signal
    * @param {string} shape - Waveform shape used to modulate the delayed chorus signal
    * @param {number} delayOffset - Number of seconds delay between the original signal and the chorus signal
    * @param {number} variableFeedback - Percentage of processed signal to be fed back into the chorus circuit
    * @param {number} intensity - Ratio of chorus-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, shape, delayOffset, variableFeedback, intensity}, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
