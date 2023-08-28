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

   /** @type {GainNode} */
   #dry; #desination; #lfoGain; #feedback;
   /** @type {BiquadFilterNode} */
   #pole;
   /** @type {OscillatorNode} */
   #lfo;

   /**
    * Constructs a new {@link Phaser} effect object.
    */
   constructor(audioContext) {
      super(audioContext);

      // set up dry signal
      this.#dry = new GainNode(audioContext, { gain: 1 });
      this.#desination = new GainNode(audioContext);
      this.#dry.connect(this.#desination);

      // Set up pole
      this.#pole = new BiquadFilterNode(audioContext, { type: 'allpass' });
      this.#dry.connect(this.#pole);
      this.#pole.connect(this.#desination);

      // set up lfo
      this.#lfo = new OscillatorNode(audioContext, { frequency: 0 });
      this.#lfoGain = new GainNode(audioContext, { gain: 0 });
      this.#lfo.connect(this.#lfoGain).connect(this.#pole.detune);
      this.#lfo.start();

      // set up feedback
      this.#feedback = new GainNode(audioContext, { gain: 0 });
      this.#pole.connect(this.#feedback);
      this.#feedback.connect(this.#pole);
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
         { name: 'poles', type: 'number', validValues: [1, 8], defaultValue: 4},
         { name: 'frequency', type: 'number', validValues: [1, 22050], defaultValue: 1 },
         { name: 'rate', type: 'number', validValues: [0, 1], defaultValue: 0},
         { name: 'depth', type: 'number', validValues: [0, 10000], defaultValue: 0},
         { name: 'feedback', type: 'number', validValues: [0, 1], defaultValue: 0},
      ];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Phaser} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} poles - Number of all-pass filters being used by the phaser
    * @param {number} frequency - Center frequency of the all-pass filters
    * @param {number} rate - Rate at which the cuts in the bandpass filters are modulated
    * @param {number} depth - Amplitude of the lfo
    * @param {number} feedback - Percentage of phased signal that will be fed back into the phased audio circuit
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({poles, frequency, rate, depth, feedback}, updateTime, timeConstant) {
      if ((poles == null) && (frequency == null) && (rate == null) && (depth == null) && (feedback == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Phaser effect without at least one of the following parameters: "poles, frequency, rate, depth, feedback"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (poles != null)
         console.log(Math.round(poles));
      if (frequency != null)
         this.#pole.frequencysetTargetAtTime(frequency, timeToUpdate, timeConstantTarget);
      if (rate != null) 
         this.#lfo.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (depth != null)
         this.#lfoGain.gain.setTargetAtTime(depth, timeToUpdate, timeConstantTarget);
      if (feedback != null) 
         this.#feedback.gain.setTargetAtTime(feedback, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#dry;
   }

   getOutputNode() {
      return this.#desination;
   }
}
