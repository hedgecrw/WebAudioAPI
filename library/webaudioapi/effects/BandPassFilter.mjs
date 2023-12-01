import * as WebAudioApiErrors from '../modules/Errors.mjs';
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

   // Effect-specific private variables
   /** @type {BiquadFilterNode} */
   #filterNode;
   /** @type {number} */
   #lowerCutoffFrequency;
   /** @type {number} */
   #upperCutoffFrequency;

   // Parameter limits
   static minFrequency = 1;
   static maxFrequency = 22050;

   /**
    * Constructs a new {@link BandPassFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#filterNode = new BiquadFilterNode(audioContext, { type: 'bandpass' });
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
         { name: 'lowerCutoffFrequency', type: 'number', validValues: [BandPassFilter.minFrequency, BandPassFilter.maxFrequency], defaultValue: BandPassFilter.minFrequency },
         { name: 'upperCutoffFrequency', type: 'number', validValues: [BandPassFilter.minFrequency, BandPassFilter.maxFrequency], defaultValue: BandPassFilter.maxFrequency }
      ];
   }

   async load() {
      this.#lowerCutoffFrequency = BandPassFilter.minFrequency;
      this.#upperCutoffFrequency = BandPassFilter.maxFrequency;
      this.#filterNode.frequency.value = 148.5;
      this.#filterNode.Q.value = 0.0001;
   }

   /**
    * Updates the {@link BandPassFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} lowerCutoffFrequency - Frequency below which audio content will be reduced between [1, 22050]
    * @param {number} upperCutoffFrequency - Frequency above which audio content will be reduced between [1, 22050]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({lowerCutoffFrequency, upperCutoffFrequency}, updateTime, timeConstant) {
      if ((lowerCutoffFrequency == null) && (upperCutoffFrequency == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the BandPassFilter effect without at least one of the following parameters: "lowerCutoffFrequency, upperCutoffFrequency"');
      if (lowerCutoffFrequency != null) {
         if (((upperCutoffFrequency != null) && (lowerCutoffFrequency > upperCutoffFrequency)) || (lowerCutoffFrequency > this.#upperCutoffFrequency))
            throw new WebAudioApiErrors.WebAudioValueError('Lower cutoff frequency cannot be greater than the upper cutoff frequency');
      }
      else if (upperCutoffFrequency < this.#lowerCutoffFrequency)
         throw new WebAudioApiErrors.WebAudioValueError('Lower cutoff frequency cannot be greater than the upper cutoff frequency');
      if ((lowerCutoffFrequency != null) && (lowerCutoffFrequency < BandPassFilter.minFrequency))
         throw new WebAudioApiErrors.WebAudioValueError(`Lower cutoff frequency cannot be less than ${BandPassFilter.minFrequency}`);
      if ((upperCutoffFrequency != null) && (upperCutoffFrequency > BandPassFilter.maxFrequency))
         throw new WebAudioApiErrors.WebAudioValueError(`Upper cutoff frequency cannot be greater than ${BandPassFilter.maxFrequency}`);
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (lowerCutoffFrequency != null)
         this.#lowerCutoffFrequency = lowerCutoffFrequency;
      if (upperCutoffFrequency != null)
         this.#upperCutoffFrequency = upperCutoffFrequency;
      const centerFrequency = Math.sqrt(this.#upperCutoffFrequency * this.#lowerCutoffFrequency);
      this.#filterNode.frequency.setTargetAtTime(centerFrequency, timeToUpdate, timeConstantTarget);
      this.#filterNode.Q.setTargetAtTime(centerFrequency / (0.0001 + this.#upperCutoffFrequency - this.#lowerCutoffFrequency), timeToUpdate, timeConstantTarget);
      return true;
   }

   currentParameterValues() {
      return {
         lowerCutoffFrequency: this.#lowerCutoffFrequency,
         upperCutoffFrequency: this.#upperCutoffFrequency
      };
   }

   getInputNode() {
      return this.#filterNode;
   }

   getOutputNode() {
      return this.#filterNode;
   }
}
