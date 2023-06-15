import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';
/**
 * Class representing a Panning effect
 * @extends Effect
 */
export class Panning extends Effect {

   constructor(name) {
      super(EffectType.Panning, name);
   }

   update(leftToRightRatio) {
      // leftToRightRatio: ratio of sound output from the left speaker to the right speaker
   }
}
