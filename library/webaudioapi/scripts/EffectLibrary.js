const reverbEffectList = {
    'Hall 1': jsPath.replace(/\/$/, '') + '/webaudioapi/effects/impulses/hall1.wav',
    'Hall 2': jsPath.replace(/\/$/, '') + '/webaudioapi/effects/impulses/hall2.wav'
 }
 
 export function getAvailableReverbEffects() { 
    return Object.keys(reverbEffectList);
}

 export async function loadEffect(audioContext, effectName) {
   let reverbEffect = null;
   if (effectName in reverbEffectList) {
      const response = await fetch(reverbEffectList[effectName]);
      const resource = await response.arrayBuffer();
      reverbEffect = audioContext.createConvolver();
      reverbEffect.buffer = await audioContext.decodeAudioData(resource);
      reverbEffect.loop = false;
      reverbEffect.normalize = true;
   }
   return reverbEffect;
 }
