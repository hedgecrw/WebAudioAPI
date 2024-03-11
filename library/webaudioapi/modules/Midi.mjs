/**
 * Module containing all MIDI constants and functionality available in the {@link WebAudioAPI} library.
 * 
 * @module Midi
 */

/**
 * Object representing a mapping between a General MIDI command and its protocol value.
 * @constant {Object<string, number>}
 */
export const MidiCommand = {
   Unknown: 0x00, NoteOff: 0x80, NoteOn: 0x90, Aftertouch: 0xA0, ContinuousController: 0xB0,
   ProgramChange: 0xC0, ChannelPressure: 0xD0, PitchBend: 0xE0, SystemMessage: 0xF0
};

/**
 * Object representing a mapping between a General MIDI instrument and its patch number.
 * @constant {Object<string, number>}
 */
export const MidiInstrument = {
   'Grand Piano': 0x00, 'Bright Piano': 0x01, 'Electric Grand Piano': 0x02, 'Honky Tonk Piano': 0x03,
   'Electric Piano 1': 0x04, 'Electric Piano 2': 0x05, 'Harpsicord': 0x06, 'Clavinet': 0x07,
   'Celesta': 0x08, 'Glockenspiel': 0x09, 'Music Box': 0x0A, 'Vibraphone': 0x0B, 'Marimba': 0x0C,
   'Xylophone': 0x0D, 'Tubular Bell': 0x0E, 'Dulcimer': 0x0F, 'Hammond Organ': 0x10,
   'Percussive Organ': 0x11, 'Rock Organ': 0x12, 'Church Organ': 0x13, 'Reed Organ': 0x14,
   'Accordion': 0x15, 'Harmonica': 0x16, 'Tango Accordion': 0x17, 'Nylon Acoustic Guitar': 0x18,
   'Steel Acoustic Guitar': 0x19, 'Jazz Electric Guitar': 0x1A, 'Clean Electric Guitar': 0x1B,
   'Muted Electric Guitar': 0x1C, 'Overdriven Guitar': 0x1D, 'Distortion Guitar': 0x1E,
   'Guitar Harmonics': 0x1F, 'Acoustic Bass': 0x20, 'Fingered Electric Bass': 0x21,
   'Picked Electric Bass': 0x22, 'Fretless Bass': 0x23, 'Slap Bass 1': 0x24, 'Slap Bass 2': 0x25,
   'Synth Bass 1': 0x26, 'Synth Bass 2': 0x27, 'Violin': 0x28, 'Viola': 0x29, 'Cello': 0x2A,
   'Contrabass': 0x2B, 'Tremolo Strings': 0x2C, 'Pizzicato Strings': 0x2D, 'Harp': 0x2E,
   'Timpani': 0x2F, 'String Ensemble': 0x30, 'Slow Strings': 0x31, 'Synth Strings 1': 0x32,
   'Synth Strings 2': 0x33, 'Choir Aahs': 0x34, 'Choir Oohs': 0x35, 'Synth Choir': 0x36,
   'Orchestra Hit': 0x37, 'Trumpet': 0x38, 'Trombone': 0x39, 'Tuba': 0x3A, 'Muted Trumpet': 0x3B,
   'French Horn': 0x3C, 'Brass Ensemble': 0x3D, 'Synth Brass 1': 0x3E, 'Synth Brass 2': 0x3F,
   'Soprano Sax': 0x40, 'Alto Sax': 0x41, 'Tenor Sax': 0x42, 'Baritone Sax': 0x43, 'Oboe': 0x44,
   'English Horn': 0x45, 'Bassoon': 0x46, 'Clarinet': 0x47, 'Piccolo': 0x48, 'Flute': 0x49,
   'Recorder': 0x4A, 'Pan Flute': 0x4B, 'Bottle Blow': 0x4C, 'Shakuhachi': 0x4D, 'Whistle': 0x4E,
   'Ocarina': 0x4F, 'Synth Square Wave': 0x50, 'Synth Saw Wave': 0x51, 'Synth Calliope': 0x52,
   'Synth Chiff': 0x53, 'Synth Charang': 0x54, 'Synth Voice': 0x55, 'Synth Fifths Saw': 0x56,
   'Synth Brass and Lead': 0x57, 'Fantasia': 0x58, 'Warm Pad': 0x59, 'Polysynth': 0x5A,
   'Space Vox': 0x5B, 'Bowed Glass': 0x5C, 'Metal Pad': 0x5D, 'Halo Pad': 0x5E, 'Sweep Pad': 0x5F,
   'Ice Rain': 0x60, 'Soundtrack': 0x61, 'Crystal': 0x62, 'Atmosphere': 0x63, 'Brightness': 0x64,
   'Goblins': 0x65, 'Echo Drops': 0x66, 'Sci-fi': 0x67, 'Sitar': 0x68, 'Banjo': 0x69, 'Shamisen': 0x6A,
   'Koto': 0x6B, 'Kalimba': 0x6C, 'Bag Pipe': 0x6D, 'Fiddle': 0x6E, 'Shanai': 0x6F, 'Tinkle Bell': 0x70,
   'Agogo': 0x71, 'Steel Drums': 0x72, 'Woodblock': 0x73, 'Taiko Drum': 0x74, 'Melodic Tom': 0x75,
   'Synth Drum': 0x76, 'Reverse Cymbal': 0x77, 'Guitar Fret Noise': 0x78, 'Breath Noise': 0x79,
   'Seashore': 0x7A, 'Bird Tweet': 0x7B, 'Telephone Ring': 0x7C, 'Helicopter': 0x7D, 'Applause': 0x7E,
   'Gunshot': 0x7F
};

/**
 * Returns a value representing the MIDI command in the specified `midiData`.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} MIDI command specified in the corresponding `midiData`
 * @see {@link module:Midi.MidiCommand MidiCommand}
 */
export function getMidiCommand(midiData) {
   return midiData[0] & 0xF0;
}

/**
 * Returns a string representing the MIDI command in the specified `midiData`.
 * 
 * The returned string can be used to index into the {@link module:Midi.MidiCommand MidiCommand}
 * map object.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {string} String representing the MIDI command in the specified `midiData`
 * @see {@link module:Midi.MidiCommand MidiCommand}
 */
export function getMidiCommandString(midiData) {
   const value = midiData[0] & 0xF0;
   const key = Object.keys(MidiCommand).find(key => MidiCommand[key] == value);
   return key ? key : 'Unknown';
}

/**
 * Returns the MIDI channel target for the command specified in `midiData`.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} MIDI channel target specified in `midiData`
 */
export function getMidiChannel(midiData) {
   return midiData[0] & 0x0F;
}

/**
 * Returns the MIDI note corresponding to the `NoteOn` or `NoteOff` command in the specified
 * `midiData` parameter.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} MIDI note corresponding to the relevant `midiData` command
 */
export function getMidiNote(midiData) {
   return midiData[1] & 0x7F;
}

/**
 * Returns the note velocity corresponding to the `NoteOn` or `NoteOff` command in the
 * specified `midiData` parameter. This velocity will be in the range from [0.0, 1.0].
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} Note velocity for a MIDI note in the range [0.0, 1.0]
 */
export function getMidiVelocity(midiData) {
   return (midiData[2] & 0x7F) / 127.0;
}

/**
 * Returns the target program number for the MIDI channel specified in `midiData`.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} Target program number for the specified MIDI channel
 */
export function getMidiProgramChange(midiData) {
   return midiData[1] & 0x7F;
}

/**
 * Returns the target MIDI instrument patch value for the MIDI channel indicated in
 * the specified `midiData` parameter.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {number} Target MIDI instrument patch value for the specified MIDI channel
 * @see {@link module:Midi.MidiInstrument MidiInstrument}
 */
export function getMidiInstrumentChange(midiData) {
   return midiData[1] & 0x7F;
}

/**
 * Returns the target MIDI instrument for the MIDI channel indicated in the specified
 * `midiData` parameter.
 * 
 * The returned string can be used to index into the {@link module:Midi.MidiInstrument MidiInstrument}
 * map object.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @returns {string} Target MIDI instrument name for the specified MIDI channel
 * @see {@link module:Midi.MidiInstrument MidiInstrument}
 */
export function getMidiInstrumentChangeString(midiData) {
   const patchNumber = midiData[1] & 0x7F;
   return Object.keys(MidiInstrument).find(key => MidiInstrument[key] == patchNumber);
}

/**
 * Returns a scaler value by which the fundamental frequency of the unbent MIDI note should be
 * multiplied in order to output to the correct frequency.
 * 
 * @param {number[]} midiData - Data array containing raw MIDI event data
 * @param {number} maxPitchBendNumSemitones - Absolute maximum number of semitones to which a note can be bent
 * @returns {number} Frequency scaler by which the unbent fundamental frequency should be multiplied
 */
export function getMidiPitchBend(midiData, maxPitchBendNumSemitones) {
   const value = ((((midiData[2] & 0x007F) << 7) | (midiData[1] & 0x007F)) - 8192) / 8192.0;
   return Math.pow(2.0, value * maxPitchBendNumSemitones / 12.0);
}
