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

   /** @type {GainNode} */
   #destination;
   /** @type {GainNode} */
   #dry;
   /** @type {GainNode} */
   #wet;
   /** @type {DelayNode} */
   #delayNode;
   /** @type {OscillatorNode} */
   #lfo;
   /** @type {GainNode} */
   #feedback;

   /**
    * Constructs a new {@link Flanger} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#destination = new GainNode(audioContext);
      this.#dry = new GainNode(audioContext);
      this.#wet = new GainNode(audioContext);
      this.#delayNode = new DelayNode(audioContext);
      this.#lfo = new OscillatorNode(audioContext, { frequency: 0 });
      this.#feedback = new GainNode(audioContext);

      this.#dry.gain.value = 1;
      this.#wet.gain.value = 0.2;
      this.#feedback.gain.value = 0;
      this.#delayNode.delayTime.value = 0;
      this.#lfo.type = 'sine';
      this.#lfo.start();

      this.#dry.connect(this.#wet);
      this.#dry.connect(this.#destination);
      this.#wet.connect(this.#delayNode).connect(this.#destination);
      this.#delayNode.connect(this.#feedback);
      this.#lfo.connect(this.#delayNode);
      this.#feedback.connect(this.#wet);
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
         { name: 'rate', type: 'number', validValues: [0, 2], defaultValue: 0 },
         { name: 'shape', type: 'string', validValues: ['sine', 'triangle'], defaultValue: 'sine' },
         { name: 'delayOffset', type: 'number', validValues: [0, 0.015], defaultValue: 0 },
         { name: 'variableFeedback', type: 'number', validValues: [0, 1], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [0, 2], defaultValue: 0 },
      ];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Flanger} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the delayed flanger signal
    * @param {string} shape - Waveform shape used to modulate the delayed flanger signal
    * @param {number} delayOffset - Number of seconds of delay between the original signal and the flanger signal
    * @param {number} variableFeedback - Percentage of processed signal to be fed back into the flanger circuit
    * @param {number} intensity - Ratio of flangered-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, shape, delayOffset, variableFeedback, intensity}, updateTime, timeConstant) {
      if ((rate == null) && (shape == null) && (delayOffset == null) && (variableFeedback == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Flanger effect without at least one of the following parameters: "rate, shape, delayOffset, variableFeedback, intensity"');
      if ((shape != 'sine') && (shape != 'triangle'))
         throw new WebAudioApiErrors.WebAudioValueError('Flanger effect "shape" parameter must take one of the following values: "sine, "triangle"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null)
         this.#lfo.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (shape != null) 
         this.#lfo.type = shape;
      if (delayOffset != null)
         this.#delayNode.delayTime.setTargetAtTime(delayOffset * 1, timeToUpdate, timeConstantTarget);
      if (variableFeedback != null)
         this.#feedback.gain.setTargetAtTime(variableFeedback, timeToUpdate, timeConstantTarget);
      if (intensity != null)
         this.#wet.gain.setTargetAtTime(intensity, timeToUpdate, timeConstantTarget);
      return false;
   }

   getInputNode() {
      return this.#dry;
   }

   getOutputNode() {
      return this.#destination;
   }
}
