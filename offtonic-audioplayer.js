import classRegistry from './lib/ClassRegistry.js';

import Player from './lib/Player.js';

import Component from './lib/Component.js';
import AudioComponent from './lib/AudioComponent.js';
import Playable from './lib/Playable.js';

import ConstantGenerator from './lib/generators/ConstantGenerator.js';
import SineOscillator from './lib/generators/SineOscillator.js';

import Envelope from './lib/envelopes/Envelope.js';
import ADSREnvelope from './lib/envelopes/ADSREnvelope.js';

import Tone from './lib/Tone.js';

class Global {
  constructor() {
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.classRegistry = classRegistry;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.Component = Component;
    this.Component.o = this;
    this.classRegistry.register('Component', Component);
    this.AudioComponent = AudioComponent;
    this.classRegistry.register('AudioComponent', AudioComponent);
    this.Playable = Playable;
    this.classRegistry.register('Playable', Playable);

    this.ConstantGenerator = ConstantGenerator;
    this.classRegistry.register('ConstantGenerator', ConstantGenerator);
    this.SineOscillator = SineOscillator;
    this.addModule('lib/processors/SineOscillatorProcessor.js');
    this.classRegistry.register('SineOscillator', SineOscillator);

    this.Envelope = Envelope;
    this.addModule('lib/processors/EnvelopeProcessor.js');
    this.classRegistry.register('Envelope', Envelope);
    this.ADSREnvelope = ADSREnvelope;
    this.addModule('lib/processors/ADSREnvelopeProcessor.js');
    this.classRegistry.register('ADSREnvelope', ADSREnvelope);

    this.Tone = Tone;
    this.addModule('lib/processors/ToneProcessor.js');
    this.classRegistry.register('Tone', Tone);
  }

  // modulePath should be relative to this file's location
  addModule(modulePath) {
    this.ctx.audioWorklet.addModule(this.baseHref + modulePath);
  }

  createComponent(properties, player) {
    if (player === null || player === undefined) {
      player = this.player;
    }
    return this.Component.create(properties, player);
  }
}

const global = new Global();

export default global;