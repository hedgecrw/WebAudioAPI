import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing an Equalization effect.
 * 
 * An Equalizer allows for the volume of an audio signal to be adjusted piecewise according to
 * any number of discrete frequency ranges. Both the size and quantity of frequency ranges are
 * user-definable.
 * 
 * @extends EffectBase
 */
export class Equalization extends EffectBase {

   /**
    * Constructs a new {@link Equalization} effect object.
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
    * Updates the {@link Equalization} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number[]} frequencyBandUpperCutoffs - Upper frequency cutoffs for each band in the equalizer
    * @param {number[]} frequencyBandVolumes - Volumes for each frequency band in the equalizer
    * @param {number} intensityPercent - Intensity of the overall signal volume as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({frequencyBandVolumes}, intensityPercent, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
