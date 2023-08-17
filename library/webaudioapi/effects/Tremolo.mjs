import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Tremolo effect.
 * 
 * A Tremolo effect modulates an audio signal to produce a wavering effect based on rapidly
 * varying the amplitude of the signal. Acoustically, it is created by rapidly reiterating
 * the same note over and over. Perceptually, it is similar to vibrato; however, vibrato is
 * achieved by altering pitch, whereas tremolo is achieved by altering volume.
 * 
 * @extends EffectBase
 */
export class Tremolo extends EffectBase {

   /** @type {OscillatorNode} */
   #lfo;
   /** @type {GainNode} */
   #gain;

   /**
    * Constructs a new {@link Tremolo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#lfo = audioContext.createOscillator();
      this.#gain = audioContext.createGain();
      this.#lfo.frequency.value = 0;
      this.#lfo.connect(this.#gain.gain);
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
         { name: 'rate', type: 'number', validValues: [0, 20], defaultValue: 0 },
      ];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Tremolo} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the tremolo signal
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate }, updateTime, timeConstant) {
      if (rate == null)
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Tremolo effect without at least one of the following parameters: "rate"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      this.#lfo.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#gain;
   }

   getOutputNode() {
      return this.#gain;
   }
}
