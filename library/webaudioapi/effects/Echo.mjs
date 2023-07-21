import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing an Echo effect.
 * 
 * An Echo effect represents more or more reflections of an original audio signal. It is similar
 * to a Delay effect, except that echoes themselves can feed back into the audio processing loop,
 * resulting in additional, decaying echoes.
 * 
 * @extends EffectBase
 */
export class Echo extends EffectBase {

   /** @type {DelayNode} */
   #delay;
   /** @type {GainNode} */
   #gain;
   /** @type {GainNode} */
   #destination

   #echo = {
      feedback: 0.2,
      intensity: 0.2,
      maxDuration: 1,
   }

   /**
    * Constructs a new {@link Echo} effect object.
    */
   constructor(audioContext) {
      super(audioContext);

      this.#delay = new DelayNode(audioContext);
      this.#delay.delayTime.value = this.#echo.feedback * this.#echo.maxDuration;

      this.#gain = new GainNode(audioContext);
      this.#gain.gain.value = this.#echo.intensity;

      this.#destination = new GainNode(audioContext);
      this.#destination.gain.value = 1;

      this.#gain.connect(this.#delay);
      this.#delay.connect(this.#gain).connect(this.#destination);
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
         { name: 'feedback', type: 'number', validValues: [0, 1], defaultValue: 0.2 },
         { name: 'intensity', type: 'number', validValues: [0, 1], defaultValue: 0.2 },
      ];
   }

   async load() {
      return;
   }

   /**
    * Updates the {@link Echo} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} feedback - Amount of reflection fed back into the original sound
    * @param {number} intensity - Ratio of echoed-to-original sound as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({feedback, intensity}, updateTime) {
      if (feedback != null) {
         this.#echo.feedback = feedback;
         this.#delay.delayTime.value = this.#echo.feedback * this.#echo.maxDuration;
      }
      if (intensity != null) {
         this.#echo.intensity = intensity;
         this.#gain.gain.value = this.#echo.intensity;
      }
      return true;
   }

   getInputNode() {
      return this.#delay;
   }

   getOutputNode() {
      return this.#destination;
   }
}
