import { EffectType } from '../modules/Constants.mjs';
import { Effect } from './Effect.mjs';

/**
 * Class representing an Equalization effect
 * @extends Effect
 */
export class Equalization extends Effect {

   constructor(name, frequencyBandCutoffs) {
      super(EffectType.Equalization, name);
      // frequencyBandCutoffs: frequency transition values for each equalizer knob, numKnobs = frequencyBandCutoffs.length + 1
   }

   update(frequencyBandVolumes) {
      // frequencyBandVolumes: the volume for each frequency band in the equalizer
   }
}
