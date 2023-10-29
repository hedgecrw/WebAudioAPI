function addDurationOptions(durationElement) {
   const durations = window.audioAPI.getAvailableNoteDurations();
   for (const duration in durations)
      durationElement.add(new Option((duration + 'Note').match(/[A-Z][a-z]+/g).join(' '), durations[duration]));
}

function addNoteOptions(noteElement) {
   const notes = window.audioAPI.getAvailableNotes();
   for (const note in notes) {
      const text = (note == 'Rest') ? note : (note.slice(0, 2) + ((note[2] == 's') ? '♯' : (note[2] == 'b') ? '♭' : '') + ((note[3] == 's') ? '♯' : (note[3] == 'b') ? '♭' : ''));
      noteElement.add(new Option(text, notes[note]));
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
      durationSelection.value = duration;
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
   const durations = window.audioAPI.getAvailableNoteDurations();
   addChord(null, durations.Half, ['D4']);
   addChord(null, durations.Quarter, ['D4']);
   addChord(null, durations.DottedHalf, ['E4', 'G2']);
   addChord(null, durations.DottedHalf, ['D4', 'B3', 'D3']);
   addChord(null, durations.DottedHalf, ['G4', 'B3', 'D3']);
   addChord(null, durations.DottedWhole, ['F4♯', 'D3']);
   addChord(null, durations.Half, ['D4', 'A2']);
   addChord(null, durations.Quarter, ['D4']);
   addChord(null, durations.DottedHalf, ['E4', 'D2']);
   addChord(null, durations.DottedHalf, ['D4', 'A3', 'F3♯']);
   addChord(null, durations.DottedHalf, ['A4', 'A3', 'F3♯']);
   addChord(null, durations.DottedWhole, ['G4', 'G2']);
   addChord(null, durations.Half, ['D4']);
   addChord(null, durations.Quarter, ['D4']);
   addChord(null, durations.DottedHalf, ['D5', 'G2']);
   addChord(null, durations.DottedHalf, ['B4', 'B3', 'D3']);
   addChord(null, durations.DottedHalf, ['G4', 'B3', 'D3']);
   addChord(null, durations.DottedHalf, ['F4♯', 'C3']);
   addChord(null, durations.DottedWhole, ['E4', 'C4']);
   addChord(null, durations.Half, ['C5']);
   addChord(null, durations.Quarter, ['C5']);
   addChord(null, durations.DottedHalf, ['B4', 'D3']);
   addChord(null, durations.DottedHalf, ['G4', 'A3', 'F4♯']);
   addChord(null, durations.DottedHalf, ['A4', 'A3', 'F4♯']);
   addChord(null, durations.DottedWhole, ['G4', 'G3', 'G2']);
}

window.changeInstrument = async function() {
   const instrumentSelector = document.getElementById('instrument');
   const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
   if (instrumentSelector.selectedIndex > 0) {
      document.getElementById('status').textContent = 'Loading...';
      await window.audioAPI.updateInstrument('defaultTrack', instrumentSelection);
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
   window.playing = true;
   await window.audioAPI.start();
   document.getElementById('clearButton').classList.add('disabled');
   document.getElementById('playButton').classList.add('disabled');
   document.getElementById('pauseButton').classList.remove('disabled');
   document.getElementById('stopButton').classList.remove('disabled');
   const timeSigNumerator = document.getElementById('timeSigNumerator').value;
   const timeSigDenominator = document.getElementById('timeSigDenominator').value;
   const bpmBase = document.getElementById('bpmBase').value;
   const bpm = parseInt(document.getElementById('bpm').value);
   window.audioAPI.updateTempo(bpmBase, bpm, timeSigNumerator, timeSigDenominator);
   let executionStartTime = window.audioAPI.getCurrentTime();
   for (const chord of document.getElementsByClassName('chord')) {
      let durationSeconds = 0.0;
      const durationList = [], noteList = [];
      for (const noteSelection of chord.querySelectorAll('.note')) {
         durationList.push(chord.querySelector('.duration').value);
         noteList.push(noteSelection.value);
      }
      for (let i = 0; i < noteList.length; ++i)
         durationSeconds = await window.audioAPI.playNote('defaultTrack', noteList[i], executionStartTime, durationList[i]);
      executionStartTime += durationSeconds;
   }
   while (window.playing && window.audioAPI.getCurrentTime() < executionStartTime)
      await new Promise(res => setTimeout(res, 10));
   window.dispatchEvent(new Event('trackdone'));
}

window.pause = function() {
   window.audioAPI.stop();
   document.getElementById('pauseButton').classList.add('disabled');
   document.getElementById('resumeButton').classList.remove('disabled');
}

window.resume = async function() {
   document.getElementById('pauseButton').classList.remove('disabled');
   document.getElementById('resumeButton').classList.add('disabled');
   await window.audioAPI.start();
}

window.stop = async function() {
   window.playing = false;
   window.audioAPI.clearTrack('defaultTrack');
   const instrumentSelector = document.getElementById('instrument');
   await window.audioAPI.updateInstrument('defaultTrack', instrumentSelector.options[instrumentSelector.selectedIndex].value);
}

window.startRecord = function() {
   document.getElementById('startRecordButton').classList.add('disabled');
   document.getElementById('stopRecordButton').classList.remove('disabled');
   window.audioData = window.audioAPI.recordOutput();
}

window.stopRecord = async function() {
   await window.audioData.finalize();
   const encodingTypes = window.audioAPI.getAvailableEncoders();
   document.getElementById('startRecordButton').classList.remove('disabled');
   document.getElementById('stopRecordButton').classList.add('disabled');
   const encodedBlob = await window.audioData.getEncodedData(encodingTypes.WAV);
   const link = document.createElement('a');
   link.download = 'AudioOutput.wav';
   link.href = URL.createObjectURL(encodedBlob);
   link.click();
   URL.revokeObjectURL(link.href);
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
   window.addEventListener('trackdone', () => {
      window.audioAPI.stop();
      document.getElementById('clearButton').classList.remove('disabled');
      document.getElementById('playButton').classList.remove('disabled');
      document.getElementById('pauseButton').classList.add('disabled');
      document.getElementById('resumeButton').classList.add('disabled');
      document.getElementById('stopButton').classList.add('disabled');
   });
   window.audioAPI.getAvailableInstruments('../instruments').then(instruments => instruments.forEach(instrument => instrumentSelector.add(new Option(instrument))));
};
