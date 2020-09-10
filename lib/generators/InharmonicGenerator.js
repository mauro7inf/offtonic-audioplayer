import Generator from './Generator.js';

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

class InharmonicGenerator extends Generator {
  constructor() {
    super();
    this.phases = null;
    this.coeffs = null;
    this.multiples = null;
    this.frequency = null;
    this.function = null;
  }

  _setPhases(phases) {
    this._genericSetter('phases', phases);
    this._setupValues();
  }

  _setCoeffs(coeffs) {
    this._genericSetter('coeffs', coeffs);
    this._setupValues();
  }

  _setMultiples(multiples) {
    this._genericSetter('multiples', multiples);
    this._setupValues();
  }

  _setupValues() {
    let phasesNeeded = 0;
    if (this.coeffs !== null && this.multiples !== null) {
      phasesNeeded = Math.min(this.getProperty('coeffs').length, this.getProperty('multiples').length);
    } else if (this.coeffs !== null) {
      phasesNeeded = this.getProperty('coeffs').length;
    } else if (this.multiples !== null) {
      phasesNeeded = this.getProperty('multiples').length;
    }
    while (this.phases.length < phasesNeeded) {
      this.phases.push(Math.random()*2*Math.PI);
    }
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
    return Math.sin;
  }

  _calculateParameters() {
    // do nothing
  }

  update() {
    super.update();

    this.value = 0;
    let func = this.getProperty('function');
    let freq = this.getProperty('frequency');
    let coeffs = this.getProperty('coeffs');
    let multiples = this.getProperty('multiples');
    let terms = Math.min(coeffs.length, multiples.length);
    while (this.phases.length < terms) {
      this.phases.push(Math.random()*2*Math.PI);
    }
    for (let i = 0; i < terms; i++) {
      this.value += coeffs[i]*func.call(this, this.phases[i]);

      this.phases[i] += multiples[i]*freq*this.mspa*Math.PI/500;

      this.phases[i] = reduce(this.phases[i]);
    }
  }
}

InharmonicGenerator.newProperties = [
  {
    name: 'phases',
    setter: '_setPhases',
    default: []
  },
  {
    name: 'coeffs',
    setter: '_setCoeffs',
    default: [1]
  },
  {
    name: 'multiples',
    setter: '_setMultiples',
    default: [1]
  },
  {
    name: 'frequency',
    default: 440
  },
  {
    name: 'function',
    setter: '_setFunction',
    default: null
  }
];
InharmonicGenerator.setupProperties();

export default InharmonicGenerator;