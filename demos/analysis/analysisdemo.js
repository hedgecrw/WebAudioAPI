window.onload = () => {
   window.audioAPI = new WebAudioAPI();
   window.audioAPI.createTrack('defaultTrack');
   document.getElementById("status").textContent = 'Loading instrument...';
   const midiDeviceSelector = document.getElementById('device');
   midiDeviceSelector.add(new Option('Choose a MIDI device'));
   window.audioAPI.getAvailableMidiDevices().then(devices => devices.forEach(device => midiDeviceSelector.add(new Option(device))));
   window.audioAPI.getAvailableInstruments('../instruments').then(() => {
      window.audioAPI.updateInstrument('defaultTrack', 'Grand Piano').then(() => {
         document.getElementById("status").textContent = 'Awaiting MIDI device selection...';
      });
   });
   const waveformCanvas = document.getElementById('waveform');
   const spectrumCanvas = document.getElementById('spectrum');
   const powerCanvas = document.getElementById('power');
   const waveformCanvasContext = waveformCanvas.getContext("2d");
   const spectrumCanvasContext = spectrumCanvas.getContext("2d");
   const powerCanvasContext = powerCanvas.getContext("2d");
   waveformCanvasContext.fillStyle = "rgb(200, 200, 200)";
   waveformCanvasContext.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
   spectrumCanvasContext.fillStyle = "rgb(0, 0, 0)";
   spectrumCanvasContext.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
   powerCanvasContext.fillStyle = "rgb(220, 220, 220)";
   powerCanvasContext.fillRect(0, 0, powerCanvas.width, powerCanvas.height);
};

function updateWaveform() {
   requestAnimationFrame(updateWaveform);
   const waveformCanvas = document.getElementById('waveform');
   const waveformCanvasContext = waveformCanvas.getContext("2d");
   const analysisTypes = window.audioAPI.getAvailableAnalysisTypes();
   const waveform = window.audioAPI.analyzeAudio(analysisTypes['TimeSeries'], 'defaultTrack');
   waveformCanvasContext.fillStyle = "rgb(200, 200, 200)";
   waveformCanvasContext.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
   waveformCanvasContext.lineWidth = 2;
   waveformCanvasContext.strokeStyle = "rgb(0, 0, 0)";
   waveformCanvasContext.beginPath();
   const sliceWidth = waveformCanvas.width / waveform.length;
   for (let i = 0, x = 0; i < waveform.length; ++i, x += sliceWidth) {
      const y = ((waveform[i] / 128.0) * waveformCanvas.height) / 2;
      if (i === 0)
         waveformCanvasContext.moveTo(x, y);
      else
         waveformCanvasContext.lineTo(x, y);
   }
   waveformCanvasContext.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
   waveformCanvasContext.stroke();
}

function updateSpectrum() {
   requestAnimationFrame(updateSpectrum);
   const spectrumCanvas = document.getElementById('spectrum');
   const spectrumCanvasContext = spectrumCanvas.getContext("2d");
   const analysisTypes = window.audioAPI.getAvailableAnalysisTypes();
   const spectrum = window.audioAPI.analyzeAudio(analysisTypes['PowerSpectrum'], 'defaultTrack');
   spectrumCanvasContext.fillStyle = "rgb(0, 0, 0)";
   spectrumCanvasContext.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
   const barWidth = (spectrumCanvas.width / spectrum.length) * 2.5;
   for (let i = 0, x = 0; i < spectrum.length; ++i, x += barWidth + 1) {
      spectrumCanvasContext.fillStyle = `rgb(${spectrum[i] + 100}, 50, 50)`;
      spectrumCanvasContext.fillRect(x, spectrumCanvas.height - spectrum[i], barWidth, spectrum[i]);
   }
}

function updatePower() {
   requestAnimationFrame(updatePower);
   const powerCanvas = document.getElementById('power');
   const powerCanvasContext = powerCanvas.getContext("2d");
   const analysisTypes = window.audioAPI.getAvailableAnalysisTypes();
   const power = window.audioAPI.analyzeAudio(analysisTypes['TotalPower']);
   powerCanvasContext.fillStyle = "rgb(0, 0, 0)";
   powerCanvasContext.fillRect(0, 0, powerCanvas.width, powerCanvas.height);
}

function changeMidiDevice() {
   window.audioAPI.start();
   const deviceSelector = document.getElementById('device');
   document.getElementById("status").textContent = 'Connecting to MIDI device...';
   const deviceSelection = deviceSelector.options[deviceSelector.selectedIndex].value;
   if (deviceSelector.selectedIndex > 0)
      window.audioAPI.connectMidiDeviceToTrack('defaultTrack', deviceSelection).then(() => {
         document.getElementById("status").textContent = 'Connected';
         updateWaveform();
         updateSpectrum();
         updatePower();
      });
}
