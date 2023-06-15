/**
 * Contains all WebAudioAPI error functionality.
 * 
 * @module Errors
 */

export class MidiError extends Error {
   constructor(message) {
      super(message);
      this.name = 'MidiError';
   }
}
