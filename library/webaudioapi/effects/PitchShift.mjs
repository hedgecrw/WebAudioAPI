import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Pitch Shift effect.
 * 
 * A Pitch Shift performs a permanent shift in frequency between an incoming and
 * outgoing audio signal.
 * 
 * @extends EffectBase
 */
export class PitchShift extends EffectBase {

   // Effect-specific private variables
   /** @type {GainNode} */
   #inputNode; #outputNode;
   /** @type {GainNode} */
   #modGain1Node; #modGain2Node;
   /** @type {AudioBuffer} */
   #shiftDownBuffer; #shiftUpBuffer;
   /** @type {GainNode} */
   #mod1GainNode; #mod2GainNode; #mod3GainNode; #mod4GainNode;
   /** @type {AudioBufferSourceNode} */
   #mod1Node; #mod2Node; #mod3Node; #mod4Node;
   /** @type {AudioBufferSourceNode} */
   #fade1Node; #fade2Node;

   // Parameter limits
   static bufferTime = 0.250;
   static delayTime = 0.250;
   static fadeTime = 0.125;
   static minShift = -1200;
   static maxShift = 700;

   /**
    * Constructs a new {@link PitchShift} effect object.
    */
   constructor(audioContext) {
      super(audioContext);

      // Required audio nodes
      this.#inputNode = new GainNode(audioContext);
      this.#outputNode = new GainNode(audioContext);
      this.#mod1GainNode = new GainNode(audioContext, { gain: 1 });
      this.#mod2GainNode = new GainNode(audioContext, { gain: 1 });
      this.#mod3GainNode = new GainNode(audioContext, { gain: 0 });
      this.#mod4GainNode = new GainNode(audioContext, { gain: 0 });
      this.#modGain1Node = new GainNode(audioContext, { gain: 1 });
      this.#modGain2Node = new GainNode(audioContext, { gain: 1 });
      const delay1 = new DelayNode(audioContext, { maxDelayTime: 1 });
      const delay2 = new DelayNode(audioContext, { maxDelayTime: 1 });

      // Delay modulation
      const length1 = PitchShift.bufferTime * audioContext.sampleRate;
      const length = length1 + ((PitchShift.bufferTime - 2*PitchShift.fadeTime) * audioContext.sampleRate);
      this.#shiftDownBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      {
         const p = this.#shiftDownBuffer.getChannelData(0);
         for (let i = 0; i < length1; ++i)
            p[i] = i / length1;
         for (let i = length1; i < length; ++i)
            p[i] = 0;
      }
      this.#shiftUpBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      {
         const p = this.#shiftUpBuffer.getChannelData(0);
         for (let i = 0; i < length1; ++i)
            p[i] = (length1 - i) / length;
         for (let i = length1; i < length; ++i)
            p[i] = 0;
      }      
      this.#mod1Node = new AudioBufferSourceNode(audioContext, { buffer: this.#shiftDownBuffer, loop: true });
      this.#mod2Node = new AudioBufferSourceNode(audioContext, { buffer: this.#shiftDownBuffer, loop: true });
      this.#mod3Node = new AudioBufferSourceNode(audioContext, { buffer: this.#shiftUpBuffer, loop: true });
      this.#mod4Node = new AudioBufferSourceNode(audioContext, { buffer: this.#shiftUpBuffer, loop: true });

      // Delay amount for changing pitch
      this.#mod1Node.connect(this.#mod1GainNode);
      this.#mod2Node.connect(this.#mod2GainNode);
      this.#mod3Node.connect(this.#mod3GainNode);
      this.#mod4Node.connect(this.#mod4GainNode);
      this.#mod1GainNode.connect(this.#modGain1Node);
      this.#mod2GainNode.connect(this.#modGain2Node);
      this.#mod3GainNode.connect(this.#modGain1Node);
      this.#mod4GainNode.connect(this.#modGain2Node);
      this.#modGain1Node.connect(delay1.delayTime);
      this.#modGain2Node.connect(delay2.delayTime);

      // Crossfading
      const fadeBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
      {
         const p = fadeBuffer.getChannelData(0), fadeLength = PitchShift.fadeTime * audioContext.sampleRate;
         const fadeIndex1 = fadeLength, fadeIndex2 = length1 - fadeLength;
         for (let i = 0; i < length1; ++i)
            p[i] = (i < fadeIndex1) ? Math.sqrt(i / fadeLength) :
               ((i >= fadeIndex2) ? Math.sqrt(1 - (i - fadeIndex2) / fadeLength) : 1);
         for (let i = length1; i < length; ++i)
            p[i] = 0;
      }
      this.#fade1Node = new AudioBufferSourceNode(audioContext, { buffer: fadeBuffer, loop: true });
      this.#fade2Node = new AudioBufferSourceNode(audioContext, { buffer: fadeBuffer, loop: true });
      const mix1 = new GainNode(audioContext, { gain: 0 });
      const mix2 = new GainNode(audioContext, { gain: 0 });
      this.#fade1Node.connect(mix1.gain);    
      this.#fade2Node.connect(mix2.gain);
         
      // Connect processing graph
      this.#inputNode.connect(delay1);
      this.#inputNode.connect(delay2);
      delay1.connect(mix1);
      delay2.connect(mix2);
      mix1.connect(this.#outputNode);
      mix2.connect(this.#outputNode);
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
         { name: 'shift', type: 'number', validValues: [PitchShift.minShift, PitchShift.maxShift], defaultValue: 0 }
      ];
   }

   async load() {
      const t = this.audioContext.currentTime + 0.050;
      const t2 = t + PitchShift.bufferTime - PitchShift.fadeTime;
      this.#modGain1Node.gain.value = 0;
      this.#modGain2Node.gain.value = 0;
      this.#mod1Node.start(t);
      this.#mod2Node.start(t2);
      this.#mod3Node.start(t);
      this.#mod4Node.start(t2);
      this.#fade1Node.start(t);
      this.#fade2Node.start(t2);
   }

   // Private update function for internal use only by Doppler effect
   async updatePrivate(shift, updateTime, timeWeights, duration) {
      const finalGain = 0.5 * PitchShift.delayTime * Math.abs(shift) / 1200;
      for (let i = 0; i < timeWeights.length; ++i)
         timeWeights[i] *= finalGain;
      this.#mod1GainNode.gain.cancelScheduledValues(updateTime);
      this.#mod2GainNode.gain.cancelScheduledValues(updateTime);
      this.#mod3GainNode.gain.cancelScheduledValues(updateTime);
      this.#mod4GainNode.gain.cancelScheduledValues(updateTime);
      if (shift > 0) {
         this.#mod1GainNode.gain.setTargetAtTime(0, updateTime, 0.01);
         this.#mod2GainNode.gain.setTargetAtTime(0, updateTime, 0.01);
         this.#mod3GainNode.gain.setTargetAtTime(1, updateTime, 0.01);
         this.#mod4GainNode.gain.setTargetAtTime(1, updateTime, 0.01);
      } else {
         this.#mod1GainNode.gain.setTargetAtTime(1, updateTime, 0.01);
         this.#mod2GainNode.gain.setTargetAtTime(1, updateTime, 0.01);
         this.#mod3GainNode.gain.setTargetAtTime(0, updateTime, 0.01);
         this.#mod4GainNode.gain.setTargetAtTime(0, updateTime, 0.01);
      }
      this.#modGain1Node.gain.cancelScheduledValues(updateTime);
      this.#modGain2Node.gain.cancelScheduledValues(updateTime);
      this.#modGain1Node.gain.setValueCurveAtTime(timeWeights, updateTime, duration);
      this.#modGain2Node.gain.setValueCurveAtTime(timeWeights, updateTime, duration);
      return true;
   }

   /* eslint no-empty-pattern: "off" */
   /**
    * Updates the {@link PitchShift} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} shift - Frequency shift in cents between [-1200, 1200]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ shift }, updateTime, timeConstant) {
      if (shift == null)
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the PitchShift effect without at least one of the following parameters: "shift"');
      else if (shift < PitchShift.minShift)
         throw new WebAudioApiErrors.WebAudioValueError(`Shift value cannot be less than ${PitchShift.minShift}`);
      else if (shift > PitchShift.maxShift)
         throw new WebAudioApiErrors.WebAudioValueError(`Shift value cannot be greater than ${PitchShift.maxShift}`);
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      this.#mod1GainNode.gain.cancelScheduledValues(timeToUpdate);
      this.#mod2GainNode.gain.cancelScheduledValues(timeToUpdate);
      this.#mod3GainNode.gain.cancelScheduledValues(timeToUpdate);
      this.#mod4GainNode.gain.cancelScheduledValues(timeToUpdate);
      if (shift > 0) {
         this.#mod1GainNode.gain.setTargetAtTime(0, timeToUpdate, 0.01);
         this.#mod2GainNode.gain.setTargetAtTime(0, timeToUpdate, 0.01);
         this.#mod3GainNode.gain.setTargetAtTime(1, timeToUpdate, 0.01);
         this.#mod4GainNode.gain.setTargetAtTime(1, timeToUpdate, 0.01);
      } else {
         this.#mod1GainNode.gain.setTargetAtTime(1, timeToUpdate, 0.01);
         this.#mod2GainNode.gain.setTargetAtTime(1, timeToUpdate, 0.01);
         this.#mod3GainNode.gain.setTargetAtTime(0, timeToUpdate, 0.01);
         this.#mod4GainNode.gain.setTargetAtTime(0, timeToUpdate, 0.01);
      }
      this.#modGain1Node.gain.cancelScheduledValues(timeToUpdate);
      this.#modGain2Node.gain.cancelScheduledValues(timeToUpdate);
      this.#modGain1Node.gain.setTargetAtTime(0.5 * PitchShift.delayTime * Math.abs(shift) / 1200, timeToUpdate, timeConstantTarget);
      this.#modGain2Node.gain.setTargetAtTime(0.5 * PitchShift.delayTime * Math.abs(shift) / 1200, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#inputNode;
   }

   getOutputNode() {
      return this.#outputNode;
   }
}
