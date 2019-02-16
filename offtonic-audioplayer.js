import utils from './lib/utils.js';

import Player from './lib/Player.js';

import Component from './lib/Component.js';

import Playable from './lib/Playable.js';

import Sequence from './lib/Sequence.js';

import Tone from './lib/Tone.js';

import Generator from './lib/Generator.js';
import Oscillator from './lib/Oscillator.js';
import SineGenerator from './lib/generators/SineGenerator.js';
import TriangleGenerator from './lib/generators/TriangleGenerator.js';
import SawtoothGenerator from './lib/generators/SawtoothGenerator.js';
import SquareGenerator from './lib/generators/SquareGenerator.js';
import PulseGenerator from './lib/generators/PulseGenerator.js';
import WhiteNoiseGenerator from './lib/generators/WhiteNoiseGenerator.js';
import RedNoiseGenerator from './lib/generators/RedNoiseGenerator.js';
import InharmonicGenerator from './lib/generators/InharmonicGenerator.js';
import FourierGenerator from './lib/generators/FourierGenerator.js';
import Sawtooth5Generator from './lib/generators/Sawtooth5Generator.js';
import OddSawtooth5Generator from './lib/generators/OddSawtooth5Generator.js';
import ShepardGenerator from './lib/generators/ShepardGenerator.js';
import ShepardOctaveGenerator from './lib/generators/ShepardOctaveGenerator.js';
import InharmonicShepardGenerator from './lib/generators/InharmonicShepardGenerator.js';

import Phasor from './lib/Phasor.js';
import LinearPhasor from './lib/phasors/LinearPhasor.js';
import RandomModPhasor from './lib/phasors/RandomModPhasor.js';
import GeneratorModPhasor from './lib/phasors/GeneratorModPhasor.js';

import Envelope from './lib/Envelope.js';
import FlatEnvelope from './lib/envelopes/FlatEnvelope.js';
import ADSREnvelope from './lib/envelopes/ADSREnvelope.js';
import LinearEnvelope from './lib/envelopes/LinearEnvelope.js';

import Filter from './lib/Filter.js';
import CutoffFilter from './lib/filters/CutoffFilter.js';
import DelayFilter from './lib/filters/DelayFilter.js';

import Amplifier from './lib/Amplifier.js';

class Global {
  constructor() {
    // global context stuff
    this.audioCtx = window.AudioContext ? new AudioContext() : new webkitAudioContext();
    this.mspa = 1000.0/this.audioCtx.sampleRate;
    this.player = null;

    // player class setup
    this.Player = Player;
    this.Player.globalContext = this;
    utils.registerClass('Player', Player);

    // component class setup (needed for subclassing by users)
    this.Component = Component;
    utils.registerClass('Component', Component);

    // playable interface setup
    this.Playable = Playable;
    this.Playable.globalContext = this;
    utils.registerClass('Playable', Playable);

    // sequence class setup
    this.Sequence = Sequence;
    this.Sequence.mspa = this.mspa;
    utils.registerClass('Sequence', Sequence);

    // tone class setup
    this.Tone = Tone;
    utils.registerClass('Tone', Tone);

    // import generator classes
    this.Generator = Generator;
    this.Generator.mspa = this.mspa;
    utils.registerClass('Generator', Generator);
    this.Oscillator = Oscillator;
    utils.registerClass('Oscillator', Oscillator);
    this.SineGenerator = SineGenerator;
    utils.registerClass('SineGenerator', SineGenerator);
    this.TriangleGenerator = TriangleGenerator;
    utils.registerClass('TriangleGenerator', TriangleGenerator);
    this.SawtoothGenerator = SawtoothGenerator;
    utils.registerClass('SawtoothGenerator', SawtoothGenerator);
    this.SquareGenerator = SquareGenerator;
    utils.registerClass('SquareGenerator', SquareGenerator);
    this.PulseGenerator = PulseGenerator;
    utils.registerClass('PulseGenerator', PulseGenerator);
    this.WhiteNoiseGenerator = WhiteNoiseGenerator;
    utils.registerClass('WhiteNoiseGenerator', WhiteNoiseGenerator);
    this.RedNoiseGenerator = RedNoiseGenerator;
    utils.registerClass('RedNoiseGenerator', RedNoiseGenerator);
    this.InharmonicGenerator = InharmonicGenerator;
    utils.registerClass('InharmonicGenerator', InharmonicGenerator);
    this.FourierGenerator = FourierGenerator;
    utils.registerClass('FourierGenerator', FourierGenerator);
    this.Sawtooth5Generator = Sawtooth5Generator;
    utils.registerClass('Sawtooth5Generator', Sawtooth5Generator);
    this.OddSawtooth5Generator = OddSawtooth5Generator;
    utils.registerClass('OddSawtooth5Generator', OddSawtooth5Generator);
    this.ShepardGenerator = ShepardGenerator;
    utils.registerClass('ShepardGenerator', ShepardGenerator);
    this.ShepardOctaveGenerator = ShepardOctaveGenerator;
    utils.registerClass('ShepardOctaveGenerator', ShepardOctaveGenerator);
    this.InharmonicShepardGenerator = InharmonicShepardGenerator;
    utils.registerClass('InharmonicShepardGenerator', InharmonicShepardGenerator);

    // import phasor classes
    this.Phasor = Phasor;
    this.Phasor.mspa = this.mspa;
    utils.registerClass('Phasor', Phasor);
    this.LinearPhasor = LinearPhasor;
    utils.registerClass('LinearPhasor', LinearPhasor);
    this.RandomModPhasor = RandomModPhasor;
    utils.registerClass('RandomModPhasor', RandomModPhasor);
    this.GeneratorModPhasor = GeneratorModPhasor;
    utils.registerClass('GeneratorModPhasor', GeneratorModPhasor);

    // import envelope classes
    this.Envelope = Envelope;
    this.Envelope.mspa = this.mspa;
    utils.registerClass('Envelope', Envelope);
    this.FlatEnvelope = FlatEnvelope;
    utils.registerClass('FlatEnvelope', FlatEnvelope);
    this.ADSREnvelope = ADSREnvelope;
    utils.registerClass('ADSREnvelope', ADSREnvelope);
    this.LinearEnvelope = LinearEnvelope;
    utils.registerClass('LinearEnvelope', LinearEnvelope);

    // import filter classes
    this.Filter = Filter;
    utils.registerClass('Filter', Filter);
    this.CutoffFilter = CutoffFilter;
    utils.registerClass('CutoffFilter', CutoffFilter);
    this.DelayFilter = DelayFilter;
    utils.registerClass('DelayFilter', DelayFilter);

    // import amplifier classes
    this.Amplifier = Amplifier;
    utils.registerClass('Amplifier', Amplifier);

    // utils
    this.utils = utils;
  }
}

let global = new Global();

export default global;