import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Band-Reject Filter effect
 * @extends Effect
 */
export class BandRejectFilter extends Effect {

   constructor(name) {
      super(EffectType.BandRejectFilter, name);
   }

   update(lowerCutoffFrequency, upperCutoffFrequency, resonance) {
      // lowerCutoffFrequency: frequency above which audio content will be reduced
      // upperCutoffFrequency: frequency below which audio content will be reduced
      // resonance: amount of frequency exaggeration around the cutoffs
   }
}
