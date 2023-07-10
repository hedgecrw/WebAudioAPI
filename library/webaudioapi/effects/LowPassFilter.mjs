import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Low-Pass Filter effect.
 * 
 * A Low-Pass Filter is defined by a cutoff frequency below which audio signals are allowed to
 * pass and above which audio signals are reduced or eliminated completely.
 * 
 * @extends EffectBase
 */
export class LowPassFilter extends EffectBase {

   // Effect-specific private variables
   /** @type {BiquadFilterNode} */
   #filterNode;

   /**
    * Constructs a new {@link LowPassFilter} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#filterNode = new BiquadFilterNode(audioContext, { type: 'lowpass' });
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
         { name: 'cutoffFrequency', type: 'number', validValues: [0, 22050], defaultValue: 22050 },
         { name: 'resonance', type: 'number', validValues: [0, 1000], defaultValue: 0 }
      ];
   }

   async load() {
      this.#filterNode.frequency.value = 22050.0;
      this.#filterNode.Q.value = 0.0001;
   }

   /**
    * Updates the {@link LowPassFilter} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} cutoffFrequency - Frequency above which audio content will be reduced
    * @param {number} resonance - Amount of frequency exaggeration around the cutoff as a value between [0.0, 1000.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({cutoffFrequency, resonance}, updateTime) {
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      if (cutoffFrequency != null)
         this.#filterNode.frequency.setValueAtTime(cutoffFrequency, timeToUpdate);
      if (resonance != null)
         this.#filterNode.Q.setValueAtTime(Math.max(resonance, 0.0001), timeToUpdate);
      return true;
   }

   getInputNode() {
      return this.#filterNode;
   }

   getOutputNode() {
      return this.#filterNode;
   }
}
