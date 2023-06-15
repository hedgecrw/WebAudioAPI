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

## Tools
 - New instrument creator: https://hedgecrw.github.io/WebAudioAPI/instrumentcreator
 - Instrument library asset creator: Coming soon

## Future Work

 - [ ] Use Sf3 SoundFont format for instrument storage and loading
 - [ ] Allow importing Sf2, Sf3, Sfz, or raw audio (WAV, OGG, MP3, etc.) formats for instrument creation
 - [ ] Add note looping for sustained notes
 - [ ] Add general modulation parameter for entire instrument
 - [ ] Allow instruments to specify their min/max valid notes (also specify if continuous or decaying)
 - [ ] Add support for reverb, attack, and decay parameters
 - [ ] Import good quality SoundFonts from https://sites.google.com/site/soundfonts4u/

TODO: Finish jsdoc documentation
TODO: Finish Word architecture doc
TODO: Implement MIDI playing example
TODO: Implement proper error handling (Errors.js)
TODO: Add ability to receive callback upon MIDI events received
TODO: Connect MIDI channels to specific tracks??? Requires global MIDI connecting?
