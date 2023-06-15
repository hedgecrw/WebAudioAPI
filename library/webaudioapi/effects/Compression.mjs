import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Compression effect
 * @extends Effect
 */
export class Compression extends Effect {

   constructor(name) {
      super(EffectType.Compression, name);
   }

   update(rate, threshold, attack, release, gain) {
      // rate: the amount of compression
      // threshold: loudness of sound input at which the compressor kicks in
      // attack: how fast compression reduces volume after reaching the threshold
      // release: how fast compression disengages after falling below the threshold
      // gain: additional gain on the output volume to make up for the reduction due to compression
   }
}
