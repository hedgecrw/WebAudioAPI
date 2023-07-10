import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Band-Reject Filter effect.
 * 
 * A Band-Reject Filter is defined by a lower and upper cutoff frequency between which audio
 * signals are reduced or eliminated completely, while all frequencies outside of this range are
 * allowed to pass without alteration.
 * 
 * @extends EffectBase
 */
export class BandRejectFilter extends EffectBase {

   // Effect-specific private variables
   /** @type {BiquadFilterNode} */
   #filterNode;

   /**
    * Constructs a new {@link BandRejectFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#filterNode = new BiquadFilterNode(audioContext, { type: 'notch' });
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
         { name: 'lowerCutoffFrequency', type: 'number', validValues: [0, 22050], defaultValue: 0 },
         { name: 'upperCutoffFrequency', type: 'number', validValues: [0, 22050], defaultValue: 0 },
         { name: 'intensityPercent', type: 'number', validValues: [0, 1], defaultValue: 1 }
      ];
   }

   async load() {
      this.#filterNode.frequency.value = 11025.0;
      this.#filterNode.Q.value = 1000.0;
   }

   /**
    * Updates the {@link BandRejectFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} lowerCutoffFrequency - Frequency above which audio content will be reduced
    * @param {number} upperCutoffFrequency - Frequency below which audio content will be reduced
    * @param {number} intensityPercent - Amount of frequency exaggeration around the cutoffs as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({lowerCutoffFrequency, upperCutoffFrequency}, intensityPercent, updateTime) {
      // intensityPercent = resonance
      if (lowerCutoffFrequency != null)
      if (upperCutoffFrequency != null)
      if (intensityPercent != null)
      return false;
   }

   getInputNode() {
      return this.#filterNode;
   }

   getOutputNode() {
      return this.#filterNode;
   }
}
