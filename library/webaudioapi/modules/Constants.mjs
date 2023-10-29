/**
 * Module containing all musical notation constants in the various formats expected by the
 * {@link WebAudioAPI} library.
 * 
 * @module Constants
 */

/**
 * Object representing a mapping between the notational name of a musical note and its MIDI value.
 * @constant {Object.<string, number>}
 */
export const Note = {  Rest: 0,
   C0: 12,             D0bb: 12,  C0s: 13,              D0b: 13,   D0: 14,  C0ss: 14,  E0bb: 14,
  D0s: 15,   E0b: 15,  F0bb: 15,   E0: 16,  D0ss: 16,   F0b: 16,   F0: 17,   E0s: 17,  G0bb: 17,
  F0s: 18,  E0ss: 18,   G0b: 18,   G0: 19,  F0ss: 19,  A0bb: 19,  G0s: 20,   A0b: 20,
   A0: 21,  G0ss: 21,  B0bb: 21,  A0s: 22,   B0b: 22,  C1bb: 22,   B0: 23,  A0ss: 23,   C1b: 23,
   C1: 24,   B0s: 24,  D1bb: 24,  C1s: 25,  B0ss: 25,   D1b: 25,   D1: 26,  C1ss: 26,  E1bb: 26,
  D1s: 27,   E1b: 27,  F1bb: 27,   E1: 28,  D1ss: 28,   F1b: 28,   F1: 29,   E1s: 29,  G1bb: 29,
  F1s: 30,  E1ss: 30,   G1b: 30,   G1: 31,  F1ss: 31,  A1bb: 31,  G1s: 32,   A1b: 32,
   A1: 33,  G1ss: 33,  B1bb: 33,  A1s: 34,   B1b: 34,  C2bb: 34,   B1: 35,  A1ss: 35,   C2b: 35,
   C2: 36,   B1s: 36,  D2bb: 36,  C2s: 37,  B1ss: 37,   D2b: 37,   D2: 38,  C2ss: 38,  E2bb: 38,
  D2s: 39,   E2b: 39,  F2bb: 39,   E2: 40,  D2ss: 40,   F2b: 40,   F2: 41,   E2s: 41,  G2bb: 41,
  F2s: 42,  E2ss: 42,   G2b: 42,   G2: 43,  F2ss: 43,  A2bb: 43,  G2s: 44,   A2b: 44,
   A2: 45,  G2ss: 45,  B2bb: 45,  A2s: 46,   B2b: 46,  C3bb: 46,   B2: 47,  A2ss: 47,   C3b: 47,
   C3: 48,   B2s: 48,  D3bb: 48,  C3s: 49,  B2ss: 49,   D3b: 49,   D3: 50,  C3ss: 50,  E3bb: 50,
  D3s: 51,   E3b: 51,  F3bb: 51,   E3: 52,  D3ss: 52,   F3b: 52,   F3: 53,   E3s: 53,  G3bb: 53,
  F3s: 54,  E3ss: 54,   G3b: 54,   G3: 55,  F3ss: 55,  A3bb: 55,  G3s: 56,   A3b: 56,
   A3: 57,  G3ss: 57,  B3bb: 57,  A3s: 58,   B3b: 58,  C4bb: 58,   B3: 59,  A3ss: 59,   C4b: 59,
   C4: 60,   B3s: 60,  D4bb: 60,  C4s: 61,  B3ss: 61,   D4b: 61,   D4: 62,  C4ss: 62,  E4bb: 62,
  D4s: 63,   E4b: 63,  F4bb: 63,   E4: 64,  D4ss: 64,   F4b: 64,   F4: 65,   E4s: 65,  G4bb: 65,
  F4s: 66,  E4ss: 66,   G4b: 66,   G4: 67,  F4ss: 67,  A4bb: 67,  G4s: 68,   A4b: 68,
   A4: 69,  G4ss: 69,  B4bb: 69,  A4s: 70,   B4b: 70,  C5bb: 70,   B4: 71,  A4ss: 71,   C5b: 71,
   C5: 72,   B4s: 72,  D5bb: 72,  C5s: 73,  B4ss: 73,   D5b: 73,   D5: 74,  C5ss: 74,  E5bb: 74,
  D5s: 75,   E5b: 75,  F5bb: 75,   E5: 76,  D5ss: 76,   F5b: 76,   F5: 77,   E5s: 77,  G5bb: 77,
  F5s: 78,  E5ss: 78,   G5b: 78,   G5: 79,  F5ss: 79,  A5bb: 79,  G5s: 80,   A5b: 80,
   A5: 81,  G5ss: 81,  B5bb: 81,  A5s: 82,   B5b: 82,  C6bb: 82,   B5: 83,  A5ss: 83,   C6b: 83,
   C6: 84,   B5s: 84,  D6bb: 84,  C6s: 85,  B5ss: 85,   D6b: 85,   D6: 86,  C6ss: 86,  E6bb: 86,
  D6s: 87,   E6b: 87,  F6bb: 87,   E6: 88,  D6ss: 88,   F6b: 88,   F6: 89,   E6s: 89,  G6bb: 89,
  F6s: 90,  E6ss: 90,   G6b: 90,   G6: 91,  F6ss: 91,  A6bb: 91,  G6s: 92,   A6b: 92,
   A6: 93,  G6ss: 93,  B6bb: 93,  A6s: 94,   B6b: 94,  C7bb: 94,   B6: 95,  A6ss: 95,   C7b: 95,
   C7: 96,   B6s: 96,  D7bb: 96,  C7s: 97,  B6ss: 97,   D7b: 97,   D7: 98,  C7ss: 98,  E7bb: 98,
  D7s: 99,   E7b: 99,  F7bb: 99,   E7: 100, D7ss: 100,  F7b: 100,  F7: 101,  E7s: 101, G7bb: 101,
  F7s: 102, E7ss: 102,  G7b: 102,  G7: 103, F7ss: 103, A7bb: 103, G7s: 104,  A7b: 104,
   A7: 105, G7ss: 105, B7bb: 105, A7s: 106,  B7b: 106, C8bb: 106,  B7: 107, A7ss: 107,  C8b: 107,
   C8: 108,  B7s: 108, D8bb: 108, C8s: 109, B7ss: 109,  D8b: 109,  D8: 110, C8ss: 110, E8bb: 110,
  D8s: 111,  E8b: 111, F8bb: 111,  E8: 112, D8ss: 112,  F8b: 112,  F8: 113,  E8s: 113, G8bb: 113,
  F8s: 114, E8ss: 114,  G8b: 114,  G8: 115, F8ss: 115, A8bb: 115, G8s: 116,  A8b: 116,
   A8: 117, G8ss: 117, B8bb: 117, A8s: 118,  B8b: 118, C9bb: 118,  B8: 119, A8ss: 119,  C9b: 119,
   C9: 120,  B8s: 120, D9bb: 120, C9s: 121, B8ss: 121,  D9b: 121,  D9: 122, C9ss: 122, E9bb: 122,
  D9s: 123,  E9b: 123, F9bb: 123,  E9: 124, D9ss: 124,  F9b: 124,  F9: 125,  E9s: 125, G9bb: 125,
  F9s: 126, E9ss: 126,  G9b: 126,  G9: 127, F9ss: 127, A9bb: 127, G9s: 128,  A9b: 128,
   A9: 129, G9ss: 129, B9bb: 129, A9s: 130,  B9b: 130,   B9: 131,           A9ss: 131
};

/**
 * Array containing the frequency (in Hz) of the MIDI value at the corresponding array index.
 * @constant {number[]}
 */
export const Frequency = [
      0.0,    8.66,    9.18,    9.72,    10.30,    10.91,    11.56,    12.25,    12.98,    13.75,    14.57,    15.43,
    16.35,   17.32,   18.35,   19.45,    20.60,    21.83,    23.12,    24.50,    25.96,    27.50,    29.14,    30.87,
    32.70,   34.65,   36.71,   38.89,    41.20,    43.65,    46.25,    49.00,    51.91,    55.00,    58.27,    61.74,
    65.41,   69.30,   73.42,   77.78,    82.41,    87.31,    92.50,    98.00,   103.83,   110.00,   116.54,   123.47,
   130.81,  138.59,  146.83,  155.56,   164.81,   174.61,   185.00,   196.00,   207.65,   220.00,   233.08,   246.94,
   261.63,  277.18,  293.66,  311.13,   329.63,   349.23,   369.99,   392.00,   415.30,   440.00,   466.16,   493.88,
   523.25,  554.37,  587.33,  622.25,   659.26,   698.46,   739.99,   783.99,   830.61,   880.00,   932.33,   987.77,
  1046.50, 1108.73, 1174.66, 1244.51,  1318.51,  1396.91,  1479.98,  1567.98,  1661.22,  1760.00,  1864.66,  1975.53,
  2093.00, 2217.46, 2349.32, 2489.02,  2637.02,  2793.83,  2959.96,  3135.96,  3322.44,  3520.00,  3729.31,  3951.07,
  4186.01, 4434.92, 4698.64, 4978.03,  5274.04,  5587.65,  5919.91,  6271.93,  6644.88,  7040.00,  7458.62,  7902.13,
  8372.02, 8869.84, 9397.27, 9956.06, 10548.08, 11175.30, 11839.82, 12534.86, 13289.75, 14080.00, 14917.24, 15804.26
];

/**
 * Object representing a mapping between the notational name of a musical duration and its associated beat scaling factor.
 * @constant {Object.<string, number>}
 */
export const Duration = {
          Whole: 1.0,         DottedWhole: 2.0 / 3.0,          DottedDottedWhole: 4.0 / 7.0,
           Half: 2.0,          DottedHalf: 4.0 / 3.0,           DottedDottedHalf: 8.0 / 7.0,
        Quarter: 4.0,       DottedQuarter: 8.0 / 3.0,       DottedDottedQuarter: 16.0 / 7.0,
         Eighth: 8.0,       DottedEighth: 16.0 / 3.0,        DottedDottedEighth: 32.0 / 7.0,
     Sixteenth: 16.0,    DottedSixteenth: 32.0 / 3.0,     DottedDottedSixteenth: 64.0 / 7.0,
  ThirtySecond: 32.0, DottedThirtySecond: 64.0 / 3.0, DottedDottedThirtySecond: 128.0 / 7.0,
   SixtyFourth: 64.0, DottedSixtyFourth: 128.0 / 3.0,  DottedDottedSixtyFourth: 256.0 / 7.0
};

/**
 * Object representing a mapping between an effect type and its unique internal code.
 * @constant {Object.<string, number>}
 */
export const EffectType = {
   Reverb: 11, Delay: 12, Echo: 13, PitchShift: 14, Doppler: 15,                    // Time-Based Effects
   Chorus: 21, Tremolo: 22, Vibrato: 23, Flanger: 24, Phaser: 25,                   // Modulation Effects
   Panning: 31, Equalization: 32,                                                   // Spectral Effects
   Volume: 41, Compression: 42, Distortion: 43,                                     // Dynamic Effects
   LowPassFilter: 51, HighPassFilter: 52, BandPassFilter: 53, BandRejectFilter: 54  // Filter Effects
};

/**
 * Object representing a mapping between an acoustic analysis type and its unique internal code.
 * @constant {Object.<string, number>}
 */
export const AnalysisType = {
   TimeSeries: 1, PowerSpectrum: 2, TotalPower: 3
};

/**
 * Object representing a mapping between an encoding file type and its unique internal code.
 * @constant {Object.<string, number>}
 */
export const EncodingType = {
   WAV: 1
};
