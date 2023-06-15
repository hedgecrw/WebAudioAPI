/**
 * Contains all track-specific WebAudioAPI functionality.
 * 
 * @module Track
 */

export function createTrack(name, audioContext, tempo, trackAudioSink) {

   // Track-local variable definitions
   let instrument = null, midiDevice = null;
   const audioSources = [], asyncAudioSources = [], effects = {};
   const audioSink = new GainNode(audioContext), volumeNode = new GainNode(audioContext);
   audioSink.connect(volumeNode).connect(trackAudioSink);

   function createAsyncNote(noteValue, sourceNode, volumeNode) {
      return { noteValue, sourceNode, volumeNode };
   }

   function midiEventReceived(event) {
      if ((event.data[0] & 0xF0) == 0x80) {
         for (const asyncSource of asyncAudioSources)
            if (asyncSource.noteValue == event.data[1]) {
               stopNoteAsync(asyncSource);
               break;
            }
      }
      else if (((event.data[0] & 0xF0) == 0x90) && (event.data[2] > 0))
         playNoteAsync(event.data[1], event.data[2] / 127.0);
   }
   
   function sourceEnded(source, sourceVolume) {
      if (sourceVolume == null)
         sourceVolume = source;
      sourceVolume.disconnect();
      audioSources.splice(audioSources.indexOf(source), 1);
   }

   function updateInstrument(instrumentData) {
      instrument = instrumentData;
   }

   function removeInstrument() {
      instrument = null;
   }

   function updateVolume(percent, updateTime) {
      volumeNode.gain.setValueAtTime(percent, updateTime == null ? audioContext.currentTime : updateTime);
   }
   
   function updateEffect(effectName, effectOptions, percent, updateTime) {
      // TODO: Implement (add if non-existent, else update, if no trackName, then master, effectType = reverb, effectOptions = impulse url)
      // effectOptions = null just updates percent
      // percent = null removes effect
      console.log(name, effectName, effectOptions, percent, updateTime);
   }

   function removeEffectByName(effectName) {
      if (effectName in effects) {
         // TODO: Disconnect from effects graph
         delete effects[effectName];
      }
   }

   function removeEffectByType(effectType) {
      for (const effectName in effects)
         if (effects[effectName].type == effectType) {
            // TODO: Disconnect from effects graph
            delete effects[effectName];
         }
   }

   function stopNoteAsync(noteObject) {
      noteObject.sourceNode.onended = null;
      asyncAudioSources.splice(asyncAudioSources.indexOf(noteObject), 1);
      noteObject.volumeNode.gain.setTargetAtTime(0.0, audioContext.currentTime, 0.03);
      setTimeout(() => {
         noteObject.sourceNode.stop();
         noteObject.volumeNode.disconnect();
      }, 200);
   }

   function playNoteAsync(note, velocity) {
      if (instrument) {
         const noteSource = instrument.getNote(note); // TODO: Method to getNoteContinuous so it loops
         const noteVolume = new GainNode(audioContext);
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(velocity, 0.0);
         const noteStorage = createAsyncNote(note, noteSource, noteVolume);
         noteSource.onended = stopNoteAsync.bind(this, noteStorage); // TODO: Don't need this if continuous instrument
         asyncAudioSources.push(noteStorage);
         noteSource.start(audioContext.currentTime);
         return noteStorage;
      }
      return null;
   }

   function playNote(note, velocity, startTime, duration) {
      if (instrument) {
         const durationSeconds = 60.0 / ((duration / tempo.beatBase) * tempo.beatsPerMinute);
         const noteSource = instrument.getNote(note);
         const noteVolume = new GainNode(audioContext);
         noteSource.connect(noteVolume).connect(audioSink);
         noteVolume.gain.setValueAtTime(velocity, 0.0);
         noteVolume.gain.setTargetAtTime(0.0, startTime + durationSeconds - 0.03, 0.03);
         noteSource.onended = sourceEnded.bind(this, noteSource, noteVolume);
         audioSources.push(noteSource);
         noteSource.start(startTime);
         noteSource.stop(startTime + durationSeconds);
         return durationSeconds;
      }
      return 0;
   }

   async function playClip(buffer, startTime, duration) {
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      const clipSource = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
      audioSources.push(clipSource);
      if (duration) {
         const clipVolume = new GainNode(audioContext);
         clipSource.connect(clipVolume).connect(audioSink);
         clipVolume.gain.setTargetAtTime(0.0, startTime + duration - 0.03, 0.03);
         clipSource.onended = sourceEnded.bind(this, clipSource, clipVolume);
         clipSource.start(startTime, 0, duration);
      }
      else {
         clipSource.connect(audioSink);
         clipSource.onended = sourceEnded.bind(this, clipSource, null);
         clipSource.start(startTime);
      }
      return (duration && (duration < audioBuffer.duration)) ? duration : audioBuffer.duration;
   }

   async function playFile(file, startTime, duration) {
      const response = await fetch(file);
      const arrayBuffer = await response.arrayBuffer();
      return await playClip(arrayBuffer, startTime, duration);
   }

   function connectToMidiDevice(midiInput) {
      midiDevice = midiInput;
      midiDevice.addEventListener('midimessage', midiEventReceived);
      return true;
   }

   function disconnectFromMidiDevice() {
      if (midiDevice != null)
         midiDevice.removeEventListener('midimessage', midiEventReceived);
      midiDevice = null;
   }

   function deleteTrack() {
      for (const source of audioSources)
         source.stop();
      for (const source of asyncAudioSources)
         source.sourceNode.stop();
      volumeNode.disconnect();
   }

   return { name, updateInstrument, removeInstrument, updateVolume, updateEffect, removeEffectByName, removeEffectByType,
      stopNoteAsync, playNoteAsync, playNote, playClip, playFile, connectToMidiDevice, disconnectFromMidiDevice, deleteTrack };
}
