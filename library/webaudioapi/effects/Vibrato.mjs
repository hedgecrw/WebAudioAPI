import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Vibrato effect
 * @extends Effect
 */
export class Vibrato extends Effect {

   constructor(name) {
      super(EffectType.Vibrato, name);
   }

   update(rate, depth, offsetField, sync) {
      // rate: frequency at which the low-frequency oscillator modulates the vibrato signal
      // depth: amount of modulation
      // offsetField: amount of up and down movement in the effect
      // sync: synchronizes the modulation speed with the project's tempo
   }
}
