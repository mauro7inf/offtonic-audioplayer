import classRegistry from './lib/ClassRegistry.js';
import Registry from './lib/Registry.js';
import Orchestra from './lib/Orchestra.js';

import Player from './lib/Player.js';

import Component from './lib/Component.js';
import AudioComponent from './lib/AudioComponent.js';
import Playable from './lib/Playable.js';
import TimedComponent from './lib/TimedComponent.js';

import Timer from './lib/Timer.js';

import Tone from './lib/Tone.js';

import Generator from './lib/generators/Generator.js';
import Oscillator from './lib/generators/Oscillator.js';
import SineOscillator from './lib/generators/SineOscillator.js';
import TriangleOscillator from './lib/generators/TriangleOscillator.js';
import SquareOscillator from './lib/generators/SquareOscillator.js';
import PitchSpaceSineOscillator from './lib/generators/PitchSpaceSineOscillator.js';
import WhiteNoiseGenerator from './lib/generators/WhiteNoiseGenerator.js';
import RedNoiseGenerator from './lib/generators/RedNoiseGenerator.js';
import InharmonicGenerator from './lib/generators/InharmonicGenerator.js';
import FourierGenerator from './lib/generators/FourierGenerator.js';
import FourierSawtoothGenerator from './lib/generators/FourierSawtoothGenerator.js';
import ShepardGenerator from './lib/generators/ShepardGenerator.js';
import ShepardOctaveGenerator from './lib/generators/ShepardOctaveGenerator.js';

import ADSREnvelope from './lib/envelopes/ADSREnvelope.js';
import ExponentialEnvelope from './lib/envelopes/ExponentialEnvelope.js';
import LinearEnvelope from './lib/envelopes/LinearEnvelope.js';

import Filter from './lib/filters/Filter.js';
import CutoffFilter from './lib/filters/CutoffFilter.js';
import LinearFilter from './lib/filters/LinearFilter.js';

import Score from './lib/Score.js';

import Sequence from './lib/Sequence.js';

import Action from './lib/actions/Action.js';
import CreateAction from './lib/actions/CreateAction.js';
import PlayableAction from './lib/actions/PlayableAction.js';
import FunctionAction from './lib/actions/FunctionAction.js';
import ReferenceAction from './lib/actions/ReferenceAction.js';
import MethodAction from './lib/actions/MethodAction.js';
import PropertyAction from './lib/actions/PropertyAction.js';

class Global {
  constructor() {
    // global context stuff
    this.audioCtx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.mspa = 1000.0/this.audioCtx.sampleRate;
    this.player = null;
    this.classRegistry = classRegistry;

    // player class setup -- no need to register in class registry
    this.Player = Player;
    this.Player.globalContext = this;

    // registry-type class setup -- no need to register in class registry
    this.Registry = Registry;
    this.Orchestra = Orchestra;

    // component class setup (needed for subclassing by users)
    this.Component = Component;
    this.Component.globalContext = this;
    this.classRegistry.register('Component', Component); // this is probably pointless since Component is an abstract class
    this.AudioComponent = AudioComponent;
    this.classRegistry.register('AudioComponent', AudioComponent); // also pointless
    this.Playable = Playable;
    this.classRegistry.register('Playable', Playable); // also pointless
    this.TimedComponent = TimedComponent;
    this.classRegistry.register('TimedComponent', TimedComponent);

    // timer class setup
    this.Timer = Timer;
    this.classRegistry.register('Timer', Timer);

    // tone class setup
    this.Tone = Tone;
    this.classRegistry.register('Tone', Tone);

    // generator class setup
    this.Generator = Generator;
    this.classRegistry.register('Generator', Generator);
    this.Oscillator = Oscillator;
    this.classRegistry.register('Oscillator', Oscillator);
    this.SineOscillator = SineOscillator;
    this.classRegistry.register('SineOscillator', SineOscillator);
    this.TriangleOscillator = TriangleOscillator;
    this.classRegistry.register('TriangleOscillator', TriangleOscillator);
    this.SquareOscillator = SquareOscillator;
    this.classRegistry.register('SquareOscillator', SquareOscillator);
    this.PitchSpaceSineOscillator = PitchSpaceSineOscillator;
    this.classRegistry.register('PitchSpaceSineOscillator', PitchSpaceSineOscillator);
    this.WhiteNoiseGenerator = WhiteNoiseGenerator;
    this.classRegistry.register('WhiteNoiseGenerator', WhiteNoiseGenerator);
    this.RedNoiseGenerator = RedNoiseGenerator;
    this.classRegistry.register('RedNoiseGenerator', RedNoiseGenerator);
    this.InharmonicGenerator = InharmonicGenerator;
    this.classRegistry.register('InharmonicGenerator', InharmonicGenerator);
    this.FourierGenerator = FourierGenerator;
    this.classRegistry.register('FourierGenerator', FourierGenerator);
    this.FourierSawtoothGenerator = FourierSawtoothGenerator;
    this.classRegistry.register('FourierSawtoothGenerator', FourierSawtoothGenerator);
    this.ShepardGenerator = ShepardGenerator;
    this.classRegistry.register('ShepardGenerator', ShepardGenerator);
    this.ShepardOctaveGenerator = ShepardOctaveGenerator;
    this.classRegistry.register('ShepardOctaveGenerator', ShepardOctaveGenerator);

    // envelope class setup
    this.ADSREnvelope = ADSREnvelope;
    this.classRegistry.register('ADSREnvelope', ADSREnvelope);
    this.ExponentialEnvelope = ExponentialEnvelope;
    this.classRegistry.register('ExponentialEnvelope', ExponentialEnvelope);
    this.LinearEnvelope = LinearEnvelope;
    this.classRegistry.register('LinearEnvelope', LinearEnvelope);

    // filter class setup
    this.Filter = Filter;
    this.classRegistry.register('Filter', Filter);
    this.CutoffFilter = CutoffFilter;
    this.classRegistry.register('CutoffFilter', CutoffFilter);
    this.LinearFilter = LinearFilter;
    this.classRegistry.register('LinearFilter', LinearFilter);

    // score class setup
    this.Score = Score;
    this.classRegistry.register('Score', Score);

    // sequence class setup
    this.Sequence = Sequence;
    this.classRegistry.register('Sequence', Sequence);

    // action class setup
    this.Action = Action;
    this.classRegistry.register('Action', Action);
    this.CreateAction = CreateAction;
    this.classRegistry.register('CreateAction', CreateAction);
    this.PlayableAction = PlayableAction;
    this.classRegistry.register('PlayableAction', PlayableAction);
    this.FunctionAction = FunctionAction;
    this.classRegistry.register('FunctionAction', FunctionAction);
    this.ReferenceAction = ReferenceAction;
    this.classRegistry.register('ReferenceAction', ReferenceAction);
    this.MethodAction = MethodAction;
    this.classRegistry.register('MethodAction', MethodAction);
    this.PropertyAction = PropertyAction;
    this.classRegistry.register('PropertyAction', PropertyAction);
  }
}

let global = new Global();

export default global;