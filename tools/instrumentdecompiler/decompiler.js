import { InstrumentEncodingType } from './Constants.mjs';
import { decompileInstrument } from './InstrumentDecompiler.mjs';

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

window.decompileInstrument = async () => {
   window.decompilationErrors = [];
   const instrumentFiles = document.getElementById('instrumentFile').files;
   if (instrumentFiles.length < 1)
      displayResult('Error:', 'Ensure that you have selected a valid instrument file!', true);
   else {
      displayResult('Progress:', 'Decompiling instrument...', false);
      const [audioData, metadata] = await decompileInstrument(instrumentFiles[0]);
      if (window.decompilationErrors.length > 0)
         displayResult('Decompilation Errors:', window.generationErrors, true);
      else if (!audioData)
         displayResult('Unknown Error:', 'Unable to decompile instrument data!', true);
      else {
         const url = URL.createObjectURL(audioData);
         const fileName = instrumentFiles[0].name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase() + '.zip';
         displayResult('Download Link:', '<a href="'+url+'" download="'+fileName+'">'+fileName+'</a>', false);
         document.getElementById('instrumentName').innerHTML = metadata.name;
         document.getElementById('fileVersion').innerHTML = metadata.version.join('.');
         document.getElementById('audioEncoding').innerHTML = (metadata.format == InstrumentEncodingType.PCM) ? "PCM" : "Webm/Opus";
         document.getElementById('sampleRate').innerHTML = metadata.sampleRate;
         document.getElementById('bitRate').innerHTML = metadata.bitRate;
         document.getElementById('minValidNote').innerHTML = metadata.minValidNote;
         document.getElementById('maxValidNote').innerHTML = metadata.maxValidNote;
         document.getElementById('sustainedDecays').innerHTML = metadata.sustainedNotesDecay ? "true" : "false";
         for (const element of document.querySelectorAll('.hidden2'))
            element.classList.remove('hidden2');
      }
   }
};

window.onload = () => {
   window.decompilationErrors = [];
   window.addEventListener('webaudioapi_error', event => window.decompilationErrors.push(event.detail));
};
