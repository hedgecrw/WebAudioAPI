import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Mordent modification.
 * 
 * A Mordent modification causes an implicit set of notes to be played after the primary
 * printed note. In the case of an upper mordent, the notes to be played are the principle
 * note, the note above it, then the principle note again. In the case of a lower mordent,
 * the notes to be played are the principle note, the note below it, and the principle note
 * again. The total cumulative duration of all notes in the mordent is the same as the
 * printed duration of the principle note.
 * 
 * @extends ModificationBase
 */
export class Mordent extends ModificationBase {

   // Effect-specific private variables
   /** @type {boolean} */
   #isUpper;

   // Major scale intervals
   static upperOffsetsMajor = [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1];
   static lowerOffsetsMajor = [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1];

   /**
    * Constructs a new {@link Mordent} modification object.
    * 
    * @param {boolean} isUpper - Whether this modification represents an upper mordent
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Mordent" modification cannot infer any parameters from a sequence of notes');
   }

   /**
    * Returns a list of all modified notes, durations, and velocities as generated by the
    * corresponding modification class.
    * 
    * The `details` variable may contain the following optional key:
    * 
    * `offset`:  Integer offset of the mordent from the primary note
    * 
    * @param {Object<string, number>} details - Information about the note value of the mordent
    * @returns {NoteDetails[]} List of {@link NoteDetails} to replace the original note
    */
   getModifiedNoteDetails(details) {
      if (!details || !('offset' in details))
         details = { offset: ((details && ('implicit' in details)) ? details.implicit :
            (this.#isUpper ? Mordent.upperOffsetsMajor[this.unmodifiedDetails.note % 12] :
               Mordent.lowerOffsetsMajor[this.unmodifiedDetails.note % 12])) };
      if (!Number.isInteger(details.offset) || (Number(details.offset) < 1))
         throw new WebAudioApiErrors.WebAudioValueError(`The offset value (${details.offset}) must be a positive integer representing a valid MIDI note`);
      const mordentNoteDuration = 60.0 / ((32.0 / this.tempo.beatBase) * this.tempo.beatsPerMinute);
      const primaryNoteDuration = ((this.unmodifiedDetails.duration < 0) ?
         -this.unmodifiedDetails.duration : (60.0 / ((this.unmodifiedDetails.duration / this.tempo.beatBase) * this.tempo.beatsPerMinute))) -
         (2 * mordentNoteDuration);
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         -mordentNoteDuration,
         0.0
      ),
      new NoteDetails(
         this.unmodifiedDetails.note + (this.#isUpper ? Number(details.offset) : -Number(details.offset)),
         this.unmodifiedDetails.velocity,
         -mordentNoteDuration,
         mordentNoteDuration
      ),
      new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         -primaryNoteDuration,
         2 * mordentNoteDuration
      )];
   }
}
