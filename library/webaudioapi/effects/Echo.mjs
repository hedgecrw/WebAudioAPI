import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing an Echo effect
 * @extends Effect
 */
export class Echo extends Effect {

   constructor(name) {
      super(EffectType.Echo, name);
   }

   update(feedback, wetToDryRatio) {
      // feedback: how much reflection is fed back to the original sound
      // wetToDryRatio: ratio of echoed-to-original sound in the output
   }
}
