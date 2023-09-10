import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { PitchShift } from './PitchShift.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Doppler effect.
 * 
 * A Doppler effect performs a linear change in frequency over a specified period of time.
 * 
 * @extends EffectBase
 */
export class Doppler extends EffectBase {

   // Effect-specific private variables
   /** @type {PitchShift} */
   #pitchShifter;

   // Parameter limits
   static minDistance = 0;
   static maxDistance = 1000;
   static minDuration = 0;
   static maxDuration = 60;

   /**
    * Constructs a new {@link Doppler} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#pitchShifter = new PitchShift(audioContext);
   }

   /**
    * Returns a list of all available parameters for manipulation in the `effectOptions` parameter
    * of the {@link EffectBase#update update()} function for this {@link Effect}.
    * 
    * @returns {EffectParameter[]} List of effect-specific parameters for use in the effect's {@link EffectBase#update update()} function
    * @see {@link EffectParameter}
    */
   static getParameters() {
      return [
         { name: 'initDistance', type: 'number', validValues: [Doppler.minDistance, Doppler.maxDistance], defaultValue: 100 },
         { name: 'finalDistance', type: 'number', validValues: [Doppler.minDistance, Doppler.maxDistance], defaultValue: 100 },
         { name: 'missDistance', type: 'number', validValues: [Doppler.minDistance, Doppler.maxDistance], defaultValue: 14 },
         { name: 'duration', type: 'number', validValues: [Doppler.minDuration, Doppler.maxDuration], defaultValue: 10 }
      ];
   }

   async load() {
      await this.#pitchShifter.load();
   }

   /* eslint no-empty-pattern: "off" */
   /**
    * Updates the {@link Doppler} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} initDistance - Starting distance in meters between an audio source and an observer
    * @param {number} finalDistance - Final distance in meters between an audio source and an observer
    * @param {number} missDistance - Distance in meters by which the audio source misses the observer
    * @param {number} duration - Duration in seconds required for the audio source to travel from its starting to final location
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({ initDistance, finalDistance, missDistance, duration }, updateTime) {
      if ((initDistance == null) || (finalDistance == null) || (missDistance == null) || (duration == null))
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Doppler effect without all of the following parameters: "initDistance, finalDistance, missDistance, duration"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const approachingDistance = Math.sqrt(initDistance**2 - missDistance**2);
      const departingDistance = Math.sqrt(finalDistance**2 - missDistance**2);
      const totalDistance = approachingDistance + departingDistance;
      const speedMetersPerCentisecond = totalDistance / (100 * duration);
      const approachingDuration = duration * (approachingDistance / totalDistance);
      const departingDuration = duration * (departingDistance / totalDistance);
      const approachingWeights = new Float32Array(approachingDuration * 100);
      const departingWeights = new Float32Array(departingDuration * 100);
      for (let i = 0; i < approachingWeights.length; ++i)
         approachingWeights[i] = Math.cos(Math.atan2(missDistance, approachingDistance - (i * speedMetersPerCentisecond)));
      for (let i = 0; i < departingWeights.length; ++i)
         departingWeights[i] = Math.cos(Math.atan2(missDistance, i * speedMetersPerCentisecond));
      const approachingFrequency = 1200 * Math.log2(343.0 / (343.0 - (100 * speedMetersPerCentisecond)));
      const departingFrequency = 1200 * Math.log2(343.0 / (343.0 + (100 * speedMetersPerCentisecond)));
      console.log(approachingFrequency, departingFrequency);
      this.#pitchShifter.updatePrivate(approachingFrequency, timeToUpdate, approachingWeights, approachingDuration);
      this.#pitchShifter.updatePrivate(departingFrequency, timeToUpdate + approachingDuration, departingWeights, departingDuration);
      return true;
   }

   getInputNode() {
      return this.#pitchShifter.getInputNode();
   }

   getOutputNode() {
      return this.#pitchShifter.getOutputNode();
   }
}
