import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Flanger effect.
 * 
 * A Flanger effect generates a delayed, modulated version of an original audio signal which gets
 * played slightly out-of-phase and slower than the original.
 * 
 * @extends EffectBase
 */
export class Flanger extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode;
   /** @type {GainNode} */
   #outputNode;
   /** @type {DelayNode} */
   #delayNode;
   /** @type {OscillatorNode} */
   #lfoNode;
   /** @type {GainNode} */
   #lfoGainNode;
   /** @type {GainNode} */
   #feedbackNode;

   // Parameter limits
   static minRate = 0;
   static maxRate = 10;
   static minDelay = 0.0001;
   static maxDelay = 0.01;
   static minFeedback = 0;
   static maxFeedback = 0.95;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Flanger} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   
      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      this.#delayNode = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#lfoNode = new OscillatorNode(audioContext);
      this.#lfoGainNode = new GainNode(audioContext);
      this.#feedbackNode = new GainNode(audioContext);

      this.#lfoNode.connect(this.#lfoGainNode).connect(this.#delayNode.delayTime);
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
         { name: 'rate', type: 'number', validValues: [Flanger.minRate, Flanger.maxRate], defaultValue: 0.8 },
         { name: 'shape', type: 'string', validValues: ['sine', 'square', 'sawtooth', 'triangle'], defaultValue: 'sine' },
         { name: 'delay', type: 'number', validValues: [Flanger.minDelay, Flanger.maxDelay], defaultValue: 0.0075 },
         { name: 'feedback', type: 'number', validValues: [Flanger.minFeedback, Flanger.maxFeedback], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [Flanger.minIntensity, Flanger.maxIntensity], defaultValue: 0 }
      ];
   }

   async load() {
      this.#inputNode.gain.value = 0.5;
      this.#outputNode.gain.value = 1;
      this.#lfoGainNode.gain.value = 0;
      this.#delayNode.delayTime.value = 0.0075;
      this.#feedbackNode.gain.value = 0;
      this.#lfoNode.frequency.value = 0.8;
      this.#lfoNode.type = 'sine';
      this.#lfoNode.start();
   }

   /**
    * Updates the {@link Flanger} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the delayed flanger signal in Hertz between [0, 10]
    * @param {string} shape - Waveform shape used to modulate the delayed flanger signal from ['sine', 'square', 'sawtooth', 'triangle']
    * @param {number} delay - Number of seconds delay between the original signal and the modulated flanger signal between [0.0001, 0.01]
    * @param {number} feedback - Percentage of processed signal to be fed back into the flanger circuit between [0, 0.95]
    * @param {number} intensity - Ratio of flangered-to-original sound as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate, shape, delay, feedback, intensity }, updateTime, timeConstant) {
      if ((rate == null) && (shape == null) && (delay == null) && (feedback == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Flanger effect without at least one of the following parameters: "rate, shape, delay, feedback, intensity"');
      if (rate != null) {
         if (rate < Flanger.minRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Flanger.minRate}`);
         else if (rate > Flanger.maxRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Flanger.maxRate}`);
      }
      if (shape != null) {
         if (!['sine', 'square', 'sawtooth', 'triangle'].includes(shape))
            throw new WebAudioApiErrors.WebAudioValueError('Shape value must be one of: ["sine", "square", "sawtooth", "triangle"]');
      }
      if (delay != null) {
         if (delay < Flanger.minDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be less than ${Flanger.minDelay}`);
         else if (delay > Flanger.maxDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be greater than ${Flanger.maxDelay}`);
      }
      if (feedback != null) {
         if (feedback < Flanger.minFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be less than ${Flanger.minFeedback}`);
         else if (feedback > Flanger.maxFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be greater than ${Flanger.maxFeedback}`);
      }
      if (intensity != null) {
         if (intensity < Flanger.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Flanger.minIntensity}`);
         else if (intensity > Flanger.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Flanger.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null)
         this.#lfoNode.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (shape != null)
         this.#lfoNode.type = shape;
      if (delay != null)
         this.#delayNode.delayTime.setTargetAtTime(delay, timeToUpdate, timeConstantTarget);
      if (feedback != null)
         this.#feedbackNode.gain.setTargetAtTime(feedback, timeToUpdate, timeConstantTarget);
      if (intensity != null)
         this.#lfoGainNode.gain.setTargetAtTime(this.#delayNode.delayTime.value * intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
