import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Flanger effect.
 * 
 * A Flanger effect generates a delayed, modulated version of an original audio signal which gets
 * played slightly out-of-phase and slower than the original.
 * 
 * @extends EffectBase
 */
export class Flanger extends EffectBase {

   /**
    * Constructs a new {@link Flanger} effect object.
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
    * Updates the {@link Flanger} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the delayed flanger signal
    * @param {string} shape - Waveform shape used to modulate the delayed flanger signal
    * @param {number} delayOffset - Number of seconds of delay between the original signal and the flanger signal
    * @param {number} variableFeedback - Percentage of processed signal to be fed back into the flanger circuit
    * @param {number} intensity - Ratio of flangered-to-original sound as a percentage between [0.0, 1.0]
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
