class LoopBlock {
   constructor(element) {
      this.element = element;
   }
   loopEnabled() {
      return this.element.checked;
   }
}

class ChordBlock {
   constructor(durationElement, noteElements) {
      this.durationElement = durationElement;
      this.noteElements = noteElements;
   }
   getDuration() {
      return this.durationElement.value;
   }
   getNotes() {
      return this.noteElements.filter(element => element.value != '0').map(element => element.value);
   }
   async loadBlock(api, trackName) { return; }
   async runBlock(api, trackName, executionStartTime) {
      let durationSeconds = 0.0;
      for (const note of this.getNotes())
         durationSeconds = await api.playNote(trackName, note, executionStartTime, this.getDuration());
      return executionStartTime + durationSeconds;
   }
}

class ClipBlock {
   constructor(element) {
      this.element = element;
      this.audioBuffer = null;
   }
   clipFileName() {
      return this.element.value;
   }
   async loadBlock(api, trackName) {
      const response = await fetch(this.clipFileName());
      this.audioBuffer = await response.arrayBuffer();
   }
   async runBlock(api, trackName, executionStartTime) {
      let durationSeconds = await api.playClip(trackName, this.audioBuffer.slice(0), executionStartTime);
      return executionStartTime + durationSeconds;
   }
}

class EffectBlock {
   constructor(effectElement, valueElement) {
      this.effectElement = effectElement;
      this.valueElement = valueElement;
   }
   effectName() {
      return this.effectElement.options[this.effectElement.selectedIndex].text;
   }
   effectType() {
      return this.effectElement.value;
   }
   effectValue() {
      return this.valueElement.value;
   }
   async loadBlock(api, trackName) {
      await api.applyTrackEffect(trackName, this.effectName(), this.effectType());
   }
   async runBlock(api, trackName, executionStartTime) {
      await api.updateTrackEffect(trackName, this.effectName(), null, 0.01 * this.effectValue(), executionStartTime);
      return executionStartTime;
   }
}

class InstrumentBlock {
   constructor(element) {
      this.instrumentElement = element;
   }
   instrumentName() {
      return this.instrumentElement.value;
   }
   async loadBlock(api, trackName) {
      await api.updateInstrument(trackName, this.instrumentName());
   }
   async runBlock(api, trackName, executionStartTime) {
      api.updateInstrument(trackName, this.instrumentName());
      return executionStartTime;
   }
}

class NetsBloxAudioScript {
   constructor(scriptID, scriptElements, audioAPI) {

      // Initialize the script-local variables
      audioAPI.createTrack(scriptID);
      const effectTypes = audioAPI.getAvailableEffects();
      //audioAPI.applyTrackEffect(scriptID, 'Reverb', effectTypes.Reverb);
      audioAPI.applyTrackEffect(scriptID, 'Panning', effectTypes.Panning);
      audioAPI.applyTrackEffect(scriptID, 'Volume', effectTypes.Volume);
      this.trackName = scriptID;
      this.audioAPI = audioAPI;
      this.scriptID = scriptID;
      this.scriptElements = [];
      this.isRunning = false;
      this.loopBlock = null;

      // Parse the relevant Script Blocks and add them to a sorted array
      for (const child of scriptElements) {
         if (child.classList.contains('loop')) {
            for (const loopChild of child.children)
               if (loopChild.type == 'checkbox')
                  this.loopBlock = new LoopBlock(loopChild);
         }
         else if (child.classList.contains('instrument')) {
            for (const instrumentChild of child.children)
               if (instrumentChild.tagName.toLowerCase() == 'select')
                  this.scriptElements.push(new InstrumentBlock(instrumentChild));
         }
         else if (child.classList.contains('chord')) {
            let notes = [];
            let duration = null;
            for (const chordChild of child.children) {
               if (chordChild.className == 'duration')
                  duration = chordChild;
               else if (chordChild.className == 'note')
                  notes.push(chordChild);
            }
            this.scriptElements.push(new ChordBlock(duration, notes));
         }
         else if (child.classList.contains('effect')) {
            let effectType = null;
            let effectValue = null;
            for (const effectChild of child.children) {
               if (effectChild.className == 'duration')
                  effectType = effectChild;
               else if (effectChild.className == 'value')
                  effectValue = effectChild;
            }
            this.scriptElements.push(new EffectBlock(effectType, effectValue));
         }
         else if (child.classList.contains('clip')) {
            for (const clipChild of child.children) {
               if (clipChild.className == 'duration')
                  this.scriptElements.push(new ClipBlock(clipChild));
            }
         }
      }
   }

   stop() {
      this.isRunning = false;
      this.audioAPI.removeTrack(this.trackName);
   }

   async load() {
      for (const scriptElement of this.scriptElements)
         await scriptElement.loadBlock(this.audioAPI, this.trackName);
   }

   async * start() {
      this.isRunning = true;
      let executionStartTime = this.audioAPI.getCurrentTime();
      while (this.isRunning) {
         for (const scriptElement of this.scriptElements)
            if (this.isRunning) {
               executionStartTime = await scriptElement.runBlock(this.audioAPI, this.trackName, executionStartTime);
               while (this.audioAPI.getCurrentTime() + 0.1 < executionStartTime)
                  yield;
            }
         this.isRunning = this.isRunning && this.loopBlock && this.loopBlock.loopEnabled();
      }
   }
}

class NetsBloxEmulator {
   constructor(audioAPI) {
      this.scripts = {};
      this.isRunning = false;
      this.audioAPI = audioAPI;
   }

   addScript(netsBloxScript) {
      this.scripts[netsBloxScript.scriptID] = netsBloxScript;
   }
   removeScript(scriptID) {
      if (scriptID in this.scripts) {
         this.scripts[scriptID].stop();
         delete this.scripts[scriptID];
      }
   }
   clearScripts() {
      for (const script in this.scripts)
         this.scripts[script].stop();
      this.scripts = {};
      this.stop();
   }

   async play() {
      this.isRunning = true;
      const loadPromises = [];
      for (const script in this.scripts)
         loadPromises.push(this.scripts[script].load())
      await Promise.all(loadPromises);

      const scripts = [];
      for (const script in this.scripts)
         scripts.push(this.scripts[script].start())
      await this.audioAPI.start();
      while (this.isRunning && scripts.length) {
         for (let i = scripts.length - 1; i >= 0; --i)
            if (this.isRunning && (await scripts[i].next())['done'])
               scripts.splice(i, 1);
         await new Promise(res => setTimeout(res, 10));
      }
      window.dispatchEvent(new Event('audiodone'));
   }

   async resume() {
      await this.audioAPI.start();
   }

   pause() {
      this.audioAPI.stop();
   }

   stop() {
      this.isRunning = false;
      this.audioAPI.removeAllTracks();
   }
}

window.NetsBloxEmulator = NetsBloxEmulator;
window.NetsBloxAudioScript = NetsBloxAudioScript;
