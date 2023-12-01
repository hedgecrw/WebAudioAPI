import * as WebAudioApiErrors from '../modules/Errors.mjs';
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

   // Effect-specific private variables
   /** @type {BiquadFilterNode} */
   #filterNode;

   // Parameter limits
   static minFrequency = 0;
   static maxFrequency = 22050;
   static minResonance = 0.0001;
   static maxResonance = 1000;

   /**
    * Constructs a new {@link HighPassFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#filterNode = new BiquadFilterNode(audioContext, { type: 'highpass' });
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
         { name: 'cutoffFrequency', type: 'number', validValues: [HighPassFilter.minFrequency, HighPassFilter.maxFrequency], defaultValue: HighPassFilter.minFrequency },
         { name: 'resonance', type: 'number', validValues: [HighPassFilter.minResonance, HighPassFilter.maxResonance], defaultValue: HighPassFilter.minResonance }
      ];
   }

   async load() {
      this.#filterNode.frequency.value = HighPassFilter.minFrequency;
      this.#filterNode.Q.value = HighPassFilter.minResonance;
   }

   /**
    * Updates the {@link HighPassFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} cutoffFrequency - Frequency below which audio content will be reduced between [0, 22050]
    * @param {number} resonance - Amount of frequency exaggeration around the cutoff as a value between [0.0001, 1000.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({cutoffFrequency, resonance}, updateTime, timeConstant) {
      if ((cutoffFrequency == null) && (resonance == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the HighPassFilter effect without at least one of the following parameters: "cutoffFrequency, resonance"');
      if (cutoffFrequency != null) {
         if (cutoffFrequency < HighPassFilter.minFrequency)
            throw new WebAudioApiErrors.WebAudioValueError(`Cutoff frequency cannot be less than ${HighPassFilter.minFrequency}`);
         else if (cutoffFrequency > HighPassFilter.maxFrequency)
            throw new WebAudioApiErrors.WebAudioValueError(`Cutoff frequency cannot be greater than ${HighPassFilter.maxFrequency}`);
      }
      if (resonance != null) {
         if (resonance < HighPassFilter.minResonance)
            throw new WebAudioApiErrors.WebAudioValueError(`Resonance exaggeration cannot be less than ${HighPassFilter.minResonance}`);
         else if (resonance > HighPassFilter.maxResonance)
            throw new WebAudioApiErrors.WebAudioValueError(`Resonance exaggeration cannot be greater than ${HighPassFilter.maxResonance}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (cutoffFrequency != null)
         this.#filterNode.frequency.setTargetAtTime(cutoffFrequency, timeToUpdate, timeConstantTarget);
      if (resonance != null)
         this.#filterNode.Q.setTargetAtTime(resonance, timeToUpdate, timeConstantTarget);
      return true;
   }

   currentParameterValues() {
      return {
         cutoffFrequency: this.#filterNode.frequency.value,
         resonance: this.#filterNode.Q.value
      };
   }

   getInputNode() {
      return this.#filterNode;
   }

   getOutputNode() {
      return this.#filterNode;
   }
}
