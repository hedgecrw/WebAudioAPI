import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing an Accent modification.
 * 
 * An Accent modification causes a note to be played slightly louder with a quicker attack
 * and more rapid taper than normal.
 * 
 * @extends ModificationBase
 */
export class Accent extends ModificationBase {

   /**
    * Constructs a new {@link Accent} modification object.
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Accent" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {
      // TODO: Need to pick instrument option with quick attack / alter attack and taper/release components of returned note
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity * 2.0,
         this.unmodifiedDetails.duration
      )];
   }
}
