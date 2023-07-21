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

   /**
    * Constructs a new {@link Tremolo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   }

   /**
    * Returns a list of all available parameters for manipulation in the `effectOptions` parameter
    * of the {@link EffectBase#update update()} function for this {@link Effect}.
    * 
    * @returns {EffectParameter[]} List of effect-specific parameters for use in the effect's {@link EffectBase#update update()} function
    * @see {@link EffectParameter}
    */
   static getParameters() {
      return [];
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
    * @param {number} depth - Amount of amplitude variation as a percentage between [0.0, 1.0]
    * @param {boolean} sync - Whether to synchronize modulation speed with the tempo of the audio
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, depth, sync}, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
