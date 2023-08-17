import * as WebAudioApiErrors from '../modules/Errors.mjs';
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
   /** @type {number} */
   #lowerCutoffFrequency;
   /** @type {number} */
   #upperCutoffFrequency;

   /**
    * Constructs a new {@link BandRejectFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#filterNode = new BiquadFilterNode(audioContext, { type: 'notch' });
      this.#lowerCutoffFrequency = 1.0;
      this.#upperCutoffFrequency = 1.0;
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
         { name: 'lowerCutoffFrequency', type: 'number', validValues: [1, 22050], defaultValue: 1 },
         { name: 'upperCutoffFrequency', type: 'number', validValues: [1, 22050], defaultValue: 1 }
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
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({lowerCutoffFrequency, upperCutoffFrequency}, updateTime, timeConstant) {
      if ((lowerCutoffFrequency == null) && (upperCutoffFrequency == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the BandRejectFilter effect without at least one of the following parameters: "lowerCutoffFrequency, upperCutoffFrequency"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (lowerCutoffFrequency != null)
         this.#lowerCutoffFrequency = lowerCutoffFrequency;
      if (upperCutoffFrequency != null)
         this.#upperCutoffFrequency = upperCutoffFrequency;
      const centerFrequency = this.#calcCenterFrequency();
      this.#filterNode.frequency.setTargetAtTime(centerFrequency, timeToUpdate, timeConstantTarget);
      this.#filterNode.Q.setTargetAtTime((this.#upperCutoffFrequency - this.#lowerCutoffFrequency) / centerFrequency, timeToUpdate, timeConstantTarget);
      return true;
   }

   #calcCenterFrequency() {
      if (this.#upperCutoffFrequency / this.#lowerCutoffFrequency >= 1.1)
         return Math.sqrt(this.#upperCutoffFrequency * this.#lowerCutoffFrequency);
      return ((this.#upperCutoffFrequency + this.#lowerCutoffFrequency) / 2);
   }

   getInputNode() {
      return this.#filterNode;
   }

   getOutputNode() {
      return this.#filterNode;
   }
}
