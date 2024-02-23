import { EncoderBase } from './EncoderBase.mjs';

/**
 * Class containing all WAV file encoding functionality.
 * @extends EncoderBase
 */
export class WavFileEncoder extends EncoderBase {

   /**
    * Constructs a new {@link WavFileEncoder} object.
    */
   constructor() {
      super();
   }

   async encode(audioData) {
      // Code taken from https://russellgood.com/how-to-convert-audiobuffer-to-audio-file/
      const numChannels = audioData.numberOfChannels, length = audioData.length * numChannels * 2 + 44;
      const buffer = new ArrayBuffer(length), channels = [];
      const view = new DataView(buffer);
      let offset = 0, pos = 0;

      // Nested helper functions
      function setUint16(data) {
         view.setUint16(pos, data, true);
         pos += 2;
      }

      function setUint32(data) {
         view.setUint32(pos, data, true);
         pos += 4;
      }

      // Write WAVE header
      setUint32(0x46464952);                              // "RIFF"
      setUint32(length - 8);                              // file length - 8
      setUint32(0x45564157);                              // "WAVE"

      setUint32(0x20746d66);                              // "fmt " chunk
      setUint32(16);                                      // length = 16
      setUint16(1);                                       // PCM (uncompressed)
      setUint16(numChannels);
      setUint32(audioData.sampleRate);
      setUint32(audioData.sampleRate * 2 * numChannels);  // avg. bytes/sec
      setUint16(numChannels * 2);                         // block-align
      setUint16(16);                                      // 16-bit (hardcoded in this demo)

      setUint32(0x61746164);                              // "data" - chunk
      setUint32(length - pos - 4);                        // chunk length

      // Write interleaved data
      for (let i = 0; i < audioData.numberOfChannels; ++i)
         channels.push(audioData.getChannelData(i));
      while (pos < length) {
         for (let i = 0; i < numChannels; ++i) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));          // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;    // scale to 16-bit signed int
            view.setInt16(pos, sample, true);                                     // write 16-bit sample
            pos += 2;
         }
         ++offset;                                                                // next source sample
      }
      return new Blob([view.buffer], { type: 'audio/wav' });
   }
}
