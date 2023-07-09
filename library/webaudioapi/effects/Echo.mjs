import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing an Echo effect.
 * 
 * An Echo effect represents more or more reflections of an original audio signal. It is similar
 * to a Delay effect, except that echoes themselves can feed back into the audio processing loop,
 * resulting in additional, decaying echoes.
 * 
 * @extends EffectBase
 */
export class Echo extends EffectBase {

   /**
    * Constructs a new {@link Echo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Echo} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} feedback - Amount of reflection fed back into the original sound
    * @param {number} intensityPercent - Ratio of echoed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({feedback, intensityPercent, updateTime}) {
      return false;
   }

   getInputNode() {
      return;
   }

   getOutputNode() {
      return;
   }
}
