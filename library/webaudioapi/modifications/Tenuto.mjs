import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Tenuto modification.
 * 
 * A Tenuto modification forces a note to played for its full duration, regardless of its
 * location in a phrase or any other modifications, implicit or explicit.
 * 
 * @extends ModificationBase
 */
export class Tenuto extends ModificationBase {

   /**
    * Constructs a new {@link Tenuto} modification object.
    */
   constructor(tempo, key, details) {
      super(tempo, key, details);
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Tenuto" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         this.unmodifiedDetails.duration
      )];
   }
}
