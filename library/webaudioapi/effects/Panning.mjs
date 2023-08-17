import * as WebAudioApiErrors from '../modules/Errors.mjs';
import { EffectBase } from './EffectBase.mjs';

/**
 * Class representing a Panning effect.
 * 
 * A Panning effect distributes an audio signal across a stereo field by making it appear to
 * originate from different places in the left-right audio spectrum, thereby creating more space
 * and width.
 * 
 * @extends EffectBase
 */
export class Panning extends EffectBase {

   // Effect-specific private variables
   /** @type {StereoPannerNode} */
   #panningNode;

   /**
    * Constructs a new {@link Panning} effect object.
    */
   constructor(audioContext) {
      super(audioContext);
      this.#panningNode = new StereoPannerNode(audioContext);
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
         { name: 'leftToRightRatio', type: 'number', validValues: [0, 1], defaultValue: 0.5 }
      ];
   }

   async load() {
      this.#panningNode.pan.value = 0.0;
   }

   /* eslint no-empty-pattern: "off" */
   /**
    * Updates the {@link Panning} effect according to the specified parameters at the
    * specified time.
    * 
    * Note that the `updateTime` parameter can be omitted to immediately cause the requested
    * changes to take effect.
    * 
    * @param {number} leftToRightRatio - Ratio of sound output from the left speaker to the right speaker as a percentage between [0.0, 1.0]
    * @param {number} [updateTime] - Global API time at which to update the effect
    * @param {number} [timeConstant] - Time constant defining an exponential approach to the target
    * @returns {Promise<boolean>} Whether the effect update was successfully applied
    */
   async update({leftToRightRatio}, updateTime, timeConstant) {
      if (leftToRightRatio == null)
         throw new WebAudioApiErrors.WebAudioValueError('Cannot update the Panning effect without at least one of the following parameters: "leftToRightRatio"');
      const timeToUpdate = (updateTime == null) ? this.audioContext.currentTime : updateTime;
      const timeConstantTarget = (timeConstant == null) ? 0.0 : timeConstant;
      const panningValue = 2.0 * (leftToRightRatio - 0.5);
      this.#panningNode.pan.setTargetAtTime(panningValue, timeToUpdate, timeConstantTarget);
      return true;
   }

   getInputNode() {
      return this.#panningNode;
   }

   getOutputNode() {
      return this.#panningNode;
   }
}
