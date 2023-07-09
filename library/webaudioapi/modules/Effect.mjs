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

   /**
    * Updates the intensity and parameters of the effect at the specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {Object} effectOptions - Effect-specific options (TODO)
    * @param {number} percent - Intensity of the effect as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    * @memberof Effect
    * @instance
    */
   async function update(effectOptions, percent, updateTime) {
      if (!effectOptions)
         effectOptions = {};
      effectOptions['intensityPercent'] = percent;
      effectOptions['updateTime'] = updateTime;
      return await effect.update(effectOptions);
   }

   // Returns an object containing functions and attributes within the public Effect namespace
   return {
      /**
       * User-defined name of the {@link Effect}.
       * @memberof Effect
       * @instance
       */
      name: effectName,
   
      /**
       * Numeric value corresponding to the {@link module:Constants.EffectType EffectType} of the {@link Effect}
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
      update
   };
}
