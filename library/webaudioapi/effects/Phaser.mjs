import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Phaser effect.
 * 
 * A Phaser effect manipulates an audio signal by generating high-pass filters in the form of
 * peaks in the frequency spectrum which are used to create cuts in the high-frequency ranges
 * of the original audio signal and modulate them up and down throughout the audio. This effect
 * is frequently used in funk music, and it adds character to individual notes to create a form
 * of swirling movement in the audio.
 * 
 * @extends EffectBase
 */
export class Phaser extends EffectBase {

   /**
    * Constructs a new {@link Phaser} effect object.
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
    * Updates the {@link Phaser} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} speed - Speed at which the cuts in the bandpass filters are modulated
    * @param {number} feedback - Percentage of phased signal that will be fed back into the phased audio circuit
    * @param {number} widthLower - Lowest frequency through which the bandpass filters will sweep
    * @param {number} widthUpper - Highest frequency through which the bandpass filters will sweep
    * @param {number} intensity - Ratio of phased-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({speed, feedback, widthLower, widthUpper, intensity}, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
