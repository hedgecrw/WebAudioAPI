function changeMidiDevice() {
   const deviceSelector = document.getElementById('device');
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   if (deviceSelector.selectedIndex > 0)
      window.audioAPI.connectMidiDeviceToTrack('defaultTrack', deviceSelection).then(() => {
         document.getElementById("status").textContent = 'Connected';
         console.log('Connected to MIDI device!');
      });
}

function changeAudioInputDevice() {
   const deviceSelector = document.getElementById('input');
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   if (deviceSelector.selectedIndex > 0)
      window.audioAPI.connectAudioInputDeviceToTrack('defaultTrack', deviceSelection).then(() => {
         document.getElementById("status").textContent = 'Connected';
         console.log('Connected to audio input device!');
      });
}

function changeInstrument() {
   const instrumentSelector = document.getElementById('instrument');
   const instrumentSelection = instrumentSelector.options[instrumentSelector.selectedIndex].value;
   if (instrumentSelector.selectedIndex > 0) {
      window.audioAPI.start();
      document.getElementById("status").textContent = 'Loading...';
      window.audioAPI.updateInstrument('defaultTrack', instrumentSelection).then(() => {
         document.getElementById("status").textContent = 'Ready';
         console.log('Instrument loading complete!');
      });
   }
}

window.onload = () => {
   window.audioAPI = new WebAudioAPI();
   window.audioAPI.createTrack('defaultTrack');
   const deviceSelector = document.getElementById('device');
   deviceSelector.add(new Option('Choose a MIDI device'));
   const instrumentSelector = document.getElementById('instrument');
   instrumentSelector.add(new Option('Choose an instrument'));
   const inputSelector = document.getElementById('input');
   inputSelector.add(new Option('Choose an audio input device'));
   window.audioAPI.getAvailableInstruments('../instruments').then(instruments => instruments.forEach(instrument => instrumentSelector.add(new Option(instrument))));
   window.audioAPI.getAvailableMidiDevices().then(devices => devices.forEach(device => deviceSelector.add(new Option(device))));
   window.audioAPI.getAvailableAudioInputDevices().then(devices => devices.forEach(device => inputSelector.add(new Option(device))));
};
