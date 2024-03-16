import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Natural modification.
 * 
 * A Natural modification removes any accidentals from a note, causing it to be played
 * as if in the key of C.
 * 
 * @extends ModificationBase
 */
export class Natural extends ModificationBase {

   /**
    * Constructs a new {@link Natural} modification object.
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Natural" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {
      const offset = ([1, 3, 6, 8, 10].includes(this.unmodifiedDetails.note % 12) ? ((this.key.signature > 0) ? -1 : 1) : 0);
      return [new NoteDetails(
         this.unmodifiedDetails.note + offset,
         this.unmodifiedDetails.velocity,
         this.unmodifiedDetails.duration
      )];
   }
}
