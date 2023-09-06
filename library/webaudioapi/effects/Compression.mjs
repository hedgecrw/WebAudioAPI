import * as WebAudioApiErrors from '../modules/Errors.mjs';
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

   // Parameter limits
   static minThreshold = -100;
   static maxThreshold = 0;
   static minAttack = 0;
   static maxAttack = 1;
   static minRelease = 0;
   static maxRelease = 1;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Compression} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#compressorNode = new DynamicsCompressorNode(audioContext);
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
         { name: 'threshold', type: 'number', validValues: [Compression.minThreshold, Compression.maxThreshold], defaultValue: -24 },
         { name: 'attack', type: 'number', validValues: [Compression.minAttack, Compression.maxAttack], defaultValue: 0.003 },
         { name: 'release', type: 'number', validValues: [Compression.minRelease, Compression.maxRelease], defaultValue: 0.25 },
         { name: 'intensity', type: 'number', validValues: [Compression.minIntensity, Compression.maxIntensity], defaultValue: 0 }
      ];
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
    * @param {number} threshold - Decibel loudness of the input signal above which the compressor kicks in between [-100, 0]
    * @param {number} attack - Number of seconds required to reduce signal gain by 10 dB between [0, 1]
    * @param {number} release - Number of seconds required to increase signal gain by 10 dB between [0, 1]
    * @param {number} intensity - Amount of compression applied as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({threshold, attack, release, intensity}, updateTime, timeConstant) {
      if ((threshold == null) && (attack == null) && (release == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Compression effect without at least one of the following parameters: "threshold, attack, release, intensity"');
      if (threshold != null) {
         if (threshold < Compression.minThreshold)
            throw new WebAudioApiErrors.WebAudioValueError(`Threshold value cannot be less than ${Compression.minThreshold}`);
         else if (threshold > Compression.maxThreshold)
            throw new WebAudioApiErrors.WebAudioValueError(`Threshold value cannot be greater than ${Compression.maxThreshold}`);
      }
      if (attack != null) {
         if (attack < Compression.minAttack)
            throw new WebAudioApiErrors.WebAudioValueError(`Attack value cannot be less than ${Compression.minAttack}`);
         else if (attack > Compression.maxAttack)
            throw new WebAudioApiErrors.WebAudioValueError(`Attack value cannot be greater than ${Compression.maxAttack}`);
      }
      if (release != null) {
         if (release < Compression.minRelease)
            throw new WebAudioApiErrors.WebAudioValueError(`Release value cannot be less than ${Compression.minRelease}`);
         else if (release > Compression.maxRelease)
            throw new WebAudioApiErrors.WebAudioValueError(`Release value cannot be greater than ${Compression.maxRelease}`);
      }
      if (intensity != null) {
         if (intensity < Compression.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Compression.minIntensity}`);
         else if (intensity > Compression.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Compression.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (threshold != null)
         this.#compressorNode.threshold.setTargetAtTime(threshold, timeToUpdate, timeConstantTarget);
      if (attack != null)
         this.#compressorNode.attack.setTargetAtTime(attack, timeToUpdate, timeConstantTarget);
      if (release != null)
         this.#compressorNode.release.setTargetAtTime(release, timeToUpdate, timeConstantTarget);
      if (intensity != null) {
         const ratioValue = 1.0 + (intensity * 19.0);
         this.#compressorNode.ratio.setTargetAtTime(ratioValue, timeToUpdate, timeConstantTarget);
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
