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
   /** @type {DelayNode} */
   #delay;
   /** @type {OscillatorNode} */
   #lfo;
   /** @type {GainNode} */
   #lfoGain;
   /** @type {GainNode} */
   #feedBack;
   /** @type {GainNode} */
   #wet;

   /**
    * Constructs a new {@link Flanger} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   
      // Set up dry signal destination
      this.#dry = new GainNode(audioContext, {gain: 1});
      this.#destination = new GainNode(audioContext);
      this.#dry.connect(this.#destination);

      // Set up delay 
      this.#delay = new DelayNode(audioContext, {delayTime: 0});
      this.#dry.connect(this.#delay);

      // Create feedback loop
      this.#feedBack = new GainNode(audioContext, {gain: 0});
      this.#delay.connect(this.#feedBack);
      this.#feedBack.connect(this.#delay);

      // Set up lfo
      this.#lfo = new OscillatorNode(audioContext, {frequency: 0});
      this.#lfoGain = new GainNode(audioContext, {gain: 0.0005});
      this.#lfo.connect(this.#lfoGain).connect(this.#delay.delayTime);
      this.#lfo.start();
      
      // Set up wet signal 
      this.#wet = new GainNode(audioContext, {gain: 0});
      this.#delay.connect(this.#wet);
      this.#wet.connect(this.#destination);
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
         { name: 'rate', type: 'number', validValues: [0, 1], defaultValue: 0 },
         { name: 'shape', type: 'string', validValues: ['sine', 'square', 'sawtooth', 'triangle'], defaultValue: 'sine' },
         { name: 'delayOffset', type: 'number', validValues: [0, 0.007], defaultValue: 0 },
         { name: 'variableFeedback', type: 'number', validValues: [0, 1], defaultValue: 0 },
         { name: 'intensity', type: 'number', validValues: [0, 1], defaultValue: 0 },
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
         this.#delay.delayTime.setTargetAtTime(delayOffset, timeToUpdate, timeConstantTarget);
      if (variableFeedback != null)
         this.#feedBack.gain.setTargetAtTime(variableFeedback, timeToUpdate, timeConstantTarget);
      if (intensity != null)
         this.#wet.gain.setTargetAtTime(intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#dry;
   }

   getOutputNode() {
      return this.#destination;
   }
}
