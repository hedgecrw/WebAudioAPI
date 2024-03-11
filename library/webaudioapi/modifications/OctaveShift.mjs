import { ModificationBase, NoteDetails } from './ModificationBase.mjs';

/**
 * Class representing an Octave Shift modification.
 * 
 * An Octave Shift modification causes a note to be played a full octave higher or lower than written.
 * 
 * @extends ModificationBase
 */
export class OctaveShift extends ModificationBase {

   // Effect-specific private variables
   /** @type {boolean} */
   #shiftUp;

   /**
    * Constructs a new {@link OctaveShift} modification object.
    * 
    * @param {boolean} shiftUp - Whether this is an octave shift up or down
    * @returns {NoteDetails[]} List of {@link NoteDetails} to replace the original note
    */
   constructor(shiftUp, tempo, key, details) {
      super(tempo, key, details);
      this.#shiftUp = shiftUp;
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
         this.unmodifiedDetails.note + (this.#shiftUp ? 12 : -12),
         this.unmodifiedDetails.velocity,
         this.unmodifiedDetails.duration
      )];
   }
}
