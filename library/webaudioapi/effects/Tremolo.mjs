import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Tremolo effect
 * @extends Effect
 */
export class Tremolo extends Effect {

   constructor(name) {
      super(EffectType.Tremolo, name);
   }

   update(rate, depth, offsetField, sync) {
      // rate: frequency at which the low-frequency oscillator modulates the tremolo signal
      // depth: amount of modulation
      // offsetField: amount of left and right movement in the effect
      // sync: synchronizes the modulation speed with the project's tempo
   }
}
