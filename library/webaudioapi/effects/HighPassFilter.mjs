import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a High-Pass Filter effect.
 * 
 * A High-Pass Filter is defined by a cutoff frequency above which audio signals are allowed to
 * pass and below which audio signals are reduced or eliminated completely.
 * 
 * @extends EffectBase
 */
export class HighPassFilter extends EffectBase {

   /**
    * Constructs a new {@link HighPassFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link HighPassFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} cutoffFrequency - Frequency below which audio content will be reduced
    * @param {number} intensityPercent - Amount of frequency exaggeration around the cutoff as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({cutoffFrequency, intensityPercent, updateTime}) {
      // intensityPercent = resonance
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
