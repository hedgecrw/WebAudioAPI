const durations = {
   'Whole Note': Duration.Whole,  'Dotted Whole Note': Duration.DottedWhole, 'Double Dotted Whole Note': Duration.DottedDottedWhole,
   'Half Note': Duration.Half, 'Dotted Half Note': Duration.DottedHalf, 'Double Dotted Half Note': Duration.DottedDottedHalf,
   'Quarter Note': Duration.Quarter, 'Dotted Quarter Note': Duration.DottedQuarter, 'Double Dotted Quarter Note': Duration.DottedDottedQuarter,
   '8th Note': Duration.Eighth, 'Dotted 8th Note': Duration.DottedEighth, 'Double Dotted 8th Note': Duration.DottedDottedEighth,
   '16th Note': Duration.Sixteenth, 'Dotted 16th Note': Duration.DottedSixteenth, 'Double Dotted 16th Note': Duration.DottedDottedSixteenth
};

const guitar_clips = {
   'Guitar Clip 1': 'audioclips/HIPHOP_DUSTYGUITAR_001.wav', 'Guitar Clip 2': 'audioclips/HIPHOP_DUSTYGUITAR_002.wav'
};

const drum_clips = {
   'Drums Clip 1': 'audioclips/HIPHOP_DUSTYPERCUSSION_001.wav', 'Drums Clip 2': 'audioclips/HIPHOP_DUSTYPERCUSSION_002.wav', 'Drums Clip 3': 'audioclips/HIPHOP_DUSTYPERCUSSION_003.wav'
};

const effects = {
   'Volume': Effect.Volume, 'Panning': Effect.Panning, 'Reverb': Effect.Reverb
};

function addDurationOptions(durationElement) {
   for (let duration in durations)
      durationElement.add(new Option(duration, durations[duration]));
}

function addClipOptions(clipElement, clips) {
   for (let clip in clips)
      clipElement.add(new Option(clip, clips[clip]));
}

function addEffectOptions(effectElement) {
   for (let effect in effects)
      effectElement.add(new Option(effect, effects[effect]));
}

function addNoteOptions(noteElement) {
   noteElement.add(new Option('None', 0));
   for (let note in Note) {
      let text = note.slice(0, 2) + ((note[2] == 's') ? '♯' : (note[2] == 'b') ? '♭' : '') + ((note[3] == 's') ? '♯' : (note[3] == 'b') ? '♭' : '');
      noteElement.add(new Option(text, Note[note]));
   }
}

function addChord(element, itemIndex, duration, notes) {
   const chordElement = document.createElement('div');
   const chordLabel = document.createElement('span');
   chordLabel.innerHTML = '<b>Play:</b>';
   chordElement.className = 'chord';
   const durationLabel = document.createElement('label');
   durationLabel.htmlFor = 'duration' + itemIndex.toString();
   durationLabel.innerText = 'Duration:';
   const durationSelection = document.createElement('select');
   durationSelection.className = 'duration';
   durationSelection.id = 'duration' + itemIndex.toString();
   durationSelection.name = 'duration' + itemIndex.toString();
   addDurationOptions(durationSelection);
   chordElement.appendChild(chordLabel);
   chordElement.appendChild(durationLabel);
   chordElement.appendChild(durationSelection);
   if (duration)
      durationSelection.selectedIndex = Object.keys(durations).indexOf(duration);
   for (let i = 1; i <= 3; ++i) {
      const noteLabel = document.createElement('label');
      noteLabel.htmlFor = 'note' + itemIndex.toString() + '_' + i.toString();
      noteLabel.innerText = 'Note ' + i.toString() + ':';
      const noteSelection = document.createElement('select');
      noteSelection.className = 'note';
      noteSelection.id = 'note' + itemIndex.toString() + '_' + i.toString();
      noteSelection.name = 'note' + itemIndex.toString() + '_' + i.toString();
      addNoteOptions(noteSelection);
      chordElement.appendChild(noteLabel);
      chordElement.appendChild(noteSelection);
      if (notes && notes[i-1])
         noteSelection.selectedIndex = Array.apply(null, noteSelection.options).map((option) => option.text).indexOf(notes[i-1]);
   }
   const addChordButton = document.createElement('div');
   addChordButton.id = 'addChord';
   addChordButton.onclick = function(_element) { addChord(element, window.pianoItemIndex++, null, null) };
   chordElement.appendChild(addChordButton);
   element.appendChild(chordElement);
}

function addClip(element, itemIndex, clipName, clips) {
   const clipElement = document.createElement('div');
   const chordLabel = document.createElement('span');
   chordLabel.innerHTML = '<b>Play:</b>';
   clipElement.className = 'clip';
   const clipLabel = document.createElement('label');
   clipLabel.htmlFor = 'clip' + itemIndex.toString();
   clipLabel.innerText = 'Clip:';
   const clipSelection = document.createElement('select');
   clipSelection.className = 'duration';
   clipSelection.id = 'clip' + itemIndex.toString();
   clipSelection.name = 'clip' + itemIndex.toString();
   addClipOptions(clipSelection, clips);
   clipElement.appendChild(chordLabel);
   clipElement.appendChild(clipLabel);
   clipElement.appendChild(clipSelection);
   if (clipName)
      clipSelection.selectedIndex = Object.keys(clips).indexOf(clipName);
   const addClipButton = document.createElement('div');
   addClipButton.id = 'addChord';
   addClipButton.onclick = function(_element) { addClip(element, itemIndex++, null, clips) };
   clipElement.appendChild(addClipButton);
   element.appendChild(clipElement);
}

function addEffect(element, itemIndex, effectName, value) {
   const effectElement = document.createElement('div');
   const chordLabel = document.createElement('span');
   chordLabel.innerHTML = '<b>Adjust:</b>';
   effectElement.className = 'clip effect';
   const effectLabel = document.createElement('label');
   effectLabel.htmlFor = 'effect' + itemIndex.toString();
   effectLabel.innerText = 'Effect:';
   const effectSelection = document.createElement('select');
   effectSelection.className = 'duration';
   effectSelection.id = 'effect' + itemIndex.toString();
   effectSelection.name = 'effect' + itemIndex.toString();
   const effectValueLabel = document.createElement('label');
   effectValueLabel.htmlFor = 'effectValue' + itemIndex.toString();
   effectValueLabel.innerText = 'Value:';
   const effectValue = document.createElement('input');
   effectValue.className = 'value';
   effectValue.type = 'number';
   effectValue.id = 'effectValue' + itemIndex.toString();
   effectValue.name = 'effectValue' + itemIndex.toString();
   effectValue.min = 0;
   effectValue.max = 100;
   effectValue.value = value;
   addEffectOptions(effectSelection);
   effectElement.appendChild(chordLabel);
   effectElement.appendChild(effectLabel);
   effectElement.appendChild(effectSelection);
   effectElement.appendChild(effectValueLabel);
   effectElement.appendChild(effectValue);
   if (effectName)
      effectSelection.selectedIndex = Object.keys(effects).indexOf(effectName);
   const addClipButton = document.createElement('div');
   addClipButton.id = 'addChord';
   addClipButton.onclick = function(_element) { addClip(element, window.guitarItemIndex++, null, guitar_clips) };
   effectElement.appendChild(addClipButton);
   element.appendChild(effectElement);
}

function loadPianoScript() {
   window.pianoItemIndex = 0;
   const instrumentSelector = document.getElementById('piano_instrument');
   addChord(document.getElementById('piano_script'), window.pianoItemIndex++, 'Quarter Note', ['D4']);
   addChord(document.getElementById('piano_script'), window.pianoItemIndex++, 'Quarter Note', ['D4']);
   addChord(document.getElementById('piano_script'), window.pianoItemIndex++, 'Quarter Note', ['D4']);
   addChord(document.getElementById('piano_script'), window.pianoItemIndex++, 'Quarter Note', ['D4']);
   window.audioAPI.availableInstruments.forEach(instrument => instrumentSelector.add(new Option(instrument)));
}

function loadGuitarScript() {
   window.guitarItemIndex = 0;
   addClip(document.getElementById('guitar_script'), window.guitarItemIndex++, 'Guitar Clip 1', guitar_clips);
   addEffect(document.getElementById('guitar_script'), window.guitarItemIndex++, 'Volume', 25);
   addClip(document.getElementById('guitar_script'), window.guitarItemIndex++, 'Guitar Clip 2', guitar_clips);
   addEffect(document.getElementById('guitar_script'), window.guitarItemIndex++, 'Volume', 100);
}

function loadDrumsScript() {
   window.drumsItemIndex = 0;
   addClip(document.getElementById('drums_script'), window.drumsItemIndex++, 'Drums Clip 1', drum_clips);
   addClip(document.getElementById('drums_script'), window.drumsItemIndex++, 'Drums Clip 2', drum_clips);
   addClip(document.getElementById('drums_script'), window.drumsItemIndex++, 'Drums Clip 3', drum_clips);
}

window.play = function() {
   if (document.getElementById('piano_enabled').checked)
      window.netsbloxEmulator.addScript(new NetsBloxAudioScript('Piano', document.getElementById('piano_script').children, window.audioAPI));
   if (document.getElementById('guitar_enabled').checked)
      window.netsbloxEmulator.addScript(new NetsBloxAudioScript('Guitar', document.getElementById('guitar_script').children, window.audioAPI));
   if (document.getElementById('drums_enabled').checked)
      window.netsbloxEmulator.addScript(new NetsBloxAudioScript('Drums', document.getElementById('drums_script').children, window.audioAPI));
   document.getElementById('play_button').setAttribute('disabled', 'disabled');
   document.getElementById('resume_button').setAttribute('disabled', 'disabled');
   document.getElementById('pause_button').removeAttribute('disabled');
   document.getElementById('stop_button').removeAttribute('disabled');
   window.netsbloxEmulator.play();
}

window.resume = function() {
   document.getElementById('resume_button').setAttribute('disabled', 'disabled');
   document.getElementById('pause_button').removeAttribute('disabled');
   window.netsbloxEmulator.resume();
}

window.pause = function() {
   document.getElementById('resume_button').removeAttribute('disabled');
   document.getElementById('pause_button').setAttribute('disabled', 'disabled');
   window.netsbloxEmulator.pause();
}

window.stop = function() {
   document.getElementById('play_button').removeAttribute('disabled');
   document.getElementById('resume_button').setAttribute('disabled', 'disabled');
   document.getElementById('pause_button').setAttribute('disabled', 'disabled');
   document.getElementById('stop_button').setAttribute('disabled', 'disabled');
   window.netsbloxEmulator.clearScripts();
}

window.onload = () => {
   window.audioAPI = new WebAudioAPI();
   const bpmBase = document.getElementById('bpm_base');
   const bpm = document.getElementById('bpm');
   const timeSigNumerator = document.getElementById('time_signature_numerator');
   const timeSigDenominator = document.getElementById('time_signature_denominator');

   addDurationOptions(bpmBase);
   bpmBase.selectedIndex = 6;
   loadPianoScript();
   loadGuitarScript();
   loadDrumsScript();

   window.addEventListener('audiodone', window.stop);
   
   document.getElementById('piano_enabled').addEventListener('change', () => { window.netsbloxEmulator.removeScript('Piano'); });
   document.getElementById('guitar_enabled').addEventListener('change', () => { window.netsbloxEmulator.removeScript('Guitar'); });
   document.getElementById('drums_enabled').addEventListener('change', () => { window.netsbloxEmulator.removeScript('Drums'); });
   document.getElementById('master_volume').addEventListener('input', (e) => { window.audioAPI.updateVolume(0.01 * e.target.value); });
   document.getElementById('master_panning').addEventListener('input', (e) => { window.audioAPI.updatePanning(0.01 * e.target.value); });
   document.getElementById('master_reverb').addEventListener('input', (e) => { window.audioAPI.updateReverb(0.01 * e.target.value); });
   document.getElementById('piano_volume').addEventListener('input', (e) => { window.audioAPI.updateTrackVolume('Piano', 0.01 * e.target.value); });
   document.getElementById('piano_panning').addEventListener('input', (e) => { window.audioAPI.updateTrackPanning('Piano', 0.01 * e.target.value); });
   document.getElementById('piano_reverb').addEventListener('input', (e) => { window.audioAPI.updateTrackReverb('Piano', 0.01 * e.target.value); });
   document.getElementById('guitar_volume').addEventListener('input', (e) => { window.audioAPI.updateTrackVolume('Guitar', 0.01 * e.target.value); });
   document.getElementById('guitar_panning').addEventListener('input', (e) => { window.audioAPI.updateTrackPanning('Guitar', 0.01 * e.target.value); });
   document.getElementById('guitar_reverb').addEventListener('input', (e) => { window.audioAPI.updateTrackReverb('Guitar', 0.01 * e.target.value); });
   document.getElementById('drums_volume').addEventListener('input', (e) => { window.audioAPI.updateTrackVolume('Drums', 0.01 * e.target.value); });
   document.getElementById('drums_panning').addEventListener('input', (e) => { window.audioAPI.updateTrackPanning('Drums', 0.01 * e.target.value); });
   document.getElementById('drums_reverb').addEventListener('input', (e) => { window.audioAPI.updateTrackReverb('Drums', 0.01 * e.target.value); });
   timeSigNumerator.addEventListener('change', () => { window.audioAPI.updateTempo(bpmBase.value, bpm.value, timeSigNumerator.value, timeSigDenominator.value); });
   timeSigDenominator.addEventListener('change', () => { window.audioAPI.updateTempo(bpmBase.value, bpm.value, timeSigNumerator.value, timeSigDenominator.value); });
   bpmBase.addEventListener('change', () => { window.audioAPI.updateTempo(bpmBase.value, bpm.value, timeSigNumerator.value, timeSigDenominator.value); });
   bpm.addEventListener('change', () => { window.audioAPI.updateTempo(bpmBase.value, bpm.value, timeSigNumerator.value, timeSigDenominator.value); });

   window.audioAPI.updateTempo(bpmBase.value, bpm.value, timeSigNumerator.value, timeSigDenominator.value);
   window.netsbloxEmulator = new NetsBloxEmulator(window.audioAPI);
};
