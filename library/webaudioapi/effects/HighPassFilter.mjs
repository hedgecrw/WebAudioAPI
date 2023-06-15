import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a High-Pass Filter effect
 * @extends Effect
 */
export class HighPassFilter extends Effect {

   constructor(name) {
      super(EffectType.HighPassFilter, name);
   }

   update(cutoffFrequency, resonance) {
      // cutoffFrequency: frequency below which audio content will be reduced
      // resonance: amount of frequency exaggeration around the cutoff
   }
}
