import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Distortion effect.
 * 
 * A Distortion effect alters an audio waveform by adding a large amount of gain to the audio
 * signal, normally to the point of clipping the signal. This creates a distorted, gritty feeling,
 * most commonly used with electrical instruments.
 * 
 * @extends EffectBase
 */
export class Distortion extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #outputNode;
   /** @type {BiquadFilterNode} */
   #preBandpassNode;
   /** @type {WaveShaperNode} */
   #distortionNode;

   // Parameter limits
   static minTone = 0;
   static maxTone = 22050;
   static minIntensity = 0;
   static maxIntensity = 1;

   /**
    * Constructs a new {@link Distortion} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#outputNode = new GainNode(audioContext);
      this.#preBandpassNode = new BiquadFilterNode(audioContext, { type: 'lowpass' });
      this.#distortionNode = new WaveShaperNode(audioContext);
      this.#preBandpassNode.connect(this.#distortionNode).connect(this.#outputNode);
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
         { name: 'tone', type: 'number', validValues: [Distortion.minTone, Distortion.maxTone], defaultValue: 3000 },
         { name: 'intensity', type: 'number', validValues: [Distortion.minIntensity, Distortion.maxIntensity], defaultValue: 0.5 }
      ];
   }

   async load() {
      const driveValue = 0.5, n = 22050, deg = Math.PI / 180;
      const k = driveValue * 100, curve = new Float32Array(n);
      this.#preBandpassNode.frequency.value = 3000;
      for (let i = 0; i < n; ++i) {
         const x = i * 2 / n - 1;
         curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      this.#distortionNode.curve = curve;
      this.#outputNode.gain.value = driveValue;
   }

   /**
    * Updates the {@link Distortion} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} tone - Low-pass cutoff frequency in Hz for filtering before distortion between [0, 22050]
    * @param {number} intensity - Ratio of distorted-to-original sound as a percentage between [0, 1]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ tone, intensity }, updateTime, timeConstant) {
      if ((tone == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Distortion effect without at least one of the following parameters: "tone, intensity"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (tone != null)
         this.#preBandpassNode.frequency.setTargetAtTime(tone, timeToUpdate, timeConstantTarget);
      if (intensity != null) {
         const n = 22050, deg = Math.PI / 180;
         const k = intensity * 100, curve = new Float32Array(n);
         for (let i = 0; i < n; ++i) {
            const x = i * 2 / n - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
         }
         this.#distortionNode.curve = curve;
         const gainOffset = (intensity < 0.5) ? (Math.exp(2.3 * (0.5 - intensity)) - 0.5) : (0.5 + (0.2 * (0.5 - intensity)));
         this.#outputNode.gain.setTargetAtTime(gainOffset, timeToUpdate, timeConstantTarget);
      }
      return true;
   }

   getInputNode() {
      return this.#preBandpassNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
