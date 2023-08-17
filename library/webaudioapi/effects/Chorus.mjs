import * as WebAudioApiErrors from '../modules/Errors.mjs';
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
      return [
         { name: 'rate', type: 'number', validValues: [0, 2], defaultValue: 0 },
         { name: 'shape', type: 'string', validValues: ['sine', 'triangle'], defaultValue: 'sine' },
         { name: 'delayOffset', type: 'number', validValues: [0, 0.05], defaultValue: 0 },
         { name: 'variableFeedback', type: 'number', validValues: [0, 1], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [0, 2], defaultValue: 0 },
      ];
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
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, shape, delayOffset, variableFeedback, intensity}, updateTime, timeConstant) {
      if ((rate == null) && (shape == null) && (delayOffset == null) && (variableFeedback == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Chorus effect without at least one of the following parameters: "rate, shape, delayOffset, variableFeedback, intensity"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
