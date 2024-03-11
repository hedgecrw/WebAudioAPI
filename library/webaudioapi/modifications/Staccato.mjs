import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Staccato modification.
 * 
 * A Staccato modification causes a note to be played with a rapid attack for one-half of the
 * printed duration, such that there is silence for the second half of the duration. If a
 * staccatissimo modification is requested, the note will only sound for one-quarter of the
 * printed duration.
 * 
 * @extends ModificationBase
 */
export class Staccato extends ModificationBase {

   // Effect-specific private variables
   /** @type {boolean} */
   #isStaccatissimo;

   /**
    * Constructs a new {@link Staccato} modification object.
    * 
    * @param {boolean} isStaccatissimo - Whether this modification represents a staccatissimo duration shortening
    */
   constructor(isStaccatissimo, tempo, key, details) {
      super(tempo, key, details);
      this.#isStaccatissimo = isStaccatissimo;
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Staccato" modification cannot infer any parameters from a sequence of notes');
   }

   getModifiedNoteDetails() {  // TODO: Need to pick instrument option with quick attack / alter attack and taper/release components of returned note
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         this.unmodifiedDetails.duration * (this.#isStaccatissimo ? 4.0 : 2.0),
         0.0,
         this.unmodifiedDetails.duration
      )];
   }
}
