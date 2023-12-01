import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing an Echo effect.
 * 
 * An Echo effect represents more or more reflections of an original audio signal. It is similar
 * to a Delay effect, except that echoes themselves can feed back into the audio processing loop,
 * resulting in additional, decaying echoes.
 * 
 * @extends EffectBase
 */
export class Echo extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode;
   /** @type {DelayNode} */
   #delayNode;
   /** @type {GainNode} */
   #feedbackNode;
   /** @type {GainNode} */
   #outputNode;

   // Parameter limits
   static minEchoTime = 0;
   static maxEchoTime = 1;
   static minFeedback = 0;
   static maxFeedback = 0.95;

   /**
    * Constructs a new {@link Echo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      this.#delayNode = new DelayNode(audioContext, { maxDelayTime: Echo.maxEchoTime });
      this.#feedbackNode = new GainNode(audioContext);
      this.#inputNode.connect(this.#outputNode);
      this.#inputNode.connect(this.#delayNode).connect(this.#feedbackNode).connect(this.#delayNode).connect(this.#outputNode);
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
         { name: 'echoTime', type: 'number', validValues: [Echo.minEchoTime, Echo.maxEchoTime], defaultValue: Echo.minEchoTime },
         { name: 'intensity', type: 'number', validValues: [Echo.minFeedback, Echo.maxFeedback], defaultValue: Echo.minFeedback },
      ];
   }

   async load() {
      this.#inputNode.gain.value = this.#outputNode.gain.value = 1;
      this.#delayNode.delayTime.value = Echo.minEchoTime;
      this.#feedbackNode.gain.value = Echo.minFeedback;
   }

   /**
    * Updates the {@link Echo} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} echoTime - Number of seconds between the original audio and its first echo between [0, 1]
    * @param {number} intensity - Percentage of the original audio that will be present in each consecutive echo between [0, 0.95]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({echoTime, intensity}, updateTime, timeConstant) {
      if ((echoTime == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Echo effect without at least one of the following parameters: "echoTime, intensity"');
      if (echoTime != null) {
         if (echoTime < Echo.minEchoTime)
            throw new WebAudioApiErrors.WebAudioValueError(`EchoTime value cannot be less than ${Echo.minEchoTime}`);
         else if (echoTime > Echo.maxEchoTime)
            throw new WebAudioApiErrors.WebAudioValueError(`EchoTime value cannot be greater than ${Echo.maxEchoTime}`);
      }
      if (intensity != null) {
         if (intensity < Echo.minFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Echo.minFeedback}`);
         else if (intensity > Echo.maxFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Echo.maxFeedback}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (echoTime != null)
         this.#delayNode.delayTime.setTargetAtTime(echoTime, timeToUpdate, timeConstantTarget);
      if (intensity != null) 
         this.#feedbackNode.gain.setTargetAtTime(intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   currentParameterValues() {
      return {
         echoTime: this.#delayNode.delayTime.value,
         intensity: this.#feedbackNode.gain.value
      };
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
