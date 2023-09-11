import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing an Equalization effect.
 * 
 * An Equalizer allows for the volume of an audio signal to be adjusted piecewise according to
 * any number of discrete frequency ranges. Both the size and quantity of frequency ranges are
 * user-definable.
 * 
 * @extends EffectBase
 */
export class Equalization extends EffectBase {

   // Effect-specific private variables
   /** @type {BiquadFilterNode[]} */
   #equalizerNodes;

   // Parameter limits
   static minGain = -40;
   static maxGain = 40;
   static minCutoff = 1000;
   static maxCutoff = 22050;

   /**
    * Constructs a new {@link Equalization} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#equalizerNodes = [
         new BiquadFilterNode(audioContext, { type: 'lowshelf', frequency: audioContext.sampleRate / 4, gain: 0 }),
         new BiquadFilterNode(audioContext, { type: 'highshelf', frequency: audioContext.sampleRate / 4, gain: 0 })
      ];
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
         { name: 'frequencyBandUpperCutoffs', type: 'Array<number>', validValues: [Equalization.minCutoff, Equalization.maxCutoff], defaultValue: 0 },
         { name: 'frequencyBandGains', type: 'Array<number>', validValues: [Equalization.minGain, Equalization.maxGain], defaultValue: 0 },
      ];
   }

   async load() {
      this.#equalizerNodes[0].connect(this.#equalizerNodes[1]);
   }

   /**
    * Updates the {@link Equalization} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number[]} frequencyBandUpperCutoffs - Upper frequency cutoffs in Hz for each band in the equalizer between [0, 22050]
    * @param {number[]} frequencyBandGains - Gains in dB for each frequency band in the equalizer between [-40, 40]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ frequencyBandUpperCutoffs, frequencyBandGains }, updateTime, timeConstant) {
      if ((frequencyBandUpperCutoffs == null) || (frequencyBandGains == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Equalization effect without both of the following parameters: "frequencyBandUpperCutoffs, frequencyBandGains"');
      if (frequencyBandUpperCutoffs.length != frequencyBandGains.length)
         throw new WebAudioApiErrors.WebAudioValueError('Frequency cutoff array and frequency gain array must have the same size');
      for (const cutoff of frequencyBandUpperCutoffs) {
         if (cutoff < Equalization.minCutoff)
            throw new WebAudioApiErrors.WebAudioValueError(`Frequency upper cutoff value cannot be less than ${Equalization.minCutoff}`);
         else if (cutoff > Equalization.maxCutoff)
            throw new WebAudioApiErrors.WebAudioValueError(`Frequency upper cutoff value cannot be greater than ${Equalization.maxCutoff}`);
      }
      for (const gain of frequencyBandGains) {
         if (gain < Equalization.minGain)
            throw new WebAudioApiErrors.WebAudioValueError(`Gain value cannot be less than ${Equalization.minGain}`);
         else if (gain > Equalization.maxGain)
            throw new WebAudioApiErrors.WebAudioValueError(`Gain value cannot be greater than ${Equalization.maxGain}`);
      }
      for (let i = 1; i < frequencyBandUpperCutoffs.length; ++i) {
         if (frequencyBandUpperCutoffs[i] <= frequencyBandUpperCutoffs[i-1])
            throw new WebAudioApiErrors.WebAudioValueError('Frequency band upper cutoffs must be monotonically increasing within the array');
      }
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;

      // Ensure the correct number of equalization bands are present
      if (frequencyBandUpperCutoffs.length < this.#equalizerNodes.length) {
         this.#equalizerNodes[0].connect(this.#equalizerNodes[this.#equalizerNodes.length - frequencyBandUpperCutoffs.length + 1]);
         for (const removedNode of this.#equalizerNodes.splice(1, this.#equalizerNodes.length - frequencyBandUpperCutoffs.length))
            removedNode.disconnect();
      }
      else if (frequencyBandUpperCutoffs.length > this.#equalizerNodes.length) {
         const lastNode = this.#equalizerNodes.splice(-1, 1)[0];
         this.#equalizerNodes[this.#equalizerNodes.length - 1].disconnect();
         while ((this.#equalizerNodes.length + 1) < frequencyBandUpperCutoffs.length) {
            const newNode = new BiquadFilterNode(this.audioContext, { type: 'peaking' });
            this.#equalizerNodes[this.#equalizerNodes.length - 1].connect(newNode);
            this.#equalizerNodes.push(newNode);
         }
         this.#equalizerNodes[this.#equalizerNodes.length - 1].connect(lastNode);
         this.#equalizerNodes.push(lastNode);
      }

      // Update the parameters for each equalization band
      this.#equalizerNodes[0].frequency.setTargetAtTime(frequencyBandUpperCutoffs[0], timeToUpdate, timeConstantTarget);
      this.#equalizerNodes[0].gain.setTargetAtTime(frequencyBandGains[0], timeToUpdate, timeConstantTarget);
      this.#equalizerNodes[this.#equalizerNodes.length-1].frequency.setTargetAtTime(frequencyBandUpperCutoffs[frequencyBandUpperCutoffs.length-2], timeToUpdate, timeConstantTarget);
      this.#equalizerNodes[this.#equalizerNodes.length-1].gain.setTargetAtTime(frequencyBandGains[frequencyBandGains.length-1], timeToUpdate, timeConstantTarget);
      for (let i = 1; i < this.#equalizerNodes.length - 1; ++i) {
         const centerFrequency = 0.5 * (frequencyBandUpperCutoffs[i] + frequencyBandUpperCutoffs[i-1]);
         this.#equalizerNodes[i].frequency.setTargetAtTime(centerFrequency, timeToUpdate, timeConstantTarget);
         this.#equalizerNodes[i].Q.setTargetAtTime(centerFrequency / (frequencyBandUpperCutoffs[i] - frequencyBandUpperCutoffs[i-1]), timeToUpdate, timeConstantTarget);
         this.#equalizerNodes[i].gain.setTargetAtTime(frequencyBandGains[i], timeToUpdate, timeConstantTarget);
      }
      return true;
   }

   getInputNode() {
      return this.#equalizerNodes[0];
   }

   getOutputNode() {
      return this.#equalizerNodes[this.#equalizerNodes.length - 1];
   }
}
