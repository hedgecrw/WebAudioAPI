import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Reverb effect.
 * 
 * A Reverb effect represents a complex echo resulting from the absorption of sound by various
 * surfaces in an environment, as well as from multiple echoes reflecting from hard surfaces
 * many times and with differing amplitudes. This effect is useful for creating a sense of
 * spaciousness and can help to unify multiple elements within a musical piece.
 * 
 * @extends EffectBase
 */
export class Reverb extends EffectBase {

   /**
    * Constructs a new {@link Reverb} effect object.
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
    * Updates the {@link Reverb} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} preDelay - Number of seconds before the first reflection occurs
    * @param {number} decay - Number of seconds before reflections start to decay
    * @param {number} highCutoffFrequency - Frequency above which to block acoustic reverb content
    * @param {number} lowCutoffFrequency - Frequency below which to block acoustic reverb content
    * @param {number} intensity - Ratio of reverbed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({preDelay, decay, highCutoffFrequency, lowCutoffFrequency, intensity}, updateTime, timeConstant) {
      if ((preDelay == null) && (decay ==  null) && (highCutoffFrequency == null) && (lowCutoffFrequency ==  null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Reverb effect without at least one of the following parameters: "preDelay, decay, highCutoffFrequency, lowCutoffFrequency, intensity"');
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
