import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Reverb effect.
 * 
 * A Reverb effect represents a complex echo resulting from the absorption of sound by various
 * surfaces in an environment, as well as from multiple echoes reflecting from hard surfaces
 * many times and with differing amplitudes. This effect is useful for creating a sense of
 * spaciousness and can help to unify multiple elements within a musical piece.
 * 
 * @extends EffectBase
 */
export class Reverb extends EffectBase {

   // Effect-specific private variables
   /** @type {ConvolverNode} */
   #convolutionNode;
   /** @type {GainNode} */
   #inputNode; #outputNode;
   /** @type {GainNode} */
   #dryGainNode; #wetGainNode;
   /** @type {number} */
   #relativeRoomSize; #decay;

   // Parameter limits
   static minDecay = 0;
   static maxDecay = 1;
   static minIntensity = 0;
   static maxIntensity = 1;
   static minRoomSize = 0.1;
   static maxRoomSize = 1;

   /**
    * Constructs a new {@link Reverb} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#convolutionNode = new ConvolverNode(audioContext);
      this.#dryGainNode = new GainNode(audioContext);
      this.#wetGainNode = new GainNode(audioContext);
      this.#inputNode = new GainNode(audioContext, { gain: 1 });
      this.#outputNode = new GainNode(audioContext, { gain: 1 });
      this.#inputNode.connect(this.#dryGainNode).connect(this.#outputNode);
      this.#inputNode.connect(this.#convolutionNode).connect(this.#wetGainNode).connect(this.#outputNode);
   }

   // Private function to generate an impulse response on-the-fly
   impulseResponse(duration, decay) {
      const sampleRate = this.audioContext.sampleRate;
      const length = sampleRate * 10 * duration;
      const impulse = this.audioContext.createBuffer(2, length, sampleRate);
      const impulseL = impulse.getChannelData(0), impulseR = impulse.getChannelData(1);
      for (let i = 0; i < length; ++i) {
         impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 10 * decay);
         impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 10 * decay);
      }
      return impulse;
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
         { name: 'decay', type: 'number', validValues: [Reverb.minDecay, Reverb.maxDecay], defaultValue: 0.3 },
         { name: 'roomSize', type: 'number', validValues: [Reverb.minRoomSize, Reverb.maxRoomSize], defaultValue: 0.1 },
         { name: 'intensity', type: 'number', validValues: [Reverb.minIntensity, Reverb.maxIntensity], defaultValue: 0 }
      ];
   }

   async load() {
      this.#decay = 0.3;
      this.#relativeRoomSize = 0.1;
      this.#dryGainNode.gain.value = 1;
      this.#wetGainNode.gain.value = 0;
      this.#convolutionNode.buffer = this.impulseResponse(this.#relativeRoomSize, this.#decay);
   }

   /**
    * Updates the {@link Reverb} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} decay - Number of seconds before reflections start to decay
    * @param {number} roomSize - Number of seconds before the first reflection occurs
    * @param {number} intensity - Ratio of reverbed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ decay, roomSize, intensity }, updateTime, timeConstant) {
      if ((decay ==  null) && (roomSize == null) && (intensity == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Reverb effect without at least one of the following parameters: "decay, roomSize, intensity"');
      if (decay != null) {
         if (decay < Reverb.minDecay)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Reverb.minDecay}`);
         else if (decay > Reverb.maxDecay)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Reverb.maxDecay}`);
      }
      if (roomSize != null) {
         if (roomSize < Reverb.minRoomSize)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be less than ${Reverb.minRoomSize}`);
         else if (roomSize > Reverb.maxRoomSize)
            throw new WebAudioApiErrors.WebAudioValueError(`Intensity value cannot be greater than ${Reverb.maxRoomSize}`);
      }
      if (intensity != null) {
         if (intensity < Reverb.minIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be less than ${Reverb.minIntensity}`);
         else if (intensity > Reverb.maxIntensity)
            throw new WebAudioApiErrors.WebAudioValueError(`Rate value cannot be greater than ${Reverb.maxIntensity}`);
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      if (decay != null)
         this.#decay = decay;
      if (roomSize != null)
         this.#relativeRoomSize = Math.max(roomSize, 0.01);
      if (intensity != null) {
         this.#wetGainNode.gain.setTargetAtTime(2.5 * intensity, timeToUpdate, timeConstantTarget);
         this.#dryGainNode.gain.setTargetAtTime(1 - intensity, timeToUpdate, timeConstantTarget);
      }
      this.#convolutionNode.buffer = this.impulseResponse(this.#relativeRoomSize, this.#decay);
      return true;
   }

   currentParameterValues() {
      return {
         decay: this.#decay,
         roomSize: this.#relativeRoomSize,
         intensity: 1 - this.#dryGainNode.gain.value
      };
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
