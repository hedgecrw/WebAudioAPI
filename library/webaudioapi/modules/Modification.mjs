/**
 * Module containing functionality to apply {@link WebAudioAPI} note modifications.
 * @module Modification
 */

import { ModificationType } from './Constants.mjs';
import { Accent } from '../modifications/Accent.mjs';
import { Crescendo } from '../modifications/Crescendo.mjs';
import { Fermata } from '../modifications/Fermata.mjs';
import { Glissando } from '../modifications/Glissando.mjs';
import { GlobalDynamic } from '../modifications/GlobalDynamic.mjs';
import { Grace } from '../modifications/Grace.mjs';
import { Marcato } from '../modifications/Marcato.mjs';
import { Mordent } from '../modifications/Mordent.mjs';
import { Natural } from '../modifications/Natural.mjs';
import { OctaveShift } from '../modifications/OctaveShift.mjs';
import { Portamento } from '../modifications/Portamento.mjs';
import { Sforzando } from '../modifications/Sforzando.mjs';
import { Slur } from '../modifications/Slur.mjs';
import { Staccato } from '../modifications/Staccato.mjs';
import { Tenuto } from '../modifications/Tenuto.mjs';
import { Tie } from '../modifications/Tie.mjs';
import { Trill } from '../modifications/Trill.mjs';
import { Tuplet } from '../modifications/Tuplet.mjs';
import { TupletNote } from '../modifications/TupletNote.mjs';
import { Turn } from '../modifications/Turn.mjs';
import { Velocity } from '../modifications/Velocity.mjs';
import { NoteDetails } from '../modifications/ModificationBase.mjs';

export { GlobalDynamic, NoteDetails };

const ModificationClasses = {
   [ModificationType.Accent]: [Accent, Accent],
   [ModificationType.Marcato]: [Marcato, Marcato],
   [ModificationType.Staccato]: [Staccato, Staccato.bind(null, false)],
   [ModificationType.Staccatissimo]: [Staccato, Staccato.bind(null, true)],
   [ModificationType.Tenuto]: [Tenuto, Tenuto],
   [ModificationType.Sforzando]: [Sforzando, Sforzando],
   [ModificationType.Slur]: [Slur, Slur],
   [ModificationType.Portamento]: [Portamento, Portamento],
   [ModificationType.Crescendo]: [Crescendo, Crescendo.bind(null, false)],
   [ModificationType.Decrescendo]: [Crescendo, Crescendo.bind(null, true)],
   [ModificationType.Diminuendo]: [Crescendo, Crescendo.bind(null, true)],
   [ModificationType.TrillUpper]: [Trill, Trill.bind(null, true)],
   [ModificationType.TrillLower]: [Trill, Trill.bind(null, false)],
   [ModificationType.MordentUpper]: [Mordent, Mordent.bind(null, true)],
   [ModificationType.MordentLower]: [Mordent, Mordent.bind(null, false)],
   [ModificationType.TurnUpper]: [Turn, Turn.bind(null, true)],
   [ModificationType.TurnLower]: [Turn, Turn.bind(null, false)],
   [ModificationType.Glissando]: [Glissando, Glissando],
   [ModificationType.GraceAcciaccatura]: [Grace, Grace.bind(null, false)],
   [ModificationType.GraceAppoggiatura]: [Grace, Grace.bind(null, true)],
   [ModificationType.Tie]: [Tie, Tie],
   [ModificationType.Velocity]: [Velocity, Velocity],
   [ModificationType.Natural]: [Natural, Natural],
   [ModificationType.Piano]: [GlobalDynamic, GlobalDynamic.bind(null, -1)],
   [ModificationType.MezzoPiano]: [GlobalDynamic, GlobalDynamic.bind(null, -0.5)],
   [ModificationType.OctaveShiftUp]: [OctaveShift, OctaveShift.bind(null, true)],
   [ModificationType.OctaveShiftDown]: [OctaveShift, OctaveShift.bind(null, false)],
   [ModificationType.Pianissimo]: [GlobalDynamic, GlobalDynamic.bind(null, -2)],
   [ModificationType.Pianississimo]: [GlobalDynamic, GlobalDynamic.bind(null, -3)],
   [ModificationType.Forte]: [GlobalDynamic, GlobalDynamic.bind(null, 1)],
   [ModificationType.MezzoForte]: [GlobalDynamic, GlobalDynamic.bind(null, 0.5)],
   [ModificationType.Fortissimo]: [GlobalDynamic, GlobalDynamic.bind(null, 2)],
   [ModificationType.Fortississimo]: [GlobalDynamic, GlobalDynamic.bind(null, 3)],
   [ModificationType.Tuplet]: [Tuplet, Tuplet],
   [ModificationType.Triplet]: [TupletNote, TupletNote.bind(null, 3)],
   [ModificationType.Quintuplet]: [TupletNote, TupletNote.bind(null, 5)],
   [ModificationType.Sextuplet]: [TupletNote, TupletNote.bind(null, 6)],
   [ModificationType.Septuplet]: [TupletNote, TupletNote.bind(null, 7)],
   [ModificationType.Fermata]: [Fermata, Fermata]
};


/**
 * Returns whether the corresponding {@link module:Constants.ModificationType ModificationType}
 * can be used to modify a sequence of notes.
 * 
 * @param {number} modificationType - The {@link module:Constants.ModificationType ModificationType} about which to query
 * @returns {boolean} Whether the corresponding modification type can be used to modify a sequence of notes
 * @see {@link module:Constants.ModificationType ModificationType}
 */
export function canModifySequence(modificationType) {
   return ModificationClasses[modificationType][0].canModifySequence();
}

/**
 * Returns a list of modification-specific parameters for use with the corresponding
 * {@link module:Constants.ModificationType ModificationType}.
 * 
 * Note that the `modificationType` parameter must be the **numeric value** associated
 * with a certain {@link module:Constants.ModificationType ModificationType}, not a
 * string-based key.
 * 
 * The object returned from this function will contain 2 keys: 'required' and 'optional'.
 * These keys can be used to access sub-objects with 2 keys: 'singleNote' and 'sequence'.
 * These keys hold arrays containing the string-based names of parameters that are available
 * for manipulation within the given modification.
 * 
 * Parameter values within the "sequence" array indicate parameters that have meaning when
 * used with the {@link WebAudioAPI#playSequence playSequence()} function. Parameter values
 * within the "singleNote" array indicate parameters that have meaning when used with the 
 * {@link WebAudioAPI#playNote playNote()} function.
 * 
 * @param {number} modificationType - The {@link module:Constants.ModificationType ModificationType} for which to return a parameter list
 * @returns {Object<string,Object<string,string[]>>} List of modification-specific parameter keys and when they are required
 * @see {@link module:Constants.ModificationType ModificationType}
 */
export function getModificationParameters(modificationType) {
   return ModificationClasses[modificationType][0].getParameters();
}

/**
 * Attempts to infer the required modification parameter values from a given sequence of notes.
 * 
 * @param {number} modificationType - Numeric value corresponding to the desired {@link module:Constants.ModificationType ModificationType}
 * @param {Array<Array|Array<Array>>} sequence - Array of `[note, duration]` and/or chords corresponding to the sequence to be played
 * @param {number} index - Index of the current note in the sequence
 * @param {Object|null} params - Object containing the currently known parameter values
 * @returns {Object} Object containing the inferred and known parameter values
 * @see {@link module:Constants.ModificationType ModificationType}
 */
export function inferModificationParametersFromSequence(modificationType, sequence, index, params) {
   return ModificationClasses[modificationType][0].inferParametersFromSequence(sequence, index, params);
}

/**
 * Loads a concrete {@link ModificationBase} instance capable of modifying an individual note
 * and duration.
 * 
 * @param {number} modificationType - Numeric value corresponding to the desired {@link module:Constants.ModificationType ModificationType}
 * @param {Tempo} tempo - Reference to the current global {@link Tempo} object
 * @param {Key} key - Reference to the current global {@link Key} object
 * @param {NoteDetails} details - Unmodified details about the note to be played
 * @returns {ModificationBase} Newly created note {@link ModificationBase} object
 * @see {@link module:Constants.ModificationType ModificationType}
 * @see {@link ModificationBase}
 * @see {@link NoteDetails}
 * @see {@link Tempo}
 */
export function loadModification(modificationType, tempo, key, details) {

   // Load the requested concrete modification type
   return new ModificationClasses[modificationType][1](tempo, key, details);
}
