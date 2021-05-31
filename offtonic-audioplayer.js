import Player from './lib/Player.js';

import PrototypeNote from './lib/PrototypeNote.js';

class Global {
  constructor() {
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.mspa = 1000.0/this.ctx.sampleRate;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.ctx.audioWorklet.addModule(this.baseHref + 'lib/PrototypeProcessor.js');

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.PrototypeNote = PrototypeNote;
    this.PrototypeNote.o = this;
  }

  // modulePath should be relative to this file's location
  // untested
  addModule(modulePath) {
    this.ctx.audioWorklet.addModule(this.baseHref + modulePath);
  }
}

const global = new Global();

export default global;