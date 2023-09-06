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
   #lfoNode;
   /** @type {GainNode} */
   #normalizationNode;
   /** @type {GainNode} */
   #depthNode;

   // Parameter limits
   static minRate = 0;
   static maxRate = 20;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Tremolo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#normalizationNode = new GainNode(audioContext);
      this.#depthNode = new GainNode(audioContext);
      this.#lfoNode = new OscillatorNode(audioContext);
      this.#lfoNode.connect(this.#depthNode).connect(this.#normalizationNode.gain);
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
         { name: 'rate', type: 'number', validValues: [Tremolo.minRate, Tremolo.maxRate], defaultValue: 10 },
         { name: 'intensity', type: 'number', validValues: [Tremolo.minIntensity, Tremolo.maxIntensity], defaultValue: 0 }
      ];
   }

   async load() {
      this.#lfoNode.type = 'sine';
      this.#lfoNode.frequency.value = 10;
      this.#normalizationNode.gain.value = 1;
      this.#depthNode.gain.value = 0;
      this.#lfoNode.start();
   }

   /**
    * Updates the {@link Tremolo} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} rate - Frequency at which an oscillator modulates the tremolo signal in Hz between [0, 40]
    * @param {number} intensity - Intensity of the effect as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ rate, intensity }, updateTime, timeConstant) {
      if ((rate == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Tremolo effect without at least one of the following parameters: "rate, intensity"');
      if (rate != null) {
         if (rate < Tremolo.minRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Tremolo.minRate}`);
         else if (rate > Tremolo.maxRate)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Tremolo.maxRate}`);
      }
      if (intensity != null) {
         if (intensity < Tremolo.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Tremolo.minIntensity}`);
         else if (intensity > Tremolo.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Tremolo.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (rate != null)
         this.#lfoNode.frequency.setTargetAtTime(rate, timeToUpdate, timeConstantTarget);
      if (intensity != null) {
         this.#depthNode.gain.setTargetAtTime(0.5 * intensity, timeToUpdate, timeConstantTarget);
         this.#normalizationNode.gain.setTargetAtTime(1.0 - (0.5 * intensity), timeToUpdate, timeConstantTarget);
      }
      return true;
   }

   getInputNode() {
      return this.#normalizationNode;
   }

   getOutputNode() {
      return this.#normalizationNode;
   }
}
