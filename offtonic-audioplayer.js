import classRegistry from './lib/ClassRegistry.js';

import Player from './lib/Player.js';

import Component from './lib/Component.js';

import AudioComponent from './lib/AudioComponent.js';

import ConstantGenerator from './lib/generators/ConstantGenerator.js';
import SineOscillator from './lib/generators/SineOscillator.js';

import Tone from './lib/Tone.js';

class Global {
  constructor() {
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.classRegistry = classRegistry;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.addModule('lib/MultiplierProcessor.js');

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.Component = Component;
    this.Component.o = this;
    this.classRegistry.register('Component', Component);

    this.AudioComponent = AudioComponent;
    this.classRegistry.register('AudioComponent', AudioComponent);

    this.ConstantGenerator = ConstantGenerator;
    this.classRegistry.register('ConstantGenerator', ConstantGenerator);
    this.SineOscillator = SineOscillator;
    this.addModule('lib/generators/processors/SineOscillatorProcessor.js');
    this.classRegistry.register('SineOscillator', SineOscillator);

    this.Tone = Tone;
    this.classRegistry.register('Tone', Tone);
  }

  // modulePath should be relative to this file's location
  addModule(modulePath) {
    this.ctx.audioWorklet.addModule(this.baseHref + modulePath);
  }

  createComponent(properties) {
    return this.Component.create(properties);
  }
}

const global = new Global();

export default global;