import { InstrumentEncodingType } from './Constants.mjs';
import { createInstrument } from './InstrumentCreator.mjs';

function displayResult(label, message, isError) {
   if (isError)
      document.getElementById('resultLabel').classList.add('error');
   else
      document.getElementById('resultLabel').classList.remove('error');
   document.getElementById('resultLabel').innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;' + label;
   document.getElementById('result').innerHTML = message;
   for (const element of document.querySelectorAll('.hidden'))
      element.classList.remove('hidden');
}

window.formatChanged = () => {
   document.getElementById('bitRate').disabled = (document.getElementById('format').value == InstrumentEncodingType.PCM);
};

window.generateInstrument = async () => {
   window.generationErrors = [];
   const instrumentName = document.getElementById('instrumentName').value;
   const fileList = document.getElementById('noteFiles').files;
   const sampleRate = Number(document.getElementById('sampleRate').value);
   const bitRate = Number(document.getElementById('bitRate').value);
   const format = Number(document.getElementById('format').value);
   const minNote = Number(document.getElementById('minNote').value);
   const maxNote = Number(document.getElementById('maxNote').value);
   const decays = document.getElementById('decays').checked;
   if (instrumentName.length < 3)
      displayResult('Error:', 'Ensure that you have entered a valid instrument name!', true);
   else if (fileList.length < 1)
      displayResult('Error:', 'Ensure that you have selected at least 1 audio file!', true);
   else {
      displayResult('Progress:', 'Generating instrument...', false);
      const instrumentData = await createInstrument(instrumentName, fileList, sampleRate, bitRate, format, minNote, maxNote, decays);
      if (window.generationErrors.length > 0) {
         for (const error of window.generationErrors)
           displayResult(error.tag, error.value, true);
      }
      else if (!instrumentData)
         displayResult('Unknown Error:', 'Unable to generate instrument data!', true);
      else {
         const fileName = instrumentName.replace(/[^A-Z0-9]+/ig, "_").toLowerCase() + '.inst';
         const url = URL.createObjectURL(new Blob([instrumentData], { 'type': 'application/octet-stream' }));
         displayResult('Download Link:', '<a href="'+url+'" download="'+fileName+'">'+fileName+'</a>', false);
      }
   }
};

window.onload = () => {
   window.generationErrors = [];
   window.addEventListener('webaudioapi_error', event => window.generationErrors.push(event.detail));
};
