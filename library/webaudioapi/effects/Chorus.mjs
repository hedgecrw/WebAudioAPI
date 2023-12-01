import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Chorus effect.
 * 
 * A Chorus effect is an audio modulation effect that replicates an audio signal and modulates
 * and delays the result, such that it comes directly after and alters the original signal's
 * pitch. This effect is used to thicken the tone of an audio signal and create an epic feeling.
 * 
 * @extends EffectBase
 */
export class Chorus extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode;
   /** @type {GainNode} */
   #outputNode;
   /** @type {DelayNode} */
   #wetDelayNode;
   /** @type {OscillatorNode} */
   #lfoNode;
   /** @type {GainNode} */
   #lfoGainNode;
   /** @type {DelayNode} */
   #delayLeft;
   /** @type {DelayNode} */
   #delayRight;
   /** @type {GainNode} */
   #feedbackLeft;
   /** @type {GainNode} */
   #feedbackRight;

   // Parameter limits
   static minRate = 0;
   static maxRate = 10;
   static minDelay = 0.0001;
   static maxDelay = 0.1;
   static minFeedback = 0;
   static maxFeedback = 0.95;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Chorus} effect object.
    */
   constructor(audioContext) {
      super(audioContext);

      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      const splitter = new ChannelSplitterNode(audioContext, { numberOfOutputs: 2 });
      this.#lfoNode = new OscillatorNode(audioContext);
      this.#delayLeft = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#delayRight = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#wetDelayNode = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#lfoGainNode = new GainNode(audioContext);
      this.#feedbackLeft = new GainNode(audioContext);
      this.#feedbackRight = new GainNode(audioContext);
      const merger = new ChannelMergerNode(audioContext, { numberOfInputs: 2 });

      this.#lfoNode.connect(this.#lfoGainNode);
      this.#lfoGainNode.connect(this.#delayLeft.delayTime);
      this.#lfoGainNode.connect(this.#delayRight.delayTime);

      this.#inputNode.connect(this.#outputNode);
      this.#inputNode.connect(this.#wetDelayNode);
      this.#wetDelayNode.connect(splitter);
      splitter.connect(this.#delayLeft, 0);
      splitter.connect(this.#delayRight, 1);
      this.#delayLeft.connect(this.#feedbackLeft).connect(this.#delayRight).connect(merger, 0, 1);
      this.#delayRight.connect(this.#feedbackRight).connect(this.#delayLeft).connect(merger, 0, 0);
      merger.connect(this.#outputNode);
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
         { name: 'rate', type: 'number', validValues: [Chorus.minRate, Chorus.maxRate], defaultValue: 0.8 },
         { name: 'shape', type: 'string', validValues: ['sine', 'square', 'sawtooth', 'triangle'], defaultValue: 'sine' },
         { name: 'delay', type: 'number', validValues: [Chorus.minDelay, Chorus.maxDelay], defaultValue: 0.03 },
         { name: 'feedback', type: 'number', validValues: [Chorus.minFeedback, Chorus.maxFeedback], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [Chorus.minIntensity, Chorus.maxIntensity], defaultValue: 0 },
      ];
   }

   async load() {
      this.#inputNode.gain.value = 0.5;
      this.#outputNode.gain.value = 1;
      this.#lfoGainNode.gain.value = 0;
      this.#wetDelayNode.delayTime.value = 0.03;
      this.#delayLeft.delayTime.value = this.#delayRight.delayTime.value = 0.01;
      this.#feedbackLeft.gain.value = this.#feedbackRight.gain.value = 0;
      this.#lfoNode.frequency.value = 0.8;
      this.#lfoNode.type = 'sine';
      this.#lfoNode.start();
   }

   /**
    * Updates the {@link Chorus} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the delayed chorus signal in Hertz between [0, 10]
    * @param {string} shape - Waveform shape used to modulate the delayed chorus signal from ['sine', 'square', 'sawtooth', 'triangle']
    * @param {number} delay - Number of seconds delay between the original signal and the modulated chorus signal between [0.0001, 0.1]
    * @param {number} feedback - Percentage of processed signal to be fed back into the chorus circuit between [0, 0.95]
    * @param {number} intensity - Amount of modulation to apply as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate, shape, delay, feedback, intensity }, updateTime, timeConstant) {
      if ((rate == null) && (shape == null) && (delay == null) && (feedback == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Chorus effect without at least one of the following parameters: "rate, shape, delay, feedback, intensity"');
      if (rate != null) {
         if (rate < Chorus.minRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Chorus.minRate}`);
         else if (rate > Chorus.maxRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Chorus.maxRate}`);
      }
      if (shape != null) {
         if (!['sine', 'square', 'sawtooth', 'triangle'].includes(shape))
            throw new WebAudioApiErrors.WebAudioValueError('Shape value must be one of: ["sine", "square", "sawtooth", "triangle"]');
      }
      if (delay != null) {
         if (delay < Chorus.minDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be less than ${Chorus.minDelay}`);
         else if (delay > Chorus.maxDelay)
            throw new WebAudioApiErrors.WebAudioValueError(`Delay value cannot be greater than ${Chorus.maxDelay}`);
      }
      if (feedback != null) {
         if (feedback < Chorus.minFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be less than ${Chorus.minFeedback}`);
         else if (feedback > Chorus.maxFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be greater than ${Chorus.maxFeedback}`);
      }
      if (intensity != null) {
         if (intensity < Chorus.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Chorus.minIntensity}`);
         else if (intensity > Chorus.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Chorus.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null)
         this.#lfoNode.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (shape != null)
         this.#lfoNode.type = shape;
      if (delay != null)
         this.#wetDelayNode.delayTime.setTargetAtTime(delay, timeToUpdate, timeConstantTarget);
      if (feedback != null) {
         this.#feedbackLeft.gain.setTargetAtTime(feedback, timeToUpdate, timeConstantTarget);
         this.#feedbackRight.gain.setTargetAtTime(feedback, timeToUpdate, timeConstantTarget);
      }
      if (intensity != null)
         this.#lfoGainNode.gain.setTargetAtTime(0.001 * intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   currentParameterValues() {
      return {
         rate: this.#lfoNode.frequency.value,
         shape: this.#lfoNode.type,
         delay: this.#wetDelayNode.delayTime.value,
         feedback: this.#feedbackLeft.gain.value,
         intensity: 1000 * this.#lfoGainNode.gain.value
      };
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
