import { Instrument } from './Instrument.js';

const instrumentList = {
   'Grand Piano': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/piano/grand_piano.inst',
   'Electric Bass': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/bass/electric_bass.inst',
   'Bassoon': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/bassoon/bassoon.inst',
   'Cello': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/cello/cello.inst',
   'Acoustic Guitar': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/guitar/acoustic_guitar.inst',
   'Electric Guitar': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/guitar/electric_guitar.inst',
   'Nylon Guitar': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/guitar/nylon_guitar.inst',
   'Harp': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/harp/harp.inst',
   'Pipe Organ': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/organ/pipe_organ.inst',
   'Violin': jsPath.replace(/\/$/, '') + '/webaudioapi/instruments/violin/violin.inst'
}

export function getAvailableInstruments() { return Object.keys(instrumentList); }
export async function loadInstrument(audioContext, instrumentName) { return Instrument.loadInstrument(audioContext, instrumentName, instrumentList[instrumentName]); }
