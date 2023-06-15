import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Band-Pass Filter effect
 * @extends Effect
 */
export class BandPassFilter extends Effect {

   constructor(name) {
      super(EffectType.BandPassFilter, name);
   }

   update(lowerCutoffFrequency, upperCutoffFrequency, resonance) {
      // lowerCutoffFrequency: frequency below which audio content will be reduced
      // upperCutoffFrequency: frequency above which audio content will be reduced
      // resonance: amount of frequency exaggeration around the cutoffs
   }
}
