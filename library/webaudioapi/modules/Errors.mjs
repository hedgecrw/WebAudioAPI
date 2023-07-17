/**
 * Module containing all {@link WebAudioAPI} error functionality.
 * 
 * @module Errors
 */

export class WebAudioMidiError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioMidiError';
   }
}

export class WebAudioDeviceError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioDeviceError';
   }
}

export class WebAudioEffectError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioEffectError';
   }
}
