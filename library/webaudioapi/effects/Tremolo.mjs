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
    * @param {number} rate - Frequency at which a low-frequency oscillator modulates the tremolo signal
    * @param {boolean} sync - Whether to synchronize modulation speed with the tempo of the audio
    * @param {number} intensityPercent - Amount of amplitude variation as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({rate, sync, intensityPercent, updateTime}) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
