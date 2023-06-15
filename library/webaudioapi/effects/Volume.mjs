import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Volume effect
 * @extends Effect
 */
export class Volume extends Effect {

   constructor(name) {
      super(EffectType.Volume, name);
   }

   update(gain) {
      // gain: how much volume is present in the output signal
   }
}
