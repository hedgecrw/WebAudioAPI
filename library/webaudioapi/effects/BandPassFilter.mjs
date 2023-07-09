import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Band-Pass Filter effect.
 * 
 * A Band-Pass Filter is defined by a lower and upper cutoff frequency between which audio
 * signals are allowed to pass, while all frequencies outside of this range are reduced or
 * eliminated completely.
 * 
 * @extends EffectBase
 */
export class BandPassFilter extends EffectBase {

   /**
    * Constructs a new {@link BandPassFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link BandPassFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} lowerCutoffFrequency - Frequency below which audio content will be reduced
    * @param {number} upperCutoffFrequency - Frequency above which audio content will be reduced
    * @param {number} intensityPercent - Amount of frequency exaggeration around the cutoffs as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({lowerCutoffFrequency, upperCutoffFrequency, intensityPercent, updateTime}) {
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
