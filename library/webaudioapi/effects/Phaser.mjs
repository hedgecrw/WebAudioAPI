import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Phaser effect.
 * 
 * A Phaser effect manipulates an audio signal by generating high-pass filters in the form of
 * peaks in the frequency spectrum which are used to create cuts in the high-frequency ranges
 * of the original audio signal and modulate them up and down throughout the audio. This effect
 * is frequently used in funk music, and it adds character to individual notes to create a form
 * of swirling movement in the audio.
 * 
 * @extends EffectBase
 */
export class Phaser extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode;
   /** @type {GainNode} */
   #outputNode;
   /** @type {BiquadFilterNode[]} */
   #filterNodes = [];
   /** @type {OscillatorNode} */
   #lfoNode;
   /** @type {GainNode} */
   #lfoGainNode;
   /** @type {GainNode} */
   #feedbackNode;
   /** @type {number} */
   #frequencyValue;


   // Parameter limits
   static numPoles = 9;
   static minRate = 0;
   static maxRate = 10;
   static minFrequency = 1;
   static maxFrequency = 22050;
   static minFeedback = 0;
   static maxFeedback = 0.95;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Phaser} effect object.
    */
   constructor(audioContext) {
      super(audioContext);

      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      for (let i = 0; i < Phaser.numPoles; ++i)
         this.#filterNodes.push(new BiquadFilterNode(audioContext, { type: 'allpass', Q: 0.1 }));
      this.#lfoNode = new OscillatorNode(audioContext);
      this.#lfoGainNode = new GainNode(audioContext);
      this.#feedbackNode = new GainNode(audioContext);

      this.#outputNode.connect(this.#feedbackNode).connect(this.#inputNode);
      for (let i = 0; i < Phaser.numPoles; ++i) {
         this.#lfoNode.connect(this.#lfoGainNode).connect(this.#filterNodes[i].detune);
         this.#inputNode.connect(this.#filterNodes[i]).connect(this.#outputNode);
      }
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
         { name: 'rate', type: 'number', validValues: [Phaser.minRate, Phaser.maxRate], defaultValue: 8 },
         { name: 'shape', type: 'string', validValues: ['sine', 'square', 'sawtooth', 'triangle'], defaultValue: 'sine' },
         { name: 'frequency', type: 'number', validValues: [Phaser.minFrequency, Phaser.maxFrequency], defaultValue: 1500 },
         { name: 'feedback', type: 'number', validValues: [Phaser.minFeedback, Phaser.maxFeedback], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [Phaser.minIntensity, Phaser.maxIntensity], defaultValue: 0 }
      ];
   }

   async load() {
      this.#frequencyValue = 1500;
      this.#inputNode.gain.value = 0.5;
      this.#outputNode.gain.value = 0.2;
      this.#lfoGainNode.gain.value = 0;
      for (let i = 0; i < Phaser.numPoles; ++i)
         this.#filterNodes[i].frequency.value = 1500 + ((22050 - 1500) / (1 + Phaser.numPoles)) * i;
      this.#feedbackNode.gain.value = 0;
      this.#lfoNode.frequency.value = 8;
      this.#lfoNode.type = 'sine';
      this.#lfoNode.start();
   }

   /**
    * Updates the {@link Phaser} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the phaser signal in Hertz between [0, 10]
    * @param {string} shape - Waveform shape used to modulate the phaser signal from ['sine', 'square', 'sawtooth', 'triangle']
    * @param {number} frequency - Starting frequency of the all-pass filter between [1, 22050]
    * @param {number} feedback - Percentage of processed signal to be fed back into the phaser circuit between [0, 0.95]
    * @param {number} intensity - Ratio of processed-to-original sound as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate, shape, frequency, feedback, intensity }, updateTime, timeConstant) {
      if ((rate == null) && (shape == null) && (frequency == null) && (feedback == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Phaser effect without at least one of the following parameters: "rate, shape, frequency, feedback, intensity"');
      if (rate != null) {
         if (rate < Phaser.minRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Phaser.minRate}`);
         else if (rate > Phaser.maxRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Phaser.maxRate}`);
      }
      if (shape != null) {
         if (!['sine', 'square', 'sawtooth', 'triangle'].includes(shape))
            throw new WebAudioApiErrors.WebAudioValueError('Shape value must be one of: ["sine", "square", "sawtooth", "triangle"]');
      }
      if (frequency != null) {
         if (frequency < Phaser.minFrequency)
            throw new WebAudioApiErrors.WebAudioValueError(`Frequency value cannot be less than ${Phaser.minFrequency}`);
         else if (frequency > Phaser.maxFrequency)
            throw new WebAudioApiErrors.WebAudioValueError(`Frequency value cannot be greater than ${Phaser.maxFrequency}`);
      }
      if (feedback != null) {
         if (feedback < Phaser.minFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be less than ${Phaser.minFeedback}`);
         else if (feedback > Phaser.maxFeedback)
            throw new WebAudioApiErrors.WebAudioValueError(`Feedback value cannot be greater than ${Phaser.maxFeedback}`);
      }
      if (intensity != null) {
         if (intensity < Phaser.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Phaser.minIntensity}`);
         else if (intensity > Phaser.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Phaser.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null)
         this.#lfoNode.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (shape != null)
         this.#lfoNode.type = shape;
      if (frequency != null) {
         this.#frequencyValue = frequency;
         for (let i = 0; i < Phaser.numPoles; ++i)
            this.#filterNodes[i].frequency.setTargetAtTime(frequency + ((22050 - frequency) / (1 + Phaser.numPoles)) * i, timeToUpdate, timeConstantTarget);
      }
      if (feedback != null)
         this.#feedbackNode.gain.setTargetAtTime(feedback, timeToUpdate, timeConstantTarget);
      if (intensity != null)
         this.#lfoGainNode.gain.setTargetAtTime(1000 * intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   currentParameterValues() {
      return {
         rate: this.#lfoNode.frequency.value,
         shape: this.#lfoNode.type,
         frequency: this.#frequencyValue,
         feedback: this.#feedbackNode.gain.value,
         intensity: 0.001 * this.#lfoGainNode.gain.value
      };
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
