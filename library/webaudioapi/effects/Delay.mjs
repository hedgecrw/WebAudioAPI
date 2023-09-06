import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Delay effect.
 * 
 * A Delay effect replicates an audio signal and plays back one or more possibly attenuated
 * copies at a later, user-specified time.
 * 
 * @extends EffectBase
 */
export class Delay extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode;
   /** @type {GainNode} */
   #outputNode;
   /** @type {DelayNode} */
   #delayNode;
   /** @type {GainNode} */
   #gainNode;

   // Parameter limits
   static minDelay = 0;
   static maxDelay = 1;
   static minAttenuation = 0;
   static maxAttenuation = 1;

   /**
    * Constructs a new {@link Delay} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      this.#delayNode = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#gainNode = new GainNode(audioContext);
      this.#inputNode.connect(this.#outputNode);
      this.#inputNode.connect(this.#delayNode).connect(this.#gainNode).connect(this.#outputNode);
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
         { name: 'delay', type: 'number', validValues: [Delay.minDelay, Delay.maxDelay], defaultValue: Delay.minDelay },
         { name: 'attenuation', type: 'number', validValues: [Delay.minAttenuation, Delay.maxAttenuation], defaultValue: Delay.minAttenuation }
      ];
   }

   async load() {
      this.#inputNode.gain.value = this.#outputNode.gain.value = 1;
      this.#delayNode.delayTime.value = Delay.minDelay;
      this.#gainNode.gain.value = 1.0 - Delay.minAttenuation;
   }

   /**
    * Updates the {@link Delay} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} delay - Number of seconds to delay outputting the audio signal between [0, 1]
    * @param {number} attenuation - Amount to attenuate the delayed signal as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({delay, attenuation}, updateTime, timeConstant) {
      if ((delay == null) && (attenuation == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Delay effect without at least one of the following parameters: "delay, attenuation"');
      if (delay != null) {
         if (delay < Delay.minDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be less than ${Delay.minDelay}`);
         else if (delay > Delay.maxDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be greater than ${Delay.maxDelay}`);
      }
      if (attenuation != null) {
         if (attenuation < Delay.minAttenuation)
            throw new WebAudioApiErrors.WebAudioValueError(`Attenuation value cannot be less than ${Delay.minAttenuation}`);
         else if (attenuation > Delay.maxAttenuation)
            throw new WebAudioApiErrors.WebAudioValueError(`Attenuation value cannot be greater than ${Delay.maxAttenuation}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (delay != null)
         this.#delayNode.delayTime.setTargetAtTime(delay, timeToUpdate, timeConstantTarget);
      if (attenuation != null)
         this.#gainNode.gain.setTargetAtTime(1.0 - attenuation, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
