import Generator from './Generator.js';

const sawtooth = (x => (x - Math.PI)/(Math.PI));

function reduce(phase) {
  let a = phase;
  while (a >= 2*Math.PI) {
    a -= 2*Math.PI;
  }
  while (a < 0) {
    a += 2*Math.PI;
  }
  return a;
}

class Oscillator extends Generator {
  constructor() {
    super();
    this.frequency = null;
    this.function = null;
    this.phase = Math.random()*2*Math.PI;
    this.phaseMod = null;
  }

  _setPhase(phase) {
    this.phase = phase;
  }

  _setFunction(func) {
    this.cleanupProperty('function');
    if (func === null || func === undefined) {
      this.function = this.getFunction();
    } else {
      this.function = func;
    }
  }

  getFunction() {
    return sawtooth;
  }

  update() {
    super.update();

    let functionArgument;
    let isFrequencyMod = this.getProperty('isFrequencyMod');
    if (isFrequencyMod) {
      functionArgument = this.phase;
    } else {
      functionArgument = reduce(this.phase + this.getProperty('phaseMod'));
    }

    this.value = this.getProperty('function').call(null, functionArgument);

    // frequency cycle/s · mspa ms/frame · 1/1000 s/ms · 2π rad/cycle
    this.phase += this.getProperty('frequency')*this.mspa*Math.PI/500;

    if (isFrequencyMod) {
      this.phase += this.getProperty('phaseMod');
      this.phase = reduce(this.phase);
    } else {
      this.phase = reduce(this.phase);
    }
  }
}

Oscillator.newProperties = [
  {
    name: 'frequency',
    default: 440
  },
  {
    name: 'phase',
    setter: '_setPhase'
  },
  {
    name: 'function',
    setter: '_setFunction',
    default: null
  },
  {
    name: 'phaseMod',
    default: 0
  },
  {
    name: 'isFrequencyMod',
    default: true
  }
];
Oscillator.setupProperties();

export default Oscillator;