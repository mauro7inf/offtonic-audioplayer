import classRegistry from './lib/ClassRegistry.js';
import orchestra from './lib/Orchestra.js';

import Player from './lib/Player.js';

import Component from './lib/Component.js';
import AudioComponent from './lib/AudioComponent.js';
import Playable from './lib/Playable.js';

import ConstantGenerator from './lib/generators/ConstantGenerator.js';
import Oscillator from './lib/generators/Oscillator.js';
import SineOscillator from './lib/generators/SineOscillator.js';

import Envelope from './lib/envelopes/Envelope.js';
import ADSREnvelope from './lib/envelopes/ADSREnvelope.js';

import Timer from './lib/Timer.js';

import Tone from './lib/Tone.js';

class Global {
  constructor() {
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.classRegistry = classRegistry;
    this.orchestra = orchestra;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.Component = Component;
    this.Component.o = this;
    this.registerClass('Component', Component);
    this.AudioComponent = AudioComponent;
    this.registerClass('AudioComponent', AudioComponent);
    this.Playable = Playable;
    this.registerClass('Playable', Playable);

    this.ConstantGenerator = ConstantGenerator;
    this.registerClass('ConstantGenerator', ConstantGenerator);
    this.Oscillator = Oscillator;
    this.addModule('lib/processors/OscillatorProcessor.js');
    this.registerClass('Oscillator', Oscillator);
    this.SineOscillator = SineOscillator;
    this.addModule('lib/processors/SineOscillatorProcessor.js');
    this.registerClass('SineOscillator', SineOscillator);

    this.Envelope = Envelope;
    this.addModule('lib/processors/EnvelopeProcessor.js');
    this.registerClass('Envelope', Envelope);
    this.ADSREnvelope = ADSREnvelope;
    this.addModule('lib/processors/ADSREnvelopeProcessor.js');
    this.registerClass('ADSREnvelope', ADSREnvelope);

    this.Timer = Timer;
    this.addModule('lib/processors/TimerProcessor.js');
    this.registerClass('Timer', Timer);

    this.Tone = Tone;
    this.addModule('lib/processors/MultiplierProcessor.js');
    this.registerClass('Tone', Tone);
  }

  registerClass(className, classInstance) {
    this.classRegistry.register(className, classInstance);
  }

  getClass(className) {
    return this.classRegistry.get(className);
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