/**
 * Module containing all {@link WebAudioAPI} error functionality.
 * 
 * @module Errors
 */

export class WebAudioNotImplementedError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioNotImplementedError';
   }
}

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

export class WebAudioTargetError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioTargetError';
   }
}

export class WebAudioValueError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioValueError';
   }
}

export class WebAudioTrackError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioTrackError';
   }
}

export class WebAudioRecordingError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioRecordingError';
   }
}

export class WebAudioInstrumentError extends Error {
   constructor(message) {
      super(message);
      this.name = 'WebAudioInstrumentError';
   }
}
