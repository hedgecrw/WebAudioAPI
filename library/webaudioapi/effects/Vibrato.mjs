import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Vibrato effect.
 * 
 * A Vibrato effect modulates an audio signal to produce a wavering effect based on rapidly
 * varying the pitch of the signal. Perceptually, it is similar to tremolo; however, tremolo is
 * achieved by altering volume, whereas vibrato is achieved by altering pitch.
 * 
 * @extends EffectBase
 */
export class Vibrato extends EffectBase {

   /** @type {DelayNode} */
   #delay;
   /** @type {OscillatorNode} */
   #lfo;
   /** @type {GainNode} */
   #gain;

   /**
    * Constructs a new {@link Vibrato} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#delay = new DelayNode(audioContext, {delayTime: 1, maxDelayTime: 10});
      this.#lfo = new OscillatorNode(audioContext, {frequency: 5});
      this.#gain = new GainNode(audioContext, {gain: 0});
      this.#lfo.connect(this.#gain).connect(this.#delay.delayTime);
      this.#lfo.start();
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
         { name: 'rate', type: 'number', validValues: [0, 8], defaultValue: 5 }, 
         { name: 'depth', type: 'number', validValues: [0, 0.1], defaultValue: 0 }, 
      ];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Vibrato} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the audio signal
    * @param {number} depth - Amount of pitch variation as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, depth}, updateTime) {
      if (rate != null)
         this.#lfo.frequency.value = rate;
      if (depth != null) 
         this.#gain.gain.value = (depth / (2 * Math.PI * this.#lfo.frequency.value));
      return true;
   }

   getInputNode() {
      return this.#delay;
   }

   getOutputNode() {
      return this.#delay;
   }
}
