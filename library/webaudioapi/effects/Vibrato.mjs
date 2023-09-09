import * as WebAudioApiErrors from '../modules/Errors.mjs';
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

   // Effect-specific private variables
   /** @type {OscillatorNode} */
   #lfoNode;
   /** @type {DelayNode} */
   #delayNode;
   /** @type {GainNode} */
   #gainNode;

   // Parameter limits
   static minRate = 0;
   static maxRate = 10;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Vibrato} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#lfoNode = new OscillatorNode(audioContext);
      this.#delayNode = new DelayNode(audioContext, { maxDelayTime: 1 });
      this.#gainNode = new GainNode(audioContext);
      this.#lfoNode.connect(this.#gainNode).connect(this.#delayNode.delayTime);
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
         { name: 'rate', type: 'number', validValues: [Vibrato.minRate, Vibrato.maxRate], defaultValue: 8 },
         { name: 'intensity', type: 'number', validValues: [Vibrato.minIntensity, Vibrato.maxIntensity], defaultValue: 0 }
      ];
   }

   async load() {
      this.#gainNode.gain.value = 0;
      this.#delayNode.delayTime.value = 0.01;
      this.#lfoNode.frequency.value = 8;
      this.#lfoNode.type = 'sine';
      this.#lfoNode.start();
   }

   /**
    * Updates the {@link Vibrato} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the vibrato signal in Hz between [0, 10]
    * @param {number} intensity - Intensity of the effect as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate, intensity }, updateTime, timeConstant) {
      if ((rate == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Vibrato effect without at least one of the following parameters: "rate, intensity"');
      if (rate != null) {
         if (rate < Vibrato.minRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Vibrato.minRate}`);
         else if (rate > Vibrato.maxRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Vibrato.maxRate}`);
      }
      if (intensity != null) {
         if (intensity < Vibrato.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Vibrato.minIntensity}`);
         else if (intensity > Vibrato.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Vibrato.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null) 
         this.#lfoNode.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (intensity != null)
         this.#gainNode.gain.setTargetAtTime(0.001 * intensity, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#delayNode;
   }

   getOutputNode() {
      return this.#delayNode;
   }
}
