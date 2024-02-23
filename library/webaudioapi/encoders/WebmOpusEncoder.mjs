import { EncoderBase } from './EncoderBase.mjs';
import { Muxer, ArrayBufferTarget } from './webm-muxer.min.mjs';

/**
 * Class containing all Webm/Opus encoding functionality.
 * @extends EncoderBase
 */
export class WebmOpusEncoder extends EncoderBase {

   /**
    * Constructs a new {@link WebmOpusEncoder} object.
    */
   constructor() {
      super();
   }

   async encode(audioData, encodingOptions) {
      const webmMuxer = new Muxer({
         target: new ArrayBufferTarget(),
         audio: { codec: 'A_OPUS', numberOfChannels: 1, sampleRate: audioData.sampleRate }
      });
      const audioInputData = new ArrayBuffer(4 * audioData.numberOfChannels * audioData.length);
      const audioInputDataFloats = new Float32Array(audioInputData);
      for (let ch = 0; ch < audioData.numberOfChannels; ++ch)
         audioInputDataFloats.set(audioData.getChannelData(ch), ch * audioData.length);
      const audioInput = new AudioData({ format: 'f32-planar',
                                        sampleRate: audioData.sampleRate,
                                        numberOfFrames: audioData.length,
                                        numberOfChannels: audioData.numberOfChannels,
                                        timestamp: 0,
                                        data: audioInputData,
                                        transfer: [audioInputData] });
      const bitRate = (encodingOptions && ('bitRate' in encodingOptions)) ? encodingOptions.bitRate : 96000;
      const audioEncoder = new AudioEncoder({ output: (chunk, meta) => webmMuxer.addAudioChunk(chunk, meta), error: e => console.error(e) });
      audioEncoder.configure({ codec: 'opus', sampleRate: audioData.sampleRate, numberOfChannels: 1, bitrate: bitRate });
      audioEncoder.encode(audioInput);
      await audioEncoder.flush();
      audioEncoder.close();
      webmMuxer.finalize();
      return new Blob([webmMuxer.target.buffer], { type: 'audio/webm;codecs=opus' });
   }
}
