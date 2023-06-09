# WebAudioAPI
Javascript library to generate music using the Web Audio API

## Current Library
 - Single-file ECMAScript module: https://hedgecrw.github.io/WebAudioAPI/lib/webAudioAPI.js
 - Minified single-file ECMAScript module: https://hedgecrw.github.io/WebAudioAPI/lib/webAudioAPI.min.js
 - Full instrument library: https://hedgecrw.github.io/WebAudioAPI/lib/webAudioAPI-instruments.tgz

## API Documentation

 - https://hedgecrw.github.io/WebAudioAPI/WebAudioAPI.html

## Demos
 - Live piano demo: https://hedgecrw.github.io/WebAudioAPI/piano
 - Score creation demo: https://hedgecrw.github.io/WebAudioAPI/score
 - NetsBlox emulation demo: https://hedgecrw.github.io/WebAudioAPI/netsblox
 - MIDI device demo: https://hedgecrw.github.io/WebAudioAPI/midi
 - Effects manipulation demo: https://hedgecrw.github.io/WebAudioAPI/effects

## Tools
 - New instrument creator: https://hedgecrw.github.io/WebAudioAPI/instrumentcreator
 - Instrument library asset creator: Coming soon

## Future Work

 - [ ] Implement proper error handling (Errors.js)
 - [ ] Allow instruments to specify their min/max valid notes
 - [ ] Allow instruments to specify if continuous or decaying
 - [ ] Add note looping for sustained notes if continuous instrument
 - [ ] Add general modulation parameter for entire instrument
 - [ ] Add instrument support for reverb, attack, and decay parameters
 - [ ] Use Midi.mjs module to make library fully "General MIDI 2" compliant
 - [ ] Allow for connect MIDI channels to specific tracks
 - [ ] Implement instrument library asset creator
 - [ ] Implement Effects: Chorus, Delay, Distortion, Echo, Equalization, Flanger, Phaser, Reverb, Tremolo, Vibrato
 - [ ] Use Sf3 SoundFont format for instrument storage and loading
 - [ ] Allow importing Sf2, Sf3, Sfz, or raw audio (WAV, OGG, MP3, etc.) formats for instrument creation
 - [ ] Import good quality SoundFonts from https://sites.google.com/site/soundfonts4u/
 - [ ] For all effects, add parameter to allow effect to slowly take effect (setTargetAtTime)

 - [ ] Enumerate input/output devices, choose device to use for AudioContext or for recording
 - [ ] Create async recordClip(startTime, duration) to record to AudioBuffer (either can be null), resolves to buffer when done, always records with no effects so that playback with effects can be used immediately (don't want to double-down existing effects)
 - [ ] Create exportClip(clip, format, samplingRate) to export an AudioBuffer to a file
 - [ ] Create startAndExport() to mimic start() on AudioContext, except that it also streams to an AudioBuffer until stop() is called
 - [ ] Create export() to mimic start(), except that exporting is done as quickly as possible and nothing comes out of speakers (requires knowing when to stop???)
 - [ ] Add recordMidiClip()/playMidiClip()/exportMidiClip() to encompass playing back something in Gabe's format
