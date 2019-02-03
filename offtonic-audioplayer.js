import Player from './lib/Player.js';

import Playable from './lib/Playable.js';

import Sequence from './lib/Sequence.js';

import Tone from './lib/Tone.js';

import Generator from './lib/Generator.js';
import SineGenerator from './lib/generators/SineGenerator.js';
import TriangleGenerator from './lib/generators/TriangleGenerator.js';
import SawtoothGenerator from './lib/generators/SawtoothGenerator.js';
import SquareGenerator from './lib/generators/SquareGenerator.js';
import PulseGenerator from './lib/generators/PulseGenerator.js';
import WhiteNoiseGenerator from './lib/generators/WhiteNoiseGenerator.js';
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

    // playable interface setup
    this.Playable = Playable;
    this.Playable.globalContext = this;

    // sequence class setup
    this.Sequence = Sequence;
    this.Sequence.mspa = this.mspa;

    // tone class setup
    this.Tone = Tone;

    // import generator classes
    this.Generator = Generator;
    this.Generator.mspa = this.mspa;
    this.SineGenerator = SineGenerator;
    this.TriangleGenerator = TriangleGenerator;
    this.SawtoothGenerator = SawtoothGenerator;
    this.SquareGenerator = SquareGenerator;
    this.PulseGenerator = PulseGenerator;
    this.WhiteNoiseGenerator = WhiteNoiseGenerator;
    this.InharmonicGenerator = InharmonicGenerator;
    this.FourierGenerator = FourierGenerator;
    this.Sawtooth5Generator = Sawtooth5Generator;
    this.OddSawtooth5Generator = OddSawtooth5Generator;
    this.ShepardGenerator = ShepardGenerator;
    this.ShepardOctaveGenerator = ShepardOctaveGenerator;
    this.InharmonicShepardGenerator = InharmonicShepardGenerator;

    // import phasor classes
    this.Phasor = Phasor;
    this.Phasor.mspa = this.mspa;
    this.LinearPhasor = LinearPhasor;
    this.RandomModPhasor = RandomModPhasor;

    // import envelope classes
    this.Envelope = Envelope;
    this.Envelope.mspa = this.mspa;
    this.FlatEnvelope = FlatEnvelope;
    this.ADSREnvelope = ADSREnvelope;
    this.LinearEnvelope = LinearEnvelope;

    // import filter classes
    this.Filter = Filter;
    this.CutoffFilter = CutoffFilter;
    this.DelayFilter = DelayFilter;

    // import amplifier classes
    this.Amplifier = Amplifier;
  }
}

let global = new Global();

export default global;