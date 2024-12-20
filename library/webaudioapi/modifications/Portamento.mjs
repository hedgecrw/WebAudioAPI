import { ModificationBase, NoteDetails } from './ModificationBase.mjs';
import * as WebAudioApiErrors from '../modules/Errors.mjs';

/**
 * Class representing a Portamento modification.
 * 
 * A Portamento modification causes a starting note to glide smoothly into the next printed
 * note, with no individual notes being discernible. The duration of a portamento spans the
 * entire printed duration of the starting note.
 * 
 * @extends ModificationBase
 */
export class Portamento extends ModificationBase {

   /**
    * Constructs a new {@link Portamento} modification object.
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
            singleNote: ['nextNoteValue'],
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

   static inferParametersFromSequence(sequence, index) {
      return (index < sequence.length) ?
         { 'nextNoteValue': (Array.isArray(sequence[index][0]) ? sequence[index][0][0] : sequence[index][0]) } :
         null;
   }

   /**
    * Returns a list of all modified notes, durations, and velocities as generated by the
    * corresponding modification class.
    * 
    * The `details` variable may contain the following optional key:
    * 
    * `nextNoteValue`:  MIDI number of the note that follows this note
    * 
    * @param {Object<string, number>} details - Information about the ending note of the portamento
    * @returns {NoteDetails[]} List of {@link NoteDetails} to replace the original note
    */
   getModifiedNoteDetails(details) {
      if (!('nextNoteValue' in details)) {
         if (!('implicit' in details))
            throw new WebAudioApiErrors.WebAudioValueError('The "details" variable must contain the following keys: nextNoteValue');
         details.nextNoteValue = details.implicit;
      }
      if (!Number.isInteger(details.nextNoteValue))
         throw new WebAudioApiErrors.WebAudioValueError(`The next note value (${details.nextNoteValue}) must be a positive integer representing a valid MIDI note`);
      else if (Number(details.nextNoteValue) <= this.unmodifiedDetails.note)
         throw new WebAudioApiErrors.WebAudioValueError(`The next note (${details.nextNoteValue}) must be higher than the current note (${this.unmodifiedDetails.note})`);
      // TODO: CHANGE THIS SO THAT IT DETUNES OVER THE DURATION TO THE "NEXT NOTE VALUE" (ONLY FOR INSTRUMENTS THAT ALLOW FOR CONTINUOUS SLIDES)
      const portamento = [];
      const totalDurationSeconds = (this.unmodifiedDetails.duration < 0) ?
         -this.unmodifiedDetails.duration : (60.0 / ((this.unmodifiedDetails.duration / this.tempo.beatBase) * this.tempo.beatsPerMinute));
      const noteDuration = totalDurationSeconds / (Number(details.nextNoteValue) - this.unmodifiedDetails.note);
      for (let i = 0, note = this.unmodifiedDetails.note; note < Number(details.nextNoteValue); ++note, ++i)
         portamento.push(new NoteDetails(
            note,
            this.unmodifiedDetails.velocity,
            -noteDuration,
            i * noteDuration
         ));
      return portamento;
   }
}
