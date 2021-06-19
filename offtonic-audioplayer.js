import classRegistry from './lib/registries/ClassRegistry.js';
import orchestra from './lib/registries/Orchestra.js';

import Player from './lib/Player.js';
import Registry from './lib/registries/Registry.js';

import Component from './lib/components/Component.js';
import AudioComponent from './lib/components/AudioComponent.js';
import Playable from './lib/components/Playable.js';

import Adder from './lib/components/arithmetic/Adder.js';
import Multiplier from './lib/components/arithmetic/Multiplier.js';

import Generator from './lib/components/generators/Generator.js';

import ConstantGenerator from './lib/components/generators/ConstantGenerator.js';
import LinearGenerator from './lib/components/generators/LinearGenerator.js';

import WhiteNoiseGenerator from './lib/components/generators/WhiteNoiseGenerator.js';
import RedNoiseGenerator from './lib/components/generators/RedNoiseGenerator.js';

import Oscillator from './lib/components/generators/Oscillator.js';
import SineOscillator from './lib/components/generators/SineOscillator.js';
import TriangleOscillator from './lib/components/generators/TriangleOscillator.js';
import SquareOscillator from './lib/components/generators/SquareOscillator.js';
import SawtoothOscillator from './lib/components/generators/SawtoothOscillator.js';

import Envelope from './lib/components/envelopes/Envelope.js';
import ADSREnvelope from './lib/components/envelopes/ADSREnvelope.js';

import Filter from './lib/components/filters/Filter.js';
import FirstOrderFilter from './lib/components/filters/FirstOrderFilter.js';
import CutoffFilter from './lib/components/filters/CutoffFilter.js';

import Timer from './lib/components/Timer.js';

import Tone from './lib/components/Tone.js';

class Global {
  constructor() {
    this.debug = false;
    // global context stuff
    this.ctx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.classRegistry = classRegistry;
    this.classRegistry.o = this;
    this.orchestra = orchestra;
    this.Registry = Registry;

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

    this.Adder = Adder;
    this.registerClass('Adder', Adder);
    this.Multiplier = Multiplier;
    this.addModule('lib/processors/arithmetic/MultiplierProcessor.js');
    this.registerClass('Multiplier', Multiplier);

    this.Generator = Generator;
    this.addModule('lib/processors/generators/GeneratorProcessor.js');
    this.registerClass('Generator', Generator);

    this.ConstantGenerator = ConstantGenerator;
    this.registerClass('ConstantGenerator', ConstantGenerator);
    this.LinearGenerator = LinearGenerator;
    this.addModule('lib/processors/generators/LinearGeneratorProcessor.js');
    this.registerClass('LinearGenerator', LinearGenerator);

    this.WhiteNoiseGenerator = WhiteNoiseGenerator;
    this.addModule('lib/processors/generators/WhiteNoiseGeneratorProcessor.js');
    this.registerClass('WhiteNoiseGenerator', WhiteNoiseGenerator);
    this.RedNoiseGenerator = RedNoiseGenerator;
    this.addModule('lib/processors/generators/RedNoiseGeneratorProcessor.js');
    this.registerClass('RedNoiseGenerator', RedNoiseGenerator);

    this.Oscillator = Oscillator;
    this.addModule('lib/processors/generators/OscillatorProcessor.js');
    this.registerClass('Oscillator', Oscillator);
    this.SineOscillator = SineOscillator;
    this.addModule('lib/processors/generators/SineOscillatorProcessor.js');
    this.registerClass('SineOscillator', SineOscillator);
    this.TriangleOscillator = TriangleOscillator;
    this.addModule('lib/processors/generators/TriangleOscillatorProcessor.js');
    this.registerClass('TriangleOscillator', TriangleOscillator);
    this.SquareOscillator = SquareOscillator;
    this.addModule('lib/processors/generators/SquareOscillatorProcessor.js');
    this.registerClass('SquareOscillator', SquareOscillator);
    this.SawtoothOscillator = SawtoothOscillator;
    this.addModule('lib/processors/generators/SawtoothOscillatorProcessor.js');
    this.registerClass('SawtoothOscillator', SawtoothOscillator);

    this.Envelope = Envelope;
    this.addModule('lib/processors/envelopes/EnvelopeProcessor.js');
    this.registerClass('Envelope', Envelope);
    this.ADSREnvelope = ADSREnvelope;
    this.addModule('lib/processors/envelopes/ADSREnvelopeProcessor.js');
    this.registerClass('ADSREnvelope', ADSREnvelope);

    this.Filter = Filter;
    this.addModule('lib/processors/filters/FilterProcessor.js');
    this.registerClass('Filter', Filter);
    this.FirstOrderFilter = FirstOrderFilter;
    this.addModule('lib/processors/filters/FirstOrderFilterProcessor.js');
    this.registerClass('FirstOrderFilter', FirstOrderFilter);
    this.CutoffFilter = CutoffFilter;
    this.addModule('lib/processors/filters/CutoffFilterProcessor.js');
    this.registerClass('CutoffFilter', CutoffFilter);

    this.Timer = Timer;
    this.addModule('lib/processors/TimerProcessor.js');
    this.registerClass('Timer', Timer);

    this.Tone = Tone;
    // Tone uses the MultiplierProcessor, which has already been added above
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

  createComponent(properties, player, registry) {
    if (player === null || player === undefined) {
      player = this.player;
    }
    if (registry === null || registry === undefined) {
      registry = player.registry;
    }
    return this.Component.create(properties, player, registry);
  }

  info(...args) {
    if (this.debug) {
      console.info.apply(console, args);
    }
  }

  warn(...args) {
    if (this.debug) {
      console.warn.apply(console, args);
    }
  }

  error(...args) {
    if (this.debug) {
      console.error.apply(console, args);
    }
  }
}

const global = new Global();

export default global;