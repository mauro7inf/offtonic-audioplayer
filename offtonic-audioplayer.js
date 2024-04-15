import classRegistry from './lib/registries/ClassRegistry.js';

import Player from './lib/Player.js';
import Orchestra from './lib/registries/Orchestra.js';
import Registry from './lib/registries/Registry.js';

import Component from './lib/components/Component.js';
import AudioComponent from './lib/components/AudioComponent.js';
import NodeOutput from './lib/components/NodeOutput.js';
import Playable from './lib/components/Playable.js';

import Adder from './lib/components/arithmetic/Adder.js';
import Multiplier from './lib/components/arithmetic/Multiplier.js';

import Generator from './lib/components/generators/Generator.js';

import GeneratorSequence from './lib/components/generators/GeneratorSequence.js';

import ConstantGenerator from './lib/components/generators/ConstantGenerator.js';
import LinearGenerator from './lib/components/generators/LinearGenerator.js';
import ExponentialGenerator from './lib/components/generators/ExponentialGenerator.js';

import FourierGenerator from './lib/components/generators/FourierGenerator.js';
import FourierComponent from './lib/components/generators/FourierComponent.js';
import FourierSawtooth from './lib/components/generators/FourierSawtooth.js';

import WhiteNoiseGenerator from './lib/components/generators/WhiteNoiseGenerator.js';
import RedNoiseGenerator from './lib/components/generators/RedNoiseGenerator.js';

import ShepardGenerator from './lib/components/generators/ShepardGenerator.js';
import ShepardOctaveGenerator from './lib/components/generators/ShepardOctaveGenerator.js';

import Oscillator from './lib/components/generators/Oscillator.js';
import SineOscillator from './lib/components/generators/SineOscillator.js';
import TriangleOscillator from './lib/components/generators/TriangleOscillator.js';
import SquareOscillator from './lib/components/generators/SquareOscillator.js';
import SawtoothOscillator from './lib/components/generators/SawtoothOscillator.js';
import ExponentialSineOscillator from './lib/components/generators/ExponentialSineOscillator.js';

import Envelope from './lib/components/envelopes/Envelope.js';
import ADSREnvelope from './lib/components/envelopes/ADSREnvelope.js';

import Filter from './lib/components/filters/Filter.js';
import ParallelFilter from './lib/components/filters/ParallelFilter.js';
import LinearFilter from './lib/components/filters/LinearFilter.js';
import FirstOrderFilter from './lib/components/filters/FirstOrderFilter.js';
import BiquadFilter from './lib/components/filters/BiquadFilter.js';
import CutoffFilter from './lib/components/filters/CutoffFilter.js';
import StepFilter from './lib/components/filters/StepFilter.js';

import TwoPoleFilter from './lib/components/filters/TwoPoleFilter.js';

import Timer from './lib/components/Timer.js';

import Tone from './lib/components/Tone.js';

import Sequence from './lib/components/Sequence.js';
import Action from './lib/components/actions/Action.js';
import PlayAction from './lib/components/actions/PlayAction.js';
import MethodAction from './lib/components/actions/MethodAction.js';
import SequenceAction from './lib/components/actions/SequenceAction.js';
import CreateAction from './lib/components/actions/CreateAction.js';
import CleanupAction from './lib/components/actions/CleanupAction.js';
import PropertyAction from './lib/components/actions/PropertyAction.js';

import Tuning from './lib/components/tunings/Tuning.js';
import MeantoneTuning from './lib/components/tunings/MeantoneTuning.js';

import Note from './lib/components/Note.js';

class Global {
  constructor() {
    this.debug = false;
    this.modulesToAdd = [];
    // global context stuff
    this.ctx = new AudioContext();
    this.classRegistry = classRegistry;
    this.classRegistry.o = this;
    this.Orchestra = Orchestra;
    this.Registry = Registry;
    this.Registry.o = this;

    let url = new URL(import.meta.url);
    let href = url.href;
    this.baseHref = href.substring(0, href.indexOf('offtonic-audioplayer.js'));

    this.Player = Player;
    this.Player.o = this;
    this.player = new this.Player(); // common instance, used by default

    this.Component = Component;
    this.Component.o = this;
    this.registerClass(Component);
    
    this.registerClass(AudioComponent);
    this.queueModule('lib/processors/AudioComponentProcessor.js');
    this.registerClass(NodeOutput);
    this.registerClass(Playable);

    this.registerClass(Adder);
    this.registerClass(Multiplier);
    this.queueModule('lib/processors/arithmetic/MultiplierProcessor.js');

    this.registerClass(Generator);
    this.queueModule('lib/processors/generators/GeneratorProcessor.js');

    this.registerClass(GeneratorSequence);
    this.queueModule('lib/processors/generators/GeneratorSequenceProcessor.js');

    this.registerClass(ConstantGenerator);
    this.registerClass(LinearGenerator);
    this.queueModule('lib/processors/generators/LinearGeneratorProcessor.js');
    this.registerClass(ExponentialGenerator);
    this.queueModule('lib/processors/generators/ExponentialGeneratorProcessor.js');

    this.registerClass(FourierGenerator);
    this.registerClass(FourierComponent);
    this.registerClass(FourierSawtooth);

    this.registerClass(WhiteNoiseGenerator);
    this.queueModule('lib/processors/generators/WhiteNoiseGeneratorProcessor.js');
    this.registerClass(RedNoiseGenerator);
    this.queueModule('lib/processors/generators/RedNoiseGeneratorProcessor.js');

    this.registerClass(ShepardGenerator);
    this.queueModule('lib/processors/generators/ShepardGeneratorProcessor.js');
    this.registerClass(ShepardOctaveGenerator);
    this.queueModule('lib/processors/generators/ShepardOctaveGeneratorProcessor.js');

    this.registerClass(Oscillator);
    this.queueModule('lib/processors/generators/OscillatorProcessor.js');
    this.registerClass(SineOscillator);
    this.queueModule('lib/processors/generators/SineOscillatorProcessor.js');
    this.registerClass(TriangleOscillator);
    this.queueModule('lib/processors/generators/TriangleOscillatorProcessor.js');
    this.registerClass(SquareOscillator);
    this.queueModule('lib/processors/generators/SquareOscillatorProcessor.js');
    this.registerClass(SawtoothOscillator);
    this.queueModule('lib/processors/generators/SawtoothOscillatorProcessor.js');
    this.registerClass(ExponentialSineOscillator);
    this.queueModule('lib/processors/generators/ExponentialSineOscillatorProcessor.js');

    this.registerClass(Envelope);
    this.queueModule('lib/processors/envelopes/EnvelopeProcessor.js');
    this.registerClass(ADSREnvelope);
    this.queueModule('lib/processors/envelopes/ADSREnvelopeProcessor.js');

    this.registerClass(Filter);
    this.queueModule('lib/processors/filters/FilterProcessor.js');
    this.registerClass(ParallelFilter);
    this.registerClass(LinearFilter);
    this.queueModule('lib/processors/filters/LinearFilterProcessor.js');
    this.registerClass(FirstOrderFilter);
    this.queueModule('lib/processors/filters/FirstOrderFilterProcessor.js');
    this.registerClass(BiquadFilter);
    this.queueModule('lib/processors/filters/BiquadFilterProcessor.js');
    this.registerClass(CutoffFilter);
    this.queueModule('lib/processors/filters/CutoffFilterProcessor.js');
    this.registerClass(StepFilter);
    this.queueModule('lib/processors/filters/StepFilterProcessor.js');

    this.registerClass(TwoPoleFilter);
    this.queueModule('lib/processors/drivers/TwoPoleFilterDriverProcessor.js');

    this.registerClass(Timer);
    this.queueModule('lib/processors/TimerProcessor.js');

    // Tone uses the MultiplierProcessor, which has already been added above
    this.registerClass(Tone);

    // Sequence uses the AudioComponentProcessor, which already has been added above
    this.registerClass(Sequence);
    this.registerClass(Action);
    this.registerClass(PlayAction);
    this.registerClass(MethodAction);
    this.registerClass(SequenceAction);
    this.registerClass(CreateAction);
    this.registerClass(CleanupAction);
    this.registerClass(PropertyAction);

    this.registerClass(Tuning);
    this.queueModule('lib/processors/tunings/TuningProcessor.js');
    this.registerClass(MeantoneTuning);
    this.queueModule('lib/processors/tunings/MeantoneTuningProcessor.js');

    this.registerClass(Note);
    this.queueModule('lib/processors/NoteProcessor.js');

    this.addAllModules();
  }

  registerClass(classInstance) {
    let className = classInstance.name;
    this[className] = classInstance;
    this.classRegistry.register(className, classInstance);
  }

  getClass(className) {
    return this.classRegistry.get(className);
  }

  // modulePath should be relative to this file's location
  addModule(modulePath) {
    return this.ctx.audioWorklet.addModule(this.baseHref + modulePath);
  }

  // modulePath should be relative to this file's location
  queueModule(modulePath) {
    this.modulesToAdd.push(modulePath);
  }

  addAllModules() {
    this.addModulesFromList(this.modulesToAdd);
    this.modulesToAdd = [];
  }

  addModulesFromList(list) {
    if (list.length === 0) {
      return;
    }
    this.ctx.audioWorklet.addModule(this.baseHref + list[0]).then(() => {
      this.addModulesFromList(list.slice(1));
    });
  }

  createComponent(properties, parent, player, registry, tuning) {
    if (player === null || player === undefined) {
      player = this.player;
    }
    if (parent === null || parent === undefined) {
      parent = this.player; // the player should be the top-level parent, not the Global
    }
    if (registry === null || registry === undefined) {
      registry = player.registry;
    }
    if (tuning === null || tuning === undefined) {
      tuning = player.tuning;
    }
    return this.Component.create(properties, parent, player, registry, tuning);
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