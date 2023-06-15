import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Distortion effect
 * @extends Effect
 */
export class Distortion extends Effect {

   constructor(name) {
      super(EffectType.Distortion, name);
   }

   update(drive, tone, wetToDryRatio) {
      // drive: the gain level for the distorted signal
      // tone: smooths distortion by adding tasty tone to it
      // wetToDryRatio: ratio of distorted-to-original sound in the output
   }
}
