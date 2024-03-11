import { ModificationBase, NoteDetails } from './ModificationBase.mjs';

/**
 * Class representing a TupletNote modification.
 * 
 * A TupletNote modification causes a note to play for only 1/N of the duration of
 * the next longest standard note duration. For example, three eighth notes in a triplet
 * would take the same amount of time to play as a single quarter note. As an alternate
 * formulation, an N-tuplet-modified note would play for 2/N of its printed duration.
 * 
 * @extends ModificationBase
 */
export class TupletNote extends ModificationBase {

   // Effect-specific private variables
   /** @type {number} */
   #degree;

   /**
    * Constructs a new {@link TupletNote} modification object.
    */
   constructor(degree, tempo, key, details) {
      super(tempo, key, details);
      this.#degree = degree;
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
      return true;
   }

   static inferParametersFromSequence(_sequence, _index, params) {
      return params;
   }

   getModifiedNoteDetails() {
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         this.unmodifiedDetails.duration * (this.#degree / ((this.#degree == 3) ? 2 : 4))
      )];
   }
}
