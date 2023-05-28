import { Instrument } from './Instrument.js';

export function createTrack(audioAPI, name, trackAudioSink) {

   // Track-local variable definitions
   let instrument = null;
   const audioSources = [], asyncAudioSources = [];
   const audioSink = audioAPI.audioContext.createDelay(1);
   const volumeControlSync = audioAPI.audioContext.createGain();
   const volumeControlAsync = audioAPI.audioContext.createGain();
   const panningControlSync = audioAPI.audioContext.createStereoPanner();
   const panningControlAsync = audioAPI.audioContext.createStereoPanner();
   audioSink.connect(volumeControlSync)
            .connect(panningControlSync)
            .connect(volumeControlAsync)
            .connect(panningControlAsync)
            .connect(trackAudioSink);
   audioSink.delayTime.setValueAtTime(0.0, 0.0);
   panningControlSync.pan.setValueAtTime(0.0, 0.0);
   panningControlAsync.pan.setValueAtTime(0.0, 0.0);
   volumeControlSync.gain.setValueAtTime(1.0, 0.0);
   volumeControlAsync.gain.setValueAtTime(1.0, 0.0);

   function createAsyncNote(sourceNode, volumeNode) {
      return { sourceNode, volumeNode }
   }
   
   function sourceEnded(source, sourceVolume) {
      if (sourceVolume == null)
         sourceVolume = source;
      sourceVolume.disconnect();
      audioSources.splice(audioSources.indexOf(source), 1);
   }

   function instrumentName() {
      return instrument?.name;
   }

   async function changeInstrument(instrumentName, instrumentUrl) {
      if (instrument?.name != instrumentName)
         instrument = await Instrument.loadInstrument(audioAPI.audioContext, instrumentName, instrumentUrl)
   }

   function updateVolume(percent, updateTime) {
      if (updateTime == null)
         volumeControlAsync.gain.setTargetAtTime(percent, audioAPI.audioContext.currentTime, 0.01);
      else
         volumeControlSync.gain.setTargetAtTime(percent, updateTime, 0.01);
   }

   function updatePanning(percent, updateTime) {
      if (updateTime == null)
         panningControlAsync.pan.setTargetAtTime((2 * percent) - 1, audioAPI.audioContext.currentTime, 0.01);
      else
         panningControlSync.pan.setTargetAtTime((2 * percent) - 1, updateTime, 0.01);
   }

   function stopNoteAsync(noteObject) {
      asyncAudioSources.splice(asyncAudioSources.indexOf(noteObject), 1);
      noteObject.volumeNode.gain.setTargetAtTime(0.0, audioAPI.audioContext.currentTime, 0.1);
      setTimeout(function() {
         noteObject.sourceNode.stop();
         noteObject.volumeNode.disconnect();
      }, 200);
   }

   function playNoteAsync(note) {
      if (instrument) {
         const noteSource = instrument.getNote(audioAPI.audioContext, note); // TODO: Method to getNoteContinuous so it loops
         const noteVolume = audioAPI.audioContext.createGain();
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(1.0, 0.0);
         const noteStorage = createAsyncNote(noteSource, noteVolume);
         noteSource.onended = stopNoteAsync.bind(this, noteStorage); // TODO: Don't need this if continuous instrument
         asyncAudioSources.push(noteStorage);
         noteSource.start(audioAPI.audioContext.currentTime);
         return noteStorage;
      }
      return null;
   }

   function playNote(note, startTime, duration) {
      if (instrument) {
         const durationSeconds = 60.0 / ((duration / audioAPI.beatBase) * audioAPI.beatsPerMinute);
         const noteSource = instrument.getNote(audioAPI.audioContext, note);
         const noteVolume = audioAPI.audioContext.createGain();
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(1.0, 0.0);
         noteVolume.gain.setTargetAtTime(0.0, startTime + durationSeconds - 0.1, 0.1);
         noteSource.onended = sourceEnded.bind(this, noteSource, noteVolume);
         audioSources.push(noteSource);
         noteSource.start(startTime);
         noteSource.stop(startTime + durationSeconds);
         return durationSeconds;
      }
      return 0;
   }

   async function playClip(buffer, startTime) {
      const audioBuffer = await audioAPI.audioContext.decodeAudioData(buffer);
      const clipSource = audioAPI.audioContext.createBufferSource();
      clipSource.buffer = audioBuffer;
      clipSource.connect(audioSink);
      clipSource.onended = sourceEnded.bind(this, clipSource, null);
      audioSources.push(clipSource);
      clipSource.start(startTime);
      return audioBuffer.duration;
   }

   async function playFile(file, startTime) {
      const response = await fetch(file);
      const arrayBuffer = await response.arrayBuffer();
      return await playClip(arrayBuffer, startTime);
   }

   function deleteTrack() {
      for (const source of audioSources)
         source.stop();
      for (const source of asyncAudioSources)
         source.sourceNode.stop();
      panningControlAsync.disconnect();
   }

   return { name, instrumentName, changeInstrument, updateVolume, updatePanning,
      playNote, playFile, playClip, playNoteAsync, stopNoteAsync, deleteTrack };
}
