class AsyncNoteStorage {
   constructor(sourceNode, volumeNode) {
      this.sourceNode = sourceNode;
      this.volumeNode = volumeNode;
   }
}

export class Track {
   #audioSources = [];
   #asyncAudioSources = [];
   
   constructor(audioAPI, trackName, audioSink) {
      this.name = trackName;
      this.audioAPI = audioAPI;
      this.audioContext = audioAPI.audioContext;
      this.audioSink = this.audioContext.createDelay(1);
      this.volumeControlSync = this.audioContext.createGain();
      this.volumeControlAsync = this.audioContext.createGain();
      this.panningControlSync = this.audioContext.createStereoPanner();
      this.panningControlAsync = this.audioContext.createStereoPanner();
      this.audioSink.connect(this.volumeControlSync)
                    .connect(this.panningControlSync)
                    .connect(this.volumeControlAsync)
                    .connect(this.panningControlAsync)
                    .connect(audioSink);
      this.audioSink.delayTime.setValueAtTime(0.0, 0.0);
      this.panningControlSync.pan.setValueAtTime(0.0, 0.0);
      this.panningControlAsync.pan.setValueAtTime(0.0, 0.0);
      this.volumeControlSync.gain.setValueAtTime(1.0, 0.0);
      this.volumeControlAsync.gain.setValueAtTime(1.0, 0.0);
      this.instrument = null;
   }

   get instrumentName() {
      return (this.instrument == null) ? 'None' : this.instrument.name;
   }

   #sourceEnded(source, sourceVolume) {
      if (sourceVolume == null)
         sourceVolume = source;
      sourceVolume.disconnect();
      this.#audioSources.splice(this.#audioSources.indexOf(source), 1);
   }

   changeInstrument(instrument) {
      this.instrument = instrument;
   }

   updateVolume(percent, updateTime) {
      if (updateTime == null)
         this.volumeControlAsync.gain.setTargetAtTime(percent, this.audioContext.currentTime, 0.01);
      else
         this.volumeControlSync.gain.setTargetAtTime(percent, updateTime, 0.01);
   }

   updatePanning(percent, updateTime) {
      if (updateTime == null)
         this.panningControlAsync.pan.setTargetAtTime((2 * percent) - 1, this.audioContext.currentTime, 0.01);
      else
         this.panningControlSync.pan.setTargetAtTime((2 * percent) - 1, updateTime, 0.01);
   }

   playNoteAsync(note) {
      const noteSource = this.instrument.getNote(this.audioContext, note); // TODO: Method to getNoteContinuous so it loops
      const noteVolume = this.audioContext.createGain();
      noteSource.connect(noteVolume).connect(this.audioSink);
      noteVolume.gain.setValueAtTime(1.0, 0.0);
      const noteStorage = new AsyncNoteStorage(noteSource, noteVolume);
      noteSource.onended = this.stopNoteAsync.bind(this, noteStorage);
      this.#asyncAudioSources.push(noteStorage);
      noteSource.start(this.audioContext.currentTime);
      return noteStorage;
   }

   stopNoteAsync(noteObject) {
      this.#asyncAudioSources.splice(this.#asyncAudioSources.indexOf(noteObject), 1);
      noteObject.volumeNode.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0.1);
      setTimeout(function() {
         noteObject.sourceNode.stop();
         noteObject.volumeNode.disconnect();
      }, 200);
   }

   playNote(note, startTime, duration) {
      const durationSeconds = 60.0 / ((duration / this.audioAPI.beatBase) * this.audioAPI.beatsPerMinute);
      const noteSource = this.instrument.getNote(this.audioContext, note);
      const noteVolume = this.audioContext.createGain();
      noteSource.connect(noteVolume).connect(this.audioSink);
      noteVolume.gain.setValueAtTime(1.0, 0.0);
      noteVolume.gain.setTargetAtTime(0.0, startTime + durationSeconds - 0.1, 0.1);
      noteSource.onended = this.#sourceEnded.bind(this, noteSource, noteVolume);
      this.#audioSources.push(noteSource);
      noteSource.start(startTime);
      noteSource.stop(startTime + durationSeconds);
      return durationSeconds;
   }

   async playClip(buffer, startTime) {
      const audioBuffer = await this.audioContext.decodeAudioData(buffer);
      const clipSource = this.audioContext.createBufferSource();
      clipSource.buffer = audioBuffer;
      clipSource.connect(this.audioSink);
      clipSource.onended = this.#sourceEnded.bind(this, clipSource, null);
      this.#audioSources.push(clipSource);
      clipSource.start(startTime);
      return audioBuffer.duration;
   }

   async playFile(file, startTime) {
      const response = await fetch(file);
      const arrayBuffer = await response.arrayBuffer();
      return await this.playClip(arrayBuffer, startTime);
   }

   delete() {
      for (const source of this.#audioSources)
         source.stop();
      for (const source in this.#asyncAudioSources)
         source.sourceNode.stop();
      if (this.panningControlAsync != null)
         this.panningControlAsync.disconnect();
      this.instrument = this.panningControlSync = this.panningControlAsync = null;
      this.audioSink = this.volumeControlSync = this.volumeControlAsync = null;
   }
}
