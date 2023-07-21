function changeParameter(event) {
   const effectOptions = { [event.target.name]: Number(event.target.value) };
   window.audioAPI.updateTrackEffect('defaultTrack', window.currentEffect, effectOptions);
}

function changeEffect(effectType) {
   const effectOptionsContainer = document.getElementById('effectOptions');
   while (effectOptionsContainer.firstChild)
      effectOptionsContainer.removeChild(effectOptionsContainer.firstChild);
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
      else {
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
   if (window.playing) {
      const currentEffectSelection = document.getElementById('effectSelector');
      window.audioAPI.removeTrackEffect('defaultTrack', window.currentEffect);
      window.currentEffect = currentEffectSelection.options[currentEffectSelection.options.selectedIndex].innerText;
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
