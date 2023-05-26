export class Effect {

    constructor(name) {
        this.name = name;
    }

   async #load(audioContext, url) {
      console.log('Loading effect:', this.name + '...');
      const response = await fetch(url);
      const resource = await response.arrayBuffer();
      const effect = audioContext.createConvolver();
      effect.buffer = await audioContext.decodeAudioData(resource);
      effect.loop = false;
      effect.normalize = true;
   }

    static async loadEffect(audioContext, name, url) {
      const effect = new Effect(name);
      await effect.#load(audioContext, url);
      return effect;
   }
}
