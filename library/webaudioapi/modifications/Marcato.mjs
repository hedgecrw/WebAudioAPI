import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Marcato modification.
 * 
 * A Marcato modification causes a note to be played as if it were modified by both an
 * {@link Accent} and a {@link Staccato}.
 * 
 * @extends ModificationBase
 */
export class Marcato extends ModificationBase {

   /**
    * Constructs a new {@link Marcato} modification object.
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Marcato" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity * 2.0,
         this.unmodifiedDetails.duration * 2.0,
         this.unmodifiedDetails.startTimeOffset,
         this.unmodifiedDetails.duration
      )];
   }
}
