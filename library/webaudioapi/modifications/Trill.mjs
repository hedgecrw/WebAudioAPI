import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Trill modification.
 * 
 * A Trill modification causes an implicit set of notes to be played after the primary
 * printed note. In the case of an upper trill, the notes to be played are the principle
 * note and the note above it, repeated for the printed duration of the principle note.
 * In the case of a lower trill, the notes to be played are the principle note and the
 * note below it, repeated for the printed duration of the principle note.
 * 
 * @extends ModificationBase
 */
export class Trill extends ModificationBase {

   // Effect-specific private variables
   /** @type {boolean} */
   #isUpper;

   // Major scale intervals
   static upperOffsetsMajor = [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1];
   static lowerOffsetsMajor = [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1];

   /**
    * Constructs a new {@link Trill} modification object.
    * 
    * @param {boolean} isUpper - Whether this modification represents an upper trill
    */
   constructor(isUpper, tempo, key, details) {
      super(tempo, key, details);
      this.#isUpper = isUpper;
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
            singleNote: ['offset'],
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Trill" modification cannot infer any parameters from a sequence of notes');
   }

   /**
    * Returns a list of all modified notes, durations, and velocities as generated by the
    * corresponding modification class.
    * 
    * The `details` variable may contain the following optional key:
    * 
    * `offset`:  Integer offset of the trill from the primary note
    * 
    * @param {Object<string, number>} details - Information about the note value of the trill
    * @returns {NoteDetails[]} List of {@link NoteDetails} to replace the original note
    */
   getModifiedNoteDetails(details) {
      let trillNote = this.unmodifiedDetails.note;
      if (details && (('offset' in details) || ('implicit' in details))) {
         trillNote += ('offset' in details) ?
            (this.#isUpper ? Number(details.offset) : -Number(details.offset)) :
            (this.#isUpper ? Number(details.implicit) : -Number(details.implicit));
      }
      else {
         trillNote += (this.#isUpper ? Trill.upperOffsetsMajor[trillNote % 12] : -Trill.lowerOffsetsMajor[trillNote % 12]);
         trillNote += this.key.offsets[trillNote % 12];
      }
      if (!Number.isInteger(trillNote) || (Number(trillNote) < 1))
         throw new WebAudioApiErrors.WebAudioValueError(`The offset value (${trillNote}) must be a positive integer > 0`);
      const trill = [];
      const fullNoteDuration = (this.unmodifiedDetails.duration < 0) ?
         -this.unmodifiedDetails.duration : (60.0 / ((this.unmodifiedDetails.duration / this.tempo.beatBase) * this.tempo.beatsPerMinute));
      const trillNoteDuration = 60.0 / ((32.0 / this.tempo.beatBase) * this.tempo.beatsPerMinute);
      const numNotes = Math.floor(fullNoteDuration / trillNoteDuration);
      for (let i = 0; i < numNotes; ++i)
         trill.push(new NoteDetails(
            (i % 2) ? trillNote : this.unmodifiedDetails.note,
            this.unmodifiedDetails.velocity * ((i == 0) ? 1.0 : 0.75),
            -trillNoteDuration,
            i * trillNoteDuration
         ));
      if ((numNotes * trillNoteDuration) < fullNoteDuration)
         trill.push(new NoteDetails(
            (numNotes % 2) ? trillNote : 0,
            this.unmodifiedDetails.velocity,
            -(fullNoteDuration - (numNotes * trillNoteDuration)),
            numNotes * trillNoteDuration
         ));
      return trill;
   }
}