import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Low-Pass Filter effect
 * @extends Effect
 */
export class LowPassFilter extends Effect {

   constructor(name) {
      super(EffectType.LowPassFilter, name);
   }

   update(cutoffFrequency, resonance) {
      // cutoffFrequency: frequency above which audio content will be reduced
      // resonance: amount of frequency exaggeration around the cutoff
   }
}
