function changeMidiDevice() {
   const deviceSelector = document.getElementById('device');
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   if (deviceSelector.selectedIndex > 0)
      window.audioAPI.connectMidiDeviceToTrack('defaultTrack', deviceSelection).then(() => {
         document.getElementById("status").textContent = 'Connected';
         document.getElementById("status").style.color = 'black';
         console.log('Connected to MIDI device!');
      });
}

function changeAudioInputDevice() {
   const deviceSelector = document.getElementById('input');
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   if (deviceSelector.selectedIndex > 0)
      window.audioAPI.connectAudioInputDeviceToTrack('defaultTrack', deviceSelection).then(() => {
         document.getElementById("status").textContent = 'Connected';
         document.getElementById("status").style.color = 'black';
         console.log('Connected to audio input device!');
      });
   else
      window.audioAPI.disconnectAudioInputDeviceFromTrack('defaultTrack');
}

function changeAudioOutputDevice() {
   const deviceSelector = document.getElementById('output');
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   window.audioAPI.selectAudioOutputDevice(deviceSelection).then(() => {
      document.getElementById("status").textContent = 'Connected';
      document.getElementById("status").style.color = 'black';
      console.log('Connected to audio output device!');
   });
}

function changeInstrument() {
   const instrumentSelector = document.getElementById('instrument');
   const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
   if (instrumentSelector.selectedIndex > 0) {
      window.audioAPI.start();
      document.getElementById("status").textContent = 'Loading...';
      document.getElementById("status").style.color = 'black';
      window.audioAPI.updateInstrument('defaultTrack', instrumentSelection).then(() => {
         document.getElementById("status").textContent = 'Ready';
         document.getElementById("status").style.color = 'black';
         console.log('Instrument loading complete!');
      });
   }
}

function startRecordMidi() {
   document.getElementById('startMidiButton').setAttribute('disabled', 'disabled');
   document.getElementById('stopMidiButton').removeAttribute('disabled');
   document.getElementById('playMidiButton').setAttribute('disabled', 'disabled');
   document.getElementById('exportMidiButton').setAttribute('disabled', 'disabled');
   try {
      if (document.getElementById('midiDuration').value > 0) {
         window.midiClip = window.audioAPI.recordMidiClip('defaultTrack', window.audioAPI.getCurrentTime() + Number(document.getElementById('midiStartOffset').value), document.getElementById('midiDuration').value);
         window.midiClip.notifyWhenComplete(stopRecordMidi);
      }
      else
         window.midiClip = window.audioAPI.recordMidiClip('defaultTrack', window.audioAPI.getCurrentTime() + Number(document.getElementById('midiStartOffset').value));
   }
   catch (err) {
      document.getElementById('startMidiButton').removeAttribute('disabled');
      document.getElementById('stopMidiButton').setAttribute('disabled', 'disabled');
      document.getElementById('playMidiButton').setAttribute('disabled', 'disabled');
      document.getElementById('exportMidiButton').setAttribute('disabled', 'disabled');
      document.getElementById("status").textContent = err.message;
      document.getElementById("status").style.color = 'red';
   }
}

function stopRecordMidi() {
   document.getElementById('startMidiButton').removeAttribute('disabled');
   document.getElementById('stopMidiButton').setAttribute('disabled', 'disabled');
   document.getElementById('playMidiButton').removeAttribute('disabled');
   document.getElementById('exportMidiButton').removeAttribute('disabled');
   if (window.midiClip)
      window.midiClip.finalize();
}

function playMidi() {
   if (window.midiClip)
      window.audioAPI.playClip('defaultTrack', window.midiClip, window.audioAPI.getCurrentTime())
}

async function exportMidi() {
   const encodingTypes = window.audioAPI.getAvailableEncoders();
   if (window.midiClip) {
      const encodedBlob = await window.midiClip.getEncodedData(encodingTypes.WAV);
      const link = document.createElement('a');
      link.download = 'RecordedMidiClip.wav';
      link.href = URL.createObjectURL(encodedBlob);
      link.click();
      URL.revokeObjectURL(link.href);
   }
}

function startRecordAudio() {
   document.getElementById('startAudioButton').setAttribute('disabled', 'disabled');
   document.getElementById('stopAudioButton').removeAttribute('disabled');
   document.getElementById('playAudioButton').setAttribute('disabled', 'disabled');
   document.getElementById('exportAudioButton').setAttribute('disabled', 'disabled');
   try {
      if (document.getElementById('audioDuration').value > 0) {
         window.audioClip = window.audioAPI.recordAudioClip('defaultTrack', window.audioAPI.getCurrentTime() + Number(document.getElementById('audioStartOffset').value), document.getElementById('audioDuration').value);
         window.audioClip.notifyWhenComplete(stopRecordAudio);
      }
      else
         window.audioClip = window.audioAPI.recordAudioClip('defaultTrack', window.audioAPI.getCurrentTime() + Number(document.getElementById('audioStartOffset').value));
   }
   catch (err) {
      document.getElementById('startAudioButton').removeAttribute('disabled');
      document.getElementById('stopAudioButton').setAttribute('disabled', 'disabled');
      document.getElementById('playAudioButton').setAttribute('disabled', 'disabled');
      document.getElementById('exportAudioButton').setAttribute('disabled', 'disabled');
      document.getElementById("status").textContent = err.message;
      document.getElementById("status").style.color = 'red';
   }
}

function stopRecordAudio() {
   document.getElementById('startAudioButton').removeAttribute('disabled');
   document.getElementById('stopAudioButton').setAttribute('disabled', 'disabled');
   document.getElementById('playAudioButton').removeAttribute('disabled');
   document.getElementById('exportAudioButton').removeAttribute('disabled');
   if (window.audioClip)
      window.audioClip.finalize();
}

function playAudio() {
   if (window.audioClip)
      window.audioAPI.playClip('defaultTrack', window.audioClip, window.audioAPI.getCurrentTime())
}

async function exportAudio() {
   const encodingTypes = window.audioAPI.getAvailableEncoders();
   if (window.audioClip) {
      const encodedBlob = await window.audioClip.getEncodedData(encodingTypes.WAV);
      const link = document.createElement('a');
      link.download = 'RecordedAudioClip.wav';
      link.href = URL.createObjectURL(encodedBlob);
      link.click();
      URL.revokeObjectURL(link.href);
   }
}

window.onload = () => {
   window.midiClip = window.audioClip = null;
   window.audioAPI = new WebAudioAPI();
   window.audioAPI.createTrack('defaultTrack');
   const midiDeviceSelector = document.getElementById('device');
   midiDeviceSelector.add(new Option('Choose a MIDI device'));
   const instrumentSelector = document.getElementById('instrument');
   instrumentSelector.add(new Option('Choose an instrument'));
   const inputSelector = document.getElementById('input');
   inputSelector.add(new Option('Choose an audio input device'));
   const outputSelector = document.getElementById('output');
   window.audioAPI.getAvailableInstruments('../instruments').then(instruments => instruments.forEach(instrument => instrumentSelector.add(new Option(instrument))));
   window.audioAPI.getAvailableMidiDevices().then(devices => devices.forEach(device => midiDeviceSelector.add(new Option(device))));
   window.audioAPI.getAvailableAudioInputDevices().then(devices => devices.forEach(device => inputSelector.add(new Option(device))));
   window.audioAPI.getAvailableAudioOutputDevices().then(devices => devices.forEach(device => outputSelector.add(new Option(device))));
};
