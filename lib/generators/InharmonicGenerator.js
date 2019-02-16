import Generator from '../Generator.js';
import LinearPhasor from '../phasors/linearPhasor.js';

class InharmonicGenerator extends Generator { // need to re-implement frequency
  constructor(options) {
    super();
    this.coeffs = [];
    this.multiples = [];
    this.phasors = [];
    this.phases = [];
    this.numberOfTones = 0;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('frequency', options);
    this._initProperty('coeffs', options);
    this._initProperty('multiples', options);
    this._updateInharmonicGeneratorParameters();
  }

  _updateInharmonicGeneratorParameters() {
    if (!Array.isArray(this.coeffs)) {
      this.coeffs = [];
    }
    if (!Array.isArray(this.multiples)) {
      this.multiples = [];
    }
    let numberOfTones = Math.min(this.multiples.length, this.coeffs.length);
    if (numberOfTones !== this.numberOfTones) {
      this.numberOfTones = numberOfTones;
      this.phasors = [];
      this.phases = [];
      for (let i = 0; i < this.numberOfTones; i++) {
        this.phases.push(Math.random()*Math.PI*2);
        this.phasors.push(new LinearPhasor({
          phase: this.phases[i],
          frequency: this.multiples[i]*this.frequency
        }));
      }
    } else {
      for (let i = 0; i < this.numberOfTones; i++) {
        this.phasors[i].setOptions({frequency: this.multiples[i]*this.frequency});
      }
    }
  }

  update() {
    for (let i = 0; i < this.numberOfTones; i++) {
      this.phases[i] = this.phasors[i].generate();
    }
  }

  generate() {
    let sample = 0;
    for (let i = 0; i < this.numberOfTones; i++) {
      sample += this.coeffs[i]*Math.sin(this.phases[i]);
    }
    this.update();
    return sample;
  }
}

export default InharmonicGenerator;