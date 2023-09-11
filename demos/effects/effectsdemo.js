function changeParameter(event) {
   if (window.currentEffect != 'Doppler') {
      event.target.title = event.target.value;
      const effectOptions = { [event.target.name]: event.target.name == 'shape' ? event.target.value : Number(event.target.value) };
      window.audioAPI.updateTrackEffect('defaultTrack', window.currentEffect, effectOptions);
   }
}

function changeFrequencyParameter(event) {
   const effectOptions = { 'frequencyBandUpperCutoffs': [], 'frequencyBandGains': [] };
   for (const target of document.querySelectorAll('input[type=range]')) {
      if (target.name.includes('band'))
         effectOptions['frequencyBandUpperCutoffs'].push(Number(target.value));
      else
         effectOptions['frequencyBandGains'].push(Number(target.value));
      target.title = target.value;
   }
   window.audioAPI.updateTrackEffect('defaultTrack', window.currentEffect, effectOptions);
}

function changeNumFrequencyBands(event) {
   const effectOptionsContainer = document.getElementById('effectOptions');
   if ((1 + (2 * Number(event.target.value))) != effectOptionsContainer.children.length) {
      while (effectOptionsContainer.firstChild)
         effectOptionsContainer.removeChild(effectOptionsContainer.firstChild);
      const effectOptionContainer = document.createElement('tr');
      const labelContainer = document.createElement('td'), valueContainer = document.createElement('td');
      effectOptionContainer.appendChild(labelContainer);
      effectOptionContainer.appendChild(valueContainer);
      effectOptionsContainer.appendChild(effectOptionContainer);
      const optionLabel = document.createElement('label');
      optionLabel.htmlFor = 'numFrequencyBands';
      optionLabel.innerText = 'numFrequencyBands:';
      labelContainer.appendChild(optionLabel);
      const preSpan = document.createElement('span'), postSpan = document.createElement('span');
      preSpan.innerHTML = '&nbsp;'; postSpan.innerHTML = '&nbsp;';
      const optionSelection = document.createElement('select');
      optionSelection.id = 'numFrequencyBands';
      optionSelection.name = 'numFrequencyBands';
      for (let i = 2; i < 10; ++i)
         optionSelection.add(new Option(i, i));
      optionSelection.value = Number(event.target.value);
      optionSelection.addEventListener('change', changeNumFrequencyBands);
      valueContainer.appendChild(preSpan);
      valueContainer.appendChild(optionSelection);
      valueContainer.appendChild(postSpan);
      for (let i = 0; i < 2 * Number(event.target.value); ++i) {
         const integerI = parseInt(i/2);
         const effectOptionContainer = document.createElement('tr');
         const labelContainer = document.createElement('td'), valueContainer = document.createElement('td');
         effectOptionContainer.appendChild(labelContainer);
         effectOptionContainer.appendChild(valueContainer);
         effectOptionsContainer.appendChild(effectOptionContainer);
         const optionLabel = document.createElement('label');
         optionLabel.htmlFor = ((i % 2) == 0) ? ('band' + integerI) : ('gain' + integerI);
         optionLabel.innerText = 'frequencyBand' + (((i % 2) == 0) ? 'UpperCutoff #' : 'Gain #') + (integerI+1) + ':';
         labelContainer.appendChild(optionLabel);
         const optionSelection = document.createElement('input');
         optionSelection.title = ((i % 2) == 0) ? ((integerI+1) * (22050 / Number(event.target.value))) : 0;
         optionSelection.id = ((i % 2) == 0) ? ('band' + integerI) : ('gain' + integerI);
         optionSelection.name = ((i % 2) == 0) ? ('band' + integerI) : ('gain' + integerI);
         optionSelection.type = 'range';
         optionSelection.min = ((i % 2) == 0) ? 1000 : -40;
         optionSelection.max = ((i % 2) == 0) ? 22050 : 40;
         optionSelection.step = 0.001;
         optionSelection.value = ((i % 2) == 0) ? ((integerI+1) * (22050 / Number(event.target.value))) : 0;
         optionSelection.addEventListener('input', changeFrequencyParameter);
         const minValueLabel = document.createElement('span'), maxValueLabel = document.createElement('span');
         minValueLabel.className = 'right';
         minValueLabel.innerHTML = (((i % 2) == 0) ? '0' : '-40') + '&nbsp;';
         maxValueLabel.innerHTML = '&nbsp;' + (((i % 2) == 0) ? '22050' : '40');
         valueContainer.appendChild(minValueLabel);
         valueContainer.appendChild(optionSelection);
         valueContainer.appendChild(maxValueLabel);
      }
   }
}

function changeEffect(effectType) {
   const currentEffectSelection = document.getElementById('effectSelector');
   const effectOptionsContainer = document.getElementById('effectOptions');
   const effectText = currentEffectSelection.options[currentEffectSelection.options.selectedIndex].innerText;
   while (effectOptionsContainer.firstChild)
      effectOptionsContainer.removeChild(effectOptionsContainer.firstChild);
   if (effectText == 'Equalization')
      changeNumFrequencyBands({target: {value: 2}});
   else {
      for (const effectOption of window.audioAPI.getAvailableEffectParameters(effectType)) {
         const effectOptionContainer = document.createElement('tr');
         const labelContainer = document.createElement('td'), valueContainer = document.createElement('td');
         effectOptionContainer.appendChild(labelContainer);
         effectOptionContainer.appendChild(valueContainer);
         effectOptionsContainer.appendChild(effectOptionContainer);
         const optionLabel = document.createElement('label');
         optionLabel.htmlFor = effectOption.name;
         optionLabel.innerText = effectOption.name + ':';
         labelContainer.appendChild(optionLabel);
         if (effectOption.type == 'number') {
            const optionSelection = document.createElement('input');
            optionSelection.title = effectOption.defaultValue;
            optionSelection.id = effectOption.name;
            optionSelection.name = effectOption.name;
            optionSelection.type = 'range';
            optionSelection.min = effectOption.validValues[0];
            optionSelection.max = effectOption.validValues[1];
            optionSelection.step = 0.001;
            optionSelection.value = effectOption.defaultValue;
            optionSelection.addEventListener('input', changeParameter);
            const minValueLabel = document.createElement('span'), maxValueLabel = document.createElement('span');
            minValueLabel.className = 'right';
            minValueLabel.innerHTML = effectOption.validValues[0] + '&nbsp;';
            maxValueLabel.innerHTML = '&nbsp;' + effectOption.validValues[1];
            valueContainer.appendChild(minValueLabel);
            valueContainer.appendChild(optionSelection);
            valueContainer.appendChild(maxValueLabel);
         }
         else if (effectOption.type == 'string') {
            const preSpan = document.createElement('span'), postSpan = document.createElement('span');
            preSpan.innerHTML = '&nbsp;'; postSpan.innerHTML = '&nbsp;';
            const optionSelection = document.createElement('select');
            optionSelection.id = effectOption.name;
            optionSelection.name = effectOption.name;
            for (const value of effectOption.validValues)
               optionSelection.add(new Option(value, value));
            optionSelection.value = effectOption.defaultValue;
            optionSelection.addEventListener('change', changeParameter);
            valueContainer.appendChild(preSpan);
            valueContainer.appendChild(optionSelection);
            valueContainer.appendChild(postSpan);
         }
      }
   }
   if (effectText == 'Doppler') {
      const effectOptionContainer = document.createElement('tr');
      const buttonContainer = document.createElement('td');
      effectOptionContainer.appendChild(buttonContainer);
      const applyButton = document.createElement('button');
      applyButton.textContent = 'Apply';
      applyButton.onclick = function() {
         const effectOptions = {};
         for (const target of document.querySelectorAll('input')) {
            effectOptions[target.name] = Number(target.value);
            target.title = target.value;
         }
         window.audioAPI.updateTrackEffect('defaultTrack', window.currentEffect, effectOptions);
      };
      buttonContainer.appendChild(applyButton);
      effectOptionsContainer.appendChild(effectOptionContainer);
   }
   if (window.playing) {
      window.audioAPI.removeTrackEffect('defaultTrack', window.currentEffect);
      window.currentEffect = effectText;
      window.audioAPI.applyTrackEffect('defaultTrack', window.currentEffect, currentEffectSelection.value);
   }
}

window.play = async function() {
   window.playing = true;
   window.audioAPI.start();
   window.audioAPI.createTrack('defaultTrack');
   document.getElementById('playButton').classList.add('disabled');
   document.getElementById('stopButton').classList.remove('disabled');
   const currentEffectSelection = document.getElementById('effectSelector');
   window.currentEffect = currentEffectSelection.options[currentEffectSelection.options.selectedIndex].innerText;
   window.audioAPI.applyTrackEffect('defaultTrack', currentEffect, currentEffectSelection.value);
   let executionStartTime = window.audioAPI.getCurrentTime();
   while (window.playing) {
      executionStartTime += await window.audioAPI.playFile('defaultTrack', 'audioclip/PianoLoop.mp3', executionStartTime);
      while (window.playing && (window.audioAPI.getCurrentTime() + 0.2 < executionStartTime))
         await new Promise(res => setTimeout(res, 10));
   }
   window.audioAPI.removeAllTracks();
   window.audioAPI.stop();
}

window.stop = function() {
   document.getElementById('playButton').classList.remove('disabled');
   document.getElementById('stopButton').classList.add('disabled');
   window.playing = false;
}

window.onload = () => {
   window.playing = false;
   window.audioAPI = new WebAudioAPI();
   const availableEffects = window.audioAPI.getAvailableEffects();
   for (const effect in availableEffects)
      effectSelector.add(new Option(effect.match(/[A-Z][a-z]+/g).join(' '), availableEffects[effect]));
   changeEffect(document.getElementById('effectSelector').value);
};
