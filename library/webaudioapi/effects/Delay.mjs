import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Delay effect
 * @extends Effect
 */
export class Delay extends Effect {

   constructor(name) {
      super(EffectType.Delay, name);
   }

   update(feedback, time, cutoffFrequency) {
      // feedback: the number of echoes and the resonance between each echo
      // time: time between the original audio and its echo
      // cutoffFrequency: frequency spectrum outside of which to block acoustic content
   }
}
