import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Turn modification.
 * 
 * A Turn modification causes an implicit set of notes to be played after the primary
 * printed note. In the case of an upper turn, the notes to be played are the principle
 * note, the note above it, the principle note, the note below it, then finally the
 * principle note again. In the case of a lower turn, the notes to be played are the
 * principle note, the note below it, the principle note, the note above it, then finally
 * the principle note again. The total cumulative duration of all notes in the turn is
 * the same as the printed duration of the principle note.
 * 
 * @extends ModificationBase
 */
export class Turn extends ModificationBase {

   // Effect-specific private variables
   /** @type {boolean} */
   #isUpper;

   // Major scale intervals
   static upperOffsetsMajor = [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1];
   static lowerOffsetsMajor = [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1];

   /**
    * Constructs a new {@link Turn} modification object.
    * 
    * @param {boolean} isUpper - Whether this modification represents an upper turn
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
            singleNote: ['upperOffset', 'lowerOffset'],
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
      throw new WebAudioApiErrors.WebAudioValueError('The "Turn" modification cannot infer any parameters from a sequence of notes');
   }

   /**
    * Returns a list of all modified notes, durations, and velocities as generated by the
    * corresponding modification class.
    * 
    * The `details` variable may contain the following two keys:
    * 
    * `upperOffset`: Upper offset value of the turn from the primary note
    * `lowerOffset`: Lower offset value of the turn from the primary note
    * 
    * @param {Object<string, number>} [details] - Details about the notes in the turn
    * @returns {NoteDetails[]} List of {@link NoteDetails} to replace the original note
    */
   getModifiedNoteDetails(details) {
      let upperNote = this.unmodifiedDetails.note, lowerNote = this.unmodifiedDetails.note;
      if (details && ('upperOffset' in details))
         upperNote += Number(details.upperOffset);
      else {
         upperNote += Turn.upperOffsetsMajor[upperNote % 12];
         upperNote += this.key.offsets[upperNote % 12];
      }
      if (details && ('lowerOffset' in details))
         lowerNote -= Number(details.lowerOffset);
      else {
         lowerNote -= Turn.lowerOffsetsMajor[lowerNote % 12];
         lowerNote += this.key.offsets[lowerNote % 12];
      }
      const turnNoteDuration = (this.unmodifiedDetails.duration >= 8) ?
         (60.0 / ((5.0 * this.unmodifiedDetails.duration / this.tempo.beatBase) * this.tempo.beatsPerMinute)) :
         (60.0 / ((32.0 / this.tempo.beatBase) * this.tempo.beatsPerMinute));
      const primaryNoteDuration = ((this.unmodifiedDetails.duration < 0) ?
         -this.unmodifiedDetails.duration : (60.0 / ((this.unmodifiedDetails.duration / this.tempo.beatBase) * this.tempo.beatsPerMinute))) -
         (4 * turnNoteDuration);
      return [new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         -turnNoteDuration,
         0.0
      ),
      new NoteDetails(
         this.#isUpper ? upperNote : lowerNote,
         this.unmodifiedDetails.velocity * 0.75,
         -turnNoteDuration,
         turnNoteDuration
      ),
      new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity * 0.75,
         -turnNoteDuration,
         2 * turnNoteDuration
      ),
      new NoteDetails(
         this.#isUpper ? lowerNote : upperNote,
         this.unmodifiedDetails.velocity * 0.75,
         -turnNoteDuration,
         3 * turnNoteDuration
      ),
      new NoteDetails(
         this.unmodifiedDetails.note,
         this.unmodifiedDetails.velocity,
         -primaryNoteDuration,
         4 * turnNoteDuration
      )];
   }
}
