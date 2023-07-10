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

export class WebAudioEffectError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioEffectError';
   }
}
