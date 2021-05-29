class Global {
  constructor() {
    // global context stuff
    this.audioCtx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.mspa = 1000.0/this.audioCtx.sampleRate;
  }
}

const global = new Global();

export default global;