import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Phaser effect
 * @extends Effect
 */
export class Phaser extends Effect {

   constructor(name) {
      super(EffectType.Phaser, name);
   }

   update(speed, feedback, width, wetToDryRatio) {
      // speed: speed at which the cuts in the bandpass filters are modulated
      // feedback: the amount of phased signal that will be fed back to the phased audio circuit
      // width: frequency range in which the bandpass filters will sweep through
      // wetToDryRatio: ratio of phased-to-original sound in the output
   }
}
