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

import GeneratorSequence from './lib/components/generators/GeneratorSequence.js';

import ConstantGenerator from './lib/components/generators/ConstantGenerator.js';
import LinearGenerator from './lib/components/generators/LinearGenerator.js';
import ExponentialGenerator from './lib/components/generators/ExponentialGenerator.js';

import WhiteNoiseGenerator from './lib/components/generators/WhiteNoiseGenerator.js';
import RedNoiseGenerator from './lib/components/generators/RedNoiseGenerator.js';

import ShepardGenerator from './lib/components/generators/ShepardGenerator.js';
import ShepardOctaveGenerator from './lib/components/generators/ShepardOctaveGenerator.js';

import Oscillator from './lib/components/generators/Oscillator.js';
import SineOscillator from './lib/components/generators/SineOscillator.js';
import TriangleOscillator from './lib/components/generators/TriangleOscillator.js';
import SquareOscillator from './lib/components/generators/SquareOscillator.js';
import SawtoothOscillator from './lib/components/generators/SawtoothOscillator.js';

import Envelope from './lib/components/envelopes/Envelope.js';
import ADSREnvelope from './lib/components/envelopes/ADSREnvelope.js';

import Filter from './lib/components/filters/Filter.js';
import LinearFilter from './lib/components/filters/LinearFilter.js';
import FirstOrderFilter from './lib/components/filters/FirstOrderFilter.js';
import CutoffFilter from './lib/components/filters/CutoffFilter.js';
import StepFilter from './lib/components/filters/StepFilter.js';

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
    this.queueModule('lib/processors/AudioComponentProcessor.js');
    this.registerClass('AudioComponent', AudioComponent);
    this.Playable = Playable;
    this.registerClass('Playable', Playable);

    this.Adder = Adder;
    this.registerClass('Adder', Adder);
    this.Multiplier = Multiplier;
    this.queueModule('lib/processors/arithmetic/MultiplierProcessor.js');
    this.registerClass('Multiplier', Multiplier);

    this.Generator = Generator;
    this.queueModule('lib/processors/generators/GeneratorProcessor.js');
    this.registerClass('Generator', Generator);

    this.GeneratorSequence = GeneratorSequence;
    this.queueModule('lib/processors/generators/GeneratorSequenceProcessor.js');
    this.registerClass('GeneratorSequence', GeneratorSequence);

    this.ConstantGenerator = ConstantGenerator;
    this.registerClass('ConstantGenerator', ConstantGenerator);
    this.LinearGenerator = LinearGenerator;
    this.queueModule('lib/processors/generators/LinearGeneratorProcessor.js');
    this.registerClass('LinearGenerator', LinearGenerator);
    this.ExponentialGenerator = ExponentialGenerator;
    this.queueModule('lib/processors/generators/ExponentialGeneratorProcessor.js');
    this.registerClass('ExponentialGenerator', ExponentialGenerator);

    this.WhiteNoiseGenerator = WhiteNoiseGenerator;
    this.queueModule('lib/processors/generators/WhiteNoiseGeneratorProcessor.js');
    this.registerClass('WhiteNoiseGenerator', WhiteNoiseGenerator);
    this.RedNoiseGenerator = RedNoiseGenerator;
    this.queueModule('lib/processors/generators/RedNoiseGeneratorProcessor.js');
    this.registerClass('RedNoiseGenerator', RedNoiseGenerator);

    this.ShepardGenerator = ShepardGenerator;
    this.queueModule('lib/processors/generators/ShepardGeneratorProcessor.js');
    this.registerClass('ShepardGenerator', ShepardGenerator);
    this.ShepardOctaveGenerator = ShepardOctaveGenerator;
    this.queueModule('lib/processors/generators/ShepardOctaveGeneratorProcessor.js');
    this.registerClass('ShepardOctaveGenerator', ShepardOctaveGenerator);

    this.Oscillator = Oscillator;
    this.queueModule('lib/processors/generators/OscillatorProcessor.js');
    this.registerClass('Oscillator', Oscillator);
    this.SineOscillator = SineOscillator;
    this.queueModule('lib/processors/generators/SineOscillatorProcessor.js');
    this.registerClass('SineOscillator', SineOscillator);
    this.TriangleOscillator = TriangleOscillator;
    this.queueModule('lib/processors/generators/TriangleOscillatorProcessor.js');
    this.registerClass('TriangleOscillator', TriangleOscillator);
    this.SquareOscillator = SquareOscillator;
    this.queueModule('lib/processors/generators/SquareOscillatorProcessor.js');
    this.registerClass('SquareOscillator', SquareOscillator);
    this.SawtoothOscillator = SawtoothOscillator;
    this.queueModule('lib/processors/generators/SawtoothOscillatorProcessor.js');
    this.registerClass('SawtoothOscillator', SawtoothOscillator);

    this.Envelope = Envelope;
    this.queueModule('lib/processors/envelopes/EnvelopeProcessor.js');
    this.registerClass('Envelope', Envelope);
    this.ADSREnvelope = ADSREnvelope;
    this.queueModule('lib/processors/envelopes/ADSREnvelopeProcessor.js');
    this.registerClass('ADSREnvelope', ADSREnvelope);

    this.Filter = Filter;
    this.queueModule('lib/processors/filters/FilterProcessor.js');
    this.registerClass('Filter', Filter);
    this.LinearFilter = LinearFilter;
    this.queueModule('lib/processors/filters/LinearFilterProcessor.js');
    this.registerClass('LinearFilter', LinearFilter);
    this.FirstOrderFilter = FirstOrderFilter;
    this.queueModule('lib/processors/filters/FirstOrderFilterProcessor.js');
    this.registerClass('FirstOrderFilter', FirstOrderFilter);
    this.CutoffFilter = CutoffFilter;
    this.queueModule('lib/processors/filters/CutoffFilterProcessor.js');
    this.registerClass('CutoffFilter', CutoffFilter);
    this.StepFilter = StepFilter;
    this.queueModule('lib/processors/filters/StepFilterProcessor.js');
    this.registerClass('StepFilter', StepFilter);

    this.Timer = Timer;
    this.queueModule('lib/processors/TimerProcessor.js');
    this.registerClass('Timer', Timer);

    this.Tone = Tone;
    // Tone uses the MultiplierProcessor, which has already been added above
    this.registerClass('Tone', Tone);

    this.Sequence = Sequence;
    // Sequence uses the AudioComponentProcessor, which already has been added above
    this.registerClass('Sequence', Sequence);
    this.Action = Action;
    this.registerClass('Action', Action);
    this.PlayAction = PlayAction;
    this.registerClass('PlayAction', PlayAction);
    this.MethodAction = MethodAction;
    this.registerClass('MethodAction', MethodAction);
    this.SequenceAction = SequenceAction;
    this.registerClass('SequenceAction', SequenceAction);
    this.CreateAction = CreateAction;
    this.registerClass('CreateAction', CreateAction);
    this.CleanupAction = CleanupAction;
    this.registerClass('CleanupAction', CleanupAction);
    this.PropertyAction = PropertyAction;
    this.registerClass('PropertyAction', PropertyAction);

    this.Tuning = Tuning;
    this.registerClass('Tuning', Tuning);
    this.queueModule('lib/processors/tunings/TuningProcessor.js');
    this.MeantoneTuning = MeantoneTuning;
    this.registerClass('MeantoneTuning', MeantoneTuning);
    this.queueModule('lib/processors/tunings/MeantoneTuningProcessor.js');

    this.Note = Note;
    this.registerClass('Note', Note);
    this.queueModule('lib/processors/NoteProcessor.js');

    this.addAllModules();
  }

  registerClass(className, classInstance) {
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

  createComponent(properties, player, registry, tuning) {
    if (player === null || player === undefined) {
      player = this.player;
    }
    if (registry === null || registry === undefined) {
      registry = player.registry;
    }
    if (tuning === null || tuning === undefined) {
      tuning = player.tuning;
    }
    return this.Component.create(properties, player, registry, tuning);
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