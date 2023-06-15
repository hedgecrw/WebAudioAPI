import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Reverb effect
 * @extends Effect
 */
export class Reverb extends Effect {

   constructor(name, roomType) {
      super(EffectType.Reverb, name);
      // roomType: type of room to emulate
   }

   update(preDelay, decay, highCutoffFrequency, lowCutoffFrequency, wetToDryRatio) {
      // preDelay: amount of time before first reflection occurs
      // decay: amount of time before reflections start to decay
      // highCutoffFrequency: frequency above which to block acoustic reverb content
      // lowCutoffFrequency: frequency below which to block acoustic reverb content
      // wetToDryRatio: ratio of reverbed-to-original sound in the output
   }
}
