/**
 * Module containing functionality to apply and update {@link WebAudioAPI} effects.
 * @module Effect
 */

/**
 * Object containing all effect-specific {@link WebAudioAPI} functionality.
 * @namespace Effect
 * @global
 */

import { EffectType } from './Constants.mjs';
import { BandPassFilter } from '../effects/BandPassFilter.mjs';
import { BandRejectFilter } from '../effects/BandRejectFilter.mjs';
import { Chorus } from '../effects/Chorus.mjs';
import { Compression } from '../effects/Compression.mjs';
import { Delay } from '../effects/Delay.mjs';
import { Distortion } from '../effects/Distortion.mjs';
import { Echo } from '../effects/Echo.mjs';
import { Equalization } from '../effects/Equalization.mjs';
import { Flanger } from '../effects/Flanger.mjs';
import { HighPassFilter } from '../effects/HighPassFilter.mjs';
import { LowPassFilter } from '../effects/LowPassFilter.mjs';
import { Panning } from '../effects/Panning.mjs';
import { Phaser } from '../effects/Phaser.mjs';
import { Reverb } from '../effects/Reverb.mjs';
import { Tremolo } from '../effects/Tremolo.mjs';
import { Vibrato } from '../effects/Vibrato.mjs';
import { Volume } from '../effects/Volume.mjs';

const EffectClasses = {
   [EffectType.Reverb]: Reverb, [EffectType.Delay]: Delay, [EffectType.Echo]: Echo, [EffectType.Chorus]: Chorus,
   [EffectType.Tremolo]: Tremolo, [EffectType.Vibrato]: Vibrato, [EffectType.Flanger]: Flanger, [EffectType.Phaser]: Phaser,
   [EffectType.Panning]: Panning, [EffectType.Equalization]: Equalization, [EffectType.Volume]: Volume, [EffectType.Compression]: Compression,
   [EffectType.Distortion]: Distortion, [EffectType.LowPassFilter]: LowPassFilter, [EffectType.HighPassFilter]: HighPassFilter,
   [EffectType.BandPassFilter]: BandPassFilter, [EffectType.BandRejectFilter]: BandRejectFilter
};


/**
 * Returns a list of effect-specific {@link EffectParameter EffectParameters} for manipulation
 * in the corresponding {@link module:Constants.EffectType EffectType}.
 * 
 * Note that the `effectType` parameter must be the **numeric value** associated with a certain
 * {@link module:Constants.EffectType EffectType}, not a string-based key.
 * 
 * @param {number} effectType - {@link module:Constants.EffectType EffectType} for which to return a parameter list
 * @returns {EffectParameter[]} List of effect-specific parameters available for updating
 * @see {@link module:Constants.EffectType EffectType}
 * @see {@link EffectParameter}
 */
export function getEffectParameters(effectType) {
   return EffectClasses[effectType].getParameters();
}


/**
 * Loads a pre-defined {@link Effect} capable of being applied to an individual {@link Track} or
 * to the aggregate output of all tracks.
 * 
 * @param {AudioContext} audioContext - Reference to the global browser {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @param {string} effectName - User-defined name to assign to the newly loaded effect
 * @param {number} effectType - Numeric value corresponding to the desired {@link module:Constants.EffectType EffectType}
 * @returns {Promise<Effect>} Newly created audio {@link Effect}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext AudioContext}
 * @see {@link module:Constants.EffectType EffectType}
 * @see {@link Effect}
 * @async
 */
export async function loadEffect(audioContext, effectName, effectType) {

   // Load the requested concrete effect type
   const effect = new EffectClasses[effectType](audioContext);
   await effect.load();

   // Returns an object containing functions and attributes within the public Effect namespace
   return {
      /**
       * User-defined name of the {@link Effect}.
       * @memberof Effect
       * @instance
       */
      name: effectName,
   
      /**
       * Numeric value corresponding to the {@link module:Constants.EffectType EffectType} of the {@link Effect}.
       * @memberof Effect
       * @instance
       */
      type: effectType,
   
      /**
       * Reference to an {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
       * to which all source {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNodes}
       * should be connected.
       * @memberof Effect
       * @instance
       */
      input: effect.getInputNode(),
   
      /**
       * Reference to an {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNode}
       * from which all effect-modified output audio is produced, and which should be connected to all
       * destination {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode AudioNodes}.
       * @memberof Effect
       * @instance
       */
      output: effect.getOutputNode(),

      /**
       * List of effect-specific {@link EffectParameter EffectParameters} for manipulation in the
       * `effectOptions` parameter of the {@link Effect#update update()} function.
       * @memberof Effect
       * @instance
       */
      parameters: EffectClasses[effectType].getParameters(),

      /**
       * Updates the parameters of the effect at the specified time.
       * 
       * Note that the `updateTime` parameter can be omitted to immediately cause the requested
       * changes to take effect.
       * 
       * @function
       * @param {Object} effectOptions - Effect-specific options as returned by {@link WebAudioAPI#getAvailableEffectParameters getAvailableEffectParameters()}
       * @param {number} [updateTime] - Global API time at which to update the effect
       * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
       * @returns {Promise<boolean>} Whether the effect update was successfully applied
       * @memberof Effect
       * @instance
       * @async
       */
      update: effect.update.bind(effect)
   };
}
