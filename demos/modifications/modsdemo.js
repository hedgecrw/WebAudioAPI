async function minuetInG() {
   // Create a bass line track with a grand piano
   AudioAPI.createTrack('bassTrack');
   await AudioAPI.updateInstrument('bassTrack', 'Grand Piano');
   // TODO: Apply a light reverb

   // Treble line
   AudioAPI.updateTempo(4, 160, 3, 4);
   let startTime = 0.2 + AudioAPI.getCurrentTime();
   const trebleNotes = [
      [Notes.D5, Durations.Quarter],
      [Notes.G4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.C5, Durations.Eighth],
      [Notes.D5, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.E5, Durations.Quarter],
      [Notes.C5, Durations.Eighth, { type: Mods.MordentLower, value: 1 }],
      [Notes.D5, Durations.Eighth],
      [Notes.E5, Durations.Eighth],
      [Notes.F5s, Durations.Eighth],
      [Notes.G5, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.C5, Durations.Quarter, { type: Mods.MordentLower, value: 1 }],
      [Notes.D5, Durations.Eighth],
      [Notes.C5, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.B4, Durations.Quarter],
      [Notes.C5, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.G4, Durations.Eighth],
      [Notes.F4s, Durations.Quarter],
      [Notes.G4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.G4, Durations.Eighth],
      [Notes.A4, Durations.DottedHalf, { type: Mods.GraceAcciaccatura, value: Notes.B4 }],
      
      [Notes.D5, Durations.Quarter],
      [Notes.G4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.C5, Durations.Eighth],
      [Notes.D5, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.E5, Durations.Quarter],
      [Notes.C5, Durations.Eighth, { type: Mods.MordentLower, value: 1 }],
      [Notes.D5, Durations.Eighth],
      [Notes.E5, Durations.Eighth],
      [Notes.F5s, Durations.Eighth],
      [Notes.G5, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.G4, Durations.Quarter],
      [Notes.C5, Durations.Quarter, { type: Mods.MordentLower, value: 1 }],
      [Notes.D5, Durations.Eighth],
      [Notes.C5, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.B4, Durations.Quarter],
      [Notes.C5, Durations.Eighth],
      [Notes.B4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.G4, Durations.Eighth],
      [Notes.A4, Durations.Quarter],
      [Notes.B4, Durations.Eighth],
      [Notes.A4, Durations.Eighth],
      [Notes.G4, Durations.Eighth],
      [Notes.F4s, Durations.Eighth],
      [Notes.G4, Durations.DottedHalf]
   ];

   // Bass line
   startTime = 0.2 + AudioAPI.getCurrentTime();
   startTime += await AudioAPI.playChord('bassTrack', [[Notes.G3, Durations.Half], [Notes.B3, Durations.Half], [Notes.D4, Durations.Half]], startTime);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.C4, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.D4, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.D4, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.D3, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.C4, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.Eighth);

   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Half);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.C4, startTime, Durations.DottedHalf);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.C4, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Eighth);
   startTime += await AudioAPI.playNote('bassTrack', Notes.A3, startTime, Durations.Half);
   startTime += await AudioAPI.playNote('bassTrack', Notes.F3s, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Half);
   startTime += await AudioAPI.playNote('bassTrack', Notes.B3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.C4, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.D4, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.D3, startTime, Durations.Quarter);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G3, startTime, Durations.Half);
   startTime += await AudioAPI.playNote('bassTrack', Notes.G2, startTime, Durations.Quarter);
   return startTime;
}

async function generateMelody(modificationType) {
   let startTime = 0.2 + AudioAPI.getCurrentTime(), value = null;
   switch (modificationType) {
      case Mods.Accent:           // Intentional fallthrough
      case Mods.Marcato:          // Intentional fallthrough
      case Mods.Staccato:         // Intentional fallthrough
      case Mods.Staccatissimo:    // Intentional fallthrough
      case Mods.Sforzando:        // Intentional fallthrough
      case Mods.Tenuto:
         AudioAPI.updateTempo(4, 100, 4, 4);
         for (let i = 0; i < 16; ++i)
            startTime += await AudioAPI.playNote('defaultTrack', 67, startTime, Durations.Eighth, (i == 0 || i == 3 || i == 6 || i == 8 || i == 11 || i == 14) ? AudioAPI.getModification(modificationType) : []);
         break;
      case Mods.Slur:
         AudioAPI.updateTempo(4, 70, 4, 4);
         startTime += await AudioAPI.playNote('defaultTrack', 0, startTime, Durations.Eighth, { type: Mods.Pianississimo });
         startTime += await AudioAPI.playSequence('defaultTrack', [[69, Durations.Eighth], [71, Durations.Eighth], [73, Durations.Eighth],
                                                                   [71, Durations.Eighth], [69, Durations.Eighth], [71, Durations.DottedEighth],
                                                                   [68, Durations.Sixteenth], [66, Durations.Half]], startTime, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playNote('defaultTrack', 0, startTime, Durations.Eighth);
         startTime += await AudioAPI.playSequence('defaultTrack', [[71, Durations.Eighth], [73, Durations.Eighth], [74, Durations.Eighth],
                                                                   [73, Durations.Eighth], [71, Durations.Eighth], [73, Durations.DottedEighth],
                                                                   [69, Durations.Sixteenth], [68, Durations.Quarter]], startTime, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playSequence('defaultTrack', [[69, Durations.Quarter], [71, Durations.Quarter]], startTime);
         break;
      case Mods.Portamento:        // Intentional fallthrough
      case Mods.Glissando:
         AudioAPI.updateTempo(4, 160, 4, 4);
         startTime += await AudioAPI.playSequence('defaultTrack', [[64, Durations.Quarter], [62, Durations.Quarter],
                                                                   [60, Durations.Half, AudioAPI.getModification(modificationType)], [72, Durations.Half]], startTime);
         break;
      case Mods.Crescendo:         // Intentional fallthrough
      case Mods.Decrescendo:       // Intentional fallthrough
      case Mods.Diminuendo:
         AudioAPI.updateTempo(4, 120, 3, 4);
         value = (modificationType == Mods.Crescendo) ? Mods.Fortissimo : Mods.Pianississimo;
         startTime += await AudioAPI.playNote('defaultTrack', 74, startTime, Durations.Quarter, AudioAPI.getModification(Mods.Fortissimo));
         startTime += await AudioAPI.playSequence('defaultTrack', [[67, Durations.Eighth, AudioAPI.getModification((modificationType == Mods.Crescendo) ? Mods.Pianissimo : value)],
                                                                   [69, Durations.Eighth], [71, Durations.Eighth], [72, Durations.Eighth],
                                                                   [74, Durations.Quarter]], startTime, AudioAPI.getModification(modificationType, { endingDynamic: value }));
         startTime += await AudioAPI.playSequence('defaultTrack', [[67, Durations.Quarter], [67, Durations.Quarter]], startTime);
         break;
      case Mods.TrillUpper:          // Intentional fallthrough
      case Mods.MordentUpper:        // Intentional fallthrough
      case Mods.TrillLower:          // Intentional fallthrough
      case Mods.MordentLower:        // Intentional fallthrough
      case Mods.TurnUpper:           // Intentional fallthrough
      case Mods.TurnLower:           // Intentional fallthrough
         AudioAPI.updateTempo(4, 100, 4, 4);
         startTime += await AudioAPI.playSequence('defaultTrack', [[72, Durations.Half, AudioAPI.getModification(modificationType)],
                                                                   [71, Durations.Quarter], [69, Durations.Quarter]], startTime);
         break;   
      case Mods.GraceAcciaccatura:   // Intentional fallthrough
      case Mods.GraceAppoggiatura:
         AudioAPI.updateTempo(4, 100, 4, 4);
         startTime += await AudioAPI.playSequence('defaultTrack', [[72, Durations.Half, AudioAPI.getModification(modificationType, 74)],
                                                                   [71, Durations.Quarter], [69, Durations.Quarter]], startTime);
         break;
      case Mods.Tie:
         AudioAPI.updateTempo(4, 200, 4, 4);
         startTime += await AudioAPI.playSequence('defaultTrack', [[63, Durations.Quarter], [65, Durations.Quarter], [67, Durations.Quarter],
                                                                   [63, Durations.Quarter, AudioAPI.getModification(modificationType)],
                                                                   [63, Durations.Quarter], [65, Durations.Quarter], [67, Durations.Quarter], [63, Durations.Quarter]], startTime);
         break;
      case Mods.OctaveShiftUp:       // Intentional fallthrough
      case Mods.OctaveShiftDown:
         AudioAPI.updateTempo(4, 200, 4, 4);
         startTime += await AudioAPI.playSequence('defaultTrack', [[64, Durations.Quarter], [62, Durations.Quarter], [60, Durations.Quarter],
                                                                   [62, Durations.Quarter], [64, Durations.Quarter], [64, Durations.Quarter], [64, Durations.Half]], startTime);
         startTime += await AudioAPI.playSequence('defaultTrack', [[62, Durations.Quarter], [62, Durations.Quarter], [62, Durations.Half], [64, Durations.Quarter],
                                                                   [67, Durations.Quarter], [67, Durations.Half]], startTime, AudioAPI.getModification(modificationType));
         break;
      case Mods.Velocity:
         AudioAPI.updateTempo(4, 100, 4, 4);
         for (const val of [37, 67, 47, 52, 67, 67, 77, 47])
            startTime += await AudioAPI.playNote('defaultTrack', val, startTime, Durations.Eighth, AudioAPI.getModification(modificationType, Math.random()));
         break;
      case Mods.Piano:             // Intentional fallthrough
      case Mods.Forte:             // Intentional fallthrough
      case Mods.MezzoPiano:        // Intentional fallthrough
      case Mods.MezzoForte:        // Intentional fallthrough
      case Mods.Pianissimo:        // Intentional fallthrough
      case Mods.Fortissimo:        // Intentional fallthrough
      case Mods.Pianississimo:     // Intentional fallthrough
      case Mods.Fortississimo:     // Intentional fallthrough
      case Mods.Fermata:
         AudioAPI.updateTempo(4, 200, 2, 4);
         value = ((modificationType == Mods.Pianississimo) || (modificationType == Mods.Pianissimo) ||
                  (modificationType == Mods.Piano) || (modificationType== Mods.MezzoPiano)) ? Mods.Fortississimo : Mods.Pianississimo;
         startTime += await AudioAPI.playSequence('defaultTrack', [[0, Durations.Eighth, AudioAPI.getModification(value)],
                                                                   [67, Durations.Eighth], [67, Durations.Eighth], [67, Durations.Eighth],
                                                                   [63, Durations.Half, (modificationType == Mods.Fermata) ? AudioAPI.getModification(modificationType) : []]], startTime);
         startTime += await AudioAPI.playSequence('defaultTrack', [[0, Durations.Eighth, (modificationType == Mods.Fermata) ? [] : AudioAPI.getModification(modificationType)],
                                                                   [65, Durations.Eighth], [65, Durations.Eighth], [65, Durations.Eighth],
                                                                   [62, Durations.Half, (modificationType == Mods.Fermata) ? AudioAPI.getModification(modificationType) : []]], startTime);
         break;
      case Mods.Tuplet:
         AudioAPI.updateTempo(4, 100, 4, 4);
         startTime += await AudioAPI.playNote('defaultTrack', 72, startTime, Durations.Quarter);
         startTime += await AudioAPI.playSequence('defaultTrack', [[72, Durations.Eighth], [74, Durations.Eighth], [76, Durations.Eighth]], startTime, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playSequence('defaultTrack', [[71, Durations.Quarter], [69, Durations.Quarter], [65, Durations.Quarter]], startTime);
         startTime += await AudioAPI.playSequence('defaultTrack', [[65, Durations.Sixteenth], [64, Durations.Sixteenth], [62, Durations.Sixteenth],
                                                                   [64, Durations.Sixteenth], [65, Durations.Sixteenth], [67, Durations.Sixteenth], [69, Durations.Sixteenth]],
                                                                   startTime, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playSequence('defaultTrack', [[71, Durations.Quarter], [72, Durations.Quarter]], startTime);
         break;
      case Mods.Triplet:
      case Mods.Quintuplet:
      case Mods.Sextuplet:
      case Mods.Septuplet:
         startTime += await AudioAPI.playNote('defaultTrack', 72, startTime, Durations.Quarter);
         for (const note of [72, 74, 76])
            startTime += await AudioAPI.playNote('defaultTrack', note, startTime, Durations.Eighth, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playSequence('defaultTrack', [[71, Durations.Quarter], [69, Durations.Quarter], [65, Durations.Quarter]], startTime);
         for (const note of [65, 64, 62, 64, 65, 67, 69])
            startTime += await AudioAPI.playNote('defaultTrack', note, startTime, Durations.Sixteenth, AudioAPI.getModification(modificationType));
         startTime += await AudioAPI.playSequence('defaultTrack', [[71, Durations.Quarter], [72, Durations.Quarter]], startTime);
         break;
      case 99999:
         startTime += await minuetInG();
         break;
      default:
         break;
   }
   return 0.5 + startTime;
}

async function createCleanTrack() {
   AudioAPI.stop();
   AudioAPI.removeAllTracks();
   AudioAPI.createTrack('defaultTrack');
   await AudioAPI.updateInstrument('defaultTrack', 'Grand Piano');
}

function changeModification(modificationType) {
   window.currentModType = modificationType;
   const modSelector = document.getElementById('modSelector');
   document.getElementById('modExample').src = 'images/' + modSelector.options[modSelector.options.selectedIndex].innerText + '.png';
}

window.play = async function() {
   window.playing = true;
   document.getElementById('playButton').classList.add('disabled');
   document.getElementById('stopButton').classList.remove('disabled');
   const melodyDoneTime = await generateMelody(Number(window.currentModType));
   AudioAPI.start();
   while (window.playing && (AudioAPI.getCurrentTime() < melodyDoneTime))
      await new Promise(res => setTimeout(res, 10));
   document.getElementById('playButton').classList.remove('disabled');
   document.getElementById('stopButton').classList.add('disabled');
   await createCleanTrack();
}

window.stop = function() {
   window.playing = false;
}

window.onload = async function() {
   window.playing = false;
   window.AudioAPI = new WebAudioAPI();
   window.Notes = AudioAPI.getAvailableNotes();
   window.Durations = AudioAPI.getAvailableNoteDurations();
   window.Mods = AudioAPI.getAvailableNoteModifications();
   for (const modification in Mods)
      modSelector.add(new Option(modification.match(/[A-Z][a-z]+/g).join(' '), Mods[modification]));
   modSelector.add(new Option('Full Example', 99999));
   await AudioAPI.getAvailableInstruments('../instruments');
   await createCleanTrack();
   changeModification(document.getElementById('modSelector').value);
};
