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
    * @param {number} intensityPercent - Ratio of reverbed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({preDelay, decay, highCutoffFrequency, lowCutoffFrequency, intensityPercent, updateTime}) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
