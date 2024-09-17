import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
	input: 'library/webaudioapi/webAudioAPI.src.js',
	output: [
    {
      file: 'build/lib/webAudioAPI.js',
		  format: 'es'
    },
    {
      file: 'build/lib/webAudioAPI.min.js',
		  format: 'iife',
			name: 'version',
			plugins: [terser()]
    }
  ],
  plugins: [
    eslint({
      exclude: [
        'package.json',
        'library/webaudioapi/modules/Constants.mjs',
        'library/webaudioapi/encoders/webm-muxer.min.mjs',
      ],
    }),
    json()
  ]
};
