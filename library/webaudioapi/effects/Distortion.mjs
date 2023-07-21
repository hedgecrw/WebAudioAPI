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

   /**
    * Constructs a new {@link Distortion} effect object.
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
    * Updates the {@link Distortion} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} drive - Gain level for the distorted signal
    * @param {boolean} tone - Whether to smooth distortion by adding tasty tone to it
    * @param {number} intensity - Ratio of distorted-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({drive, tone, intensity}, updateTime) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
