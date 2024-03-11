import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Global Dynamic modification.
 * 
 * A Global Dynamic modification causes all subsequent notes to be played either softer
 * or louder than average.
 * 
 * @extends ModificationBase
 */
export class GlobalDynamic extends ModificationBase {

   // Effect-specific private variables
   /** @type {number} */
   #degreeOfDynamic;

   // Conversion from degrees to velocity
   static degreesConversion = [
      0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.45, 0.5,
      0.55, 0.6, 0.6, 0.75, 0.75, 0.85, 0.85, 0.95, 0.95 ];

   /**
    * Constructs a new {@link GlobalDynamic} modification object.
    * 
    * @param {number} degreeOfDynamic - Number of dynamic symbols to apply (0.5 for mezzo-dynamics, negative for pianos)
    */
   constructor(degreeOfDynamic, tempo, key, details) {
      super(tempo, key, details);
      this.#degreeOfDynamic = degreeOfDynamic;
   }

   /**
    * Returns a list of all parameters available for use in this modification, including whether
    * the parameter is required or optional when playing back either a "sequence" or just a
    * single "note".
    * 
    * @returns {Object<string,Object<string,string[]>>} List of modification-specific parameter keys and when they are required
    */
   static getParameters() {
      return {
         required: {
            singleNote: [],
            sequence: []
         },
         optional: {
            singleNote: [],
            sequence: []
         }
      };
   }

   /**
    * Returns whether this modification can be used to modify a sequence of notes.
    * 
    * @returns {boolean} Whether this modification can be used to modify a sequence of notes
    */
   static canModifySequence() {
      return false;
   }

   static inferParametersFromSequence() {
      throw new WebAudioApiErrors.WebAudioValueError('The "GlobalDynamic" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         GlobalDynamic.degreesConversion[(this.#degreeOfDynamic * 2) + 8],
         this.unmodifiedDetails.duration
      )];
   }
}
