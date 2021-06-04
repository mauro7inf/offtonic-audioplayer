import Player from './lib/Player.js';

import Component from './lib/Component.js';

import AudioComponent from './lib/AudioComponent.js';

import SineOscillator from './lib/generators/SineOscillator.js';

import Tone from './lib/Tone.js';

class Global {
  constructor() {
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.mspa = 1000.0/this.ctx.sampleRate;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.Component = Component;
    this.Component.o = this;

    this.AudioComponent = AudioComponent;

    this.SineOscillator = SineOscillator;
    this.addModule('lib/generators/processors/SineOscillatorProcessor.js');

    this.Tone = Tone;
  }

  // modulePath should be relative to this file's location
  addModule(modulePath) {
    this.ctx.audioWorklet.addModule(this.baseHref + modulePath);
  }
}

const global = new Global();

export default global;