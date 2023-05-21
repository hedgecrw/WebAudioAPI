import { Duration, Note } from './webaudioapi/scripts/Constants.js';

const durations = {
   'Whole Note': Duration.Whole,  'Dotted Whole Note': Duration.DottedWhole, 'Double Dotted Whole Note': Duration.DottedDottedWhole,
   'Half Note': Duration.Half, 'Dotted Half Note': Duration.DottedHalf, 'Double Dotted Half Note': Duration.DottedDottedHalf,
   'Quarter Note': Duration.Quarter, 'Dotted Quarter Note': Duration.DottedQuarter, 'Double Dotted Quarter Note': Duration.DottedDottedQuarter,
   '8th Note': Duration.Eighth, 'Dotted 8th Note': Duration.DottedEighth, 'Double Dotted 8th Note': Duration.DottedDottedEighth,
   '16th Note': Duration.Sixteenth, 'Dotted 16th Note': Duration.DottedSixteenth, 'Double Dotted 16th Note': Duration.DottedDottedSixteenth };

function addDurationOptions(durationElement) {
   for (let duration in durations)
      durationElement.add(new Option(duration, durations[duration]));
}

function addNoteOptions(noteElement) {
   noteElement.add(new Option('None', 0));
   for (let note in Note) {
      let text = note.slice(0, 2) + ((note[2] == 's') ? '♯' : (note[2] == 'b') ? '♭' : '') + ((note[3] == 's') ? '♯' : (note[3] == 'b') ? '♭' : '');
      noteElement.add(new Option(text, Note[note]));
   }
}

function addChord(_event, duration, chord) {
   const chordIndex = window.chordIndex++;
   const chordElement = document.createElement('div');
   chordElement.className = 'chord';
   const durationLabel = document.createElement('label');
   durationLabel.htmlFor = 'duration' + chordIndex.toString();
   durationLabel.innerText = 'Duration:';
   const durationSelection = document.createElement('select');
   durationSelection.className = 'duration';
   durationSelection.id = 'duration' + chordIndex.toString();
   durationSelection.name = 'duration' + chordIndex.toString();
   addDurationOptions(durationSelection);
   chordElement.appendChild(durationLabel);
   chordElement.appendChild(durationSelection);
   if (duration)
      durationSelection.selectedIndex = Object.keys(durations).indexOf(duration);
   for (let i = 1; i <= 3; ++i) {
      const noteLabel = document.createElement('label');
      noteLabel.htmlFor = 'note' + chordIndex.toString() + '_' + i.toString();
      noteLabel.innerText = 'Note ' + i.toString() + ':';
      const noteSelection = document.createElement('select');
      noteSelection.className = 'note';
      noteSelection.id = 'note' + chordIndex.toString() + '_' + i.toString();
      noteSelection.name = 'note' + chordIndex.toString() + '_' + i.toString();
      addNoteOptions(noteSelection);
      chordElement.appendChild(noteLabel);
      chordElement.appendChild(noteSelection);
      if (chord && chord[i-1])
         noteSelection.selectedIndex = Array.apply(null, noteSelection.options).map((option) => option.text).indexOf(chord[i-1]);
   }
   const addChordButton = document.createElement('div');
   addChordButton.id = 'addChord';
   addChordButton.onclick = addChord;
   chordElement.appendChild(addChordButton);
   document.getElementById('score').appendChild(chordElement);
}

function loadHappyBirthday() {
   window.chordIndex = 0;
   addChord(null, 'Half Note', ['D4']);
   addChord(null, 'Quarter Note', ['D4']);
   addChord(null, 'Dotted Half Note', ['E4', 'G2']);
   addChord(null, 'Dotted Half Note', ['D4', 'B3', 'D3']);
   addChord(null, 'Dotted Half Note', ['G4', 'B3', 'D3']);
   addChord(null, 'Dotted Whole Note', ['F4♯', 'D3']);
   addChord(null, 'Half Note', ['D4', 'A2']);
   addChord(null, 'Quarter Note', ['D4']);
   addChord(null, 'Dotted Half Note', ['E4', 'D2']);
   addChord(null, 'Dotted Half Note', ['D4', 'A3', 'F3♯']);
   addChord(null, 'Dotted Half Note', ['A4', 'A3', 'F3♯']);
   addChord(null, 'Dotted Whole Note', ['G4', 'G2']);
   addChord(null, 'Half Note', ['D4']);
   addChord(null, 'Quarter Note', ['D4']);
   addChord(null, 'Dotted Half Note', ['D5', 'G2']);
   addChord(null, 'Dotted Half Note', ['B4', 'B3', 'D3']);
   addChord(null, 'Dotted Half Note', ['G4', 'B3', 'D3']);
   addChord(null, 'Dotted Half Note', ['F4♯', 'C3']);
   addChord(null, 'Dotted Whole Note', ['E4', 'C4']);
   addChord(null, 'Half Note', ['C5']);
   addChord(null, 'Quarter Note', ['C5']);
   addChord(null, 'Dotted Half Note', ['B4', 'D3']);
   addChord(null, 'Dotted Half Note', ['G4', 'A3', 'F4♯']);
   addChord(null, 'Dotted Half Note', ['A4', 'A3', 'F4♯']);
   addChord(null, 'Dotted Whole Note', ['G4', 'G3', 'G2']);
}

window.changeInstrument = async function() {
   const instrumentSelector = document.getElementById('instrument');
   const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
   if (instrumentSelector.selectedIndex > 0) {
      document.getElementById('status').textContent = 'Loading...';
      window.audioAPI.start();
      window.instrument = await window.audioAPI.retrieveInstrument(instrumentSelection);
      window.audioAPI.changeInstrument('defaultTrack', window.instrument);
      document.getElementById('controls').classList.remove('disabled');
      document.getElementById('score').classList.remove('disabled');
      document.getElementById('status').textContent = 'Ready';
      console.log('Instrument loading complete!');
   }
}

window.clearScore = function() {
   window.chordIndex = 0;
   const chords = document.getElementsByClassName('chord');
   while (chords.length)
      chords[0].remove();
   addChord();
}

window.playScore = async function() {
   document.getElementById('clearButton').classList.add('disabled');
   document.getElementById('playButton').classList.add('disabled');
   document.getElementById('pauseButton').classList.remove('disabled');
   document.getElementById('stopButton').classList.remove('disabled');
   const timeSigNumerator = document.getElementById('timeSigNumerator').value;
   const timeSigDenominator = document.getElementById('timeSigDenominator').value;
   const bpmBase = document.getElementById('bpmBase').value;
   const bpm = parseInt(document.getElementById('bpm').value);
   window.audioAPI.start();
   window.audioAPI.updateTempo(bpmBase, bpm, timeSigNumerator, timeSigDenominator);
   let executionStartTime = window.audioAPI.currentTime;
   for (const chord of document.getElementsByClassName('chord')) {
      let durationSeconds = 0.0;
      const durationList = [], noteList = [];
      for (const noteSelection of chord.querySelectorAll('.note'))
         if (noteSelection.value !== '0') {
            durationList.push(chord.querySelector('.duration').value);
            noteList.push(noteSelection.value);
         }
      for (let i = 0; i < noteList.length; ++i)
         durationSeconds = await window.audioAPI.playNote('defaultTrack', noteList[i], executionStartTime, durationList[i]);
      executionStartTime += durationSeconds;
   }
   while (window.audioAPI.currentTime < executionStartTime)
      await new Promise(res => setTimeout(res, 10));
   window.dispatchEvent(new Event('trackdone'));
}

window.pause = function() {
   window.audioAPI.stop();
   document.getElementById('pauseButton').classList.add('disabled');
   document.getElementById('resumeButton').classList.remove('disabled');
}

window.resume = function() {
   document.getElementById('pauseButton').classList.remove('disabled');
   document.getElementById('resumeButton').classList.add('disabled');
   window.audioAPI.start();
}

window.stop = function() {
   window.audioAPI.stop();
   window.audioAPI.deleteTrack('defaultTrack');
   window.audioAPI.createTrack('defaultTrack');
   window.audioAPI.changeInstrument('defaultTrack', window.instrument);
   window.dispatchEvent(new Event('trackdone'));
}

window.onload = () => {
   window.audioAPI = new WebAudioAPI();
   window.audioAPI.createTrack('defaultTrack');
   const bpmBase = document.getElementById('bpmBase');
   addDurationOptions(bpmBase);
   bpmBase.selectedIndex = 3;
   loadHappyBirthday();
   const instrumentSelector = document.getElementById('instrument');
   instrumentSelector.add(new Option('Choose an instrument'));
   window.audioAPI.availableInstruments.forEach(instrument => instrumentSelector.add(new Option(instrument)));
   window.addEventListener('trackdone', () => {
      document.getElementById('clearButton').classList.remove('disabled');
      document.getElementById('playButton').classList.remove('disabled');
      document.getElementById('pauseButton').classList.add('disabled');
      document.getElementById('resumeButton').classList.add('disabled');
      document.getElementById('stopButton').classList.add('disabled');
   });
};
