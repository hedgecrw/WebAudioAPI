import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Volume effect.
 * 
 * A Volume effect modulates the overall loudness of an audio signal.
 * 
 * @extends EffectBase
 */
export class Volume extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #volumeNode;

   /**
    * Constructs a new {@link Volume} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#volumeNode = new GainNode(audioContext);
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
         { name: 'intensityPercent', type: 'number', validValues: [0, 1], defaultValue: 1 }
      ];
   }

   async load() {
      this.#volumeNode.gain.value = 1.0;
   }

   /* eslint no-empty-pattern: "off" */
   /**
    * Updates the {@link Volume} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} intensityPercent - Intensity of the volume as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({}, intensityPercent, updateTime) {
      this.#volumeNode.gain.setValueAtTime(intensityPercent, updateTime == null ? this.audioContext.currentTime : updateTime);
      return true;
   }

   getInputNode() {
      return this.#volumeNode;
   }

   getOutputNode() {
      return this.#volumeNode;
   }
}
