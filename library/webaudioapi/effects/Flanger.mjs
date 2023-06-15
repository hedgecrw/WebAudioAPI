import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing a Flanger effect
 * @extends Effect
 */
export class Flanger extends Effect {

   constructor(name, shape) {
      super(EffectType.Flanger, name);
      // shape: type of waveform used to modulate the delayed signal
   }

   update(rate, delayOffset, variableFeedback) {
      // rate: frequency at which the low-frequency oscillator modulates the chorus signal
      // delayOffset: time between the original signal and the chorus signal
      // variableFeedback: decaying repeats of the processed signal
   }
}
