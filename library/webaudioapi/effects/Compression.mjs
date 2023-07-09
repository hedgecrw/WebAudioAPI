import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Compression effect.
 * 
 * A Compression effect, also known as Dynamic Range Compression, alters an audio signal such
 * that a steady volume is maintained throughout audio playback. This is achieved by amplifying
 * quieter sounds and attenuating louder sounds to help create signal homogeneity.
 * 
 * @extends EffectBase
 */
export class Compression extends EffectBase {

   // Effect-specific private variables
   /** @type {DynamicsCompressorNode} */
   #compressorNode;

   /**
    * Constructs a new {@link Compression} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#compressorNode = new DynamicsCompressorNode(audioContext);
   }

   async load() {
      this.#compressorNode.threshold.value = -24;
      this.#compressorNode.attack.value = 0.003;
      this.#compressorNode.release.value = 0.25;
      this.#compressorNode.ratio.value = 1.0;
   }

   /**
    * Updates the {@link Compression} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} threshold - Decibel loudness of the input signal above which the compressor kicks in between [-100.0, 0.0]
    * @param {number} attack - Number of seconds required to reduce signal gain by 10 dB between [0.0, 1.0]
    * @param {number} release - Number of seconds required to increase signal gain by 10 dB between [0.0, 1.0]
    * @param {number} intensityPercent - Amount of compression applied as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({threshold, attack, release, intensityPercent, updateTime}) {
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      if (threshold != null)
         this.#compressorNode.threshold.setValueAtTime(threshold, timeToUpdate);
      if (attack != null)
         this.#compressorNode.attack.setValueAtTime(attack, timeToUpdate);
      if (release != null)
         this.#compressorNode.release.setValueAtTime(release, timeToUpdate);
      if (intensityPercent != null) {
         const ratioValue = 1.0 + (intensityPercent * 19.0);
         this.#compressorNode.ratio.setValueAtTime(ratioValue, timeToUpdate);
      }
      return true;
   }

   getInputNode() {
      return this.#compressorNode;
   }

   getOutputNode() {
      return this.#compressorNode;
   }
}
