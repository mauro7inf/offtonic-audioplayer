import Generator from '../Generator.js';
import LinearPhasor from '../phasors/linearPhasor.js';

class InharmonicGenerator extends Generator {
  constructor(coeffs, multiples, frequency) {
    super(frequency);
    this.setPhasor(null); // we'll have an array of phasors
    this.coeffs = coeffs;
    this.multiples = multiples;
    if (!Array.isArray(this.coeffs)) {
      this.coeffs = [];
    }
    if (!Array.isArray(this.multiples)) {
      this.multiples = [];
    }
    this.calculate();
  }

  calculate() { // wipes out all existing data
    this.numberOfTones = Math.min(this.multiples.length, this.coeffs.length);
    this.phasors = [];
    this.phases = [];
    for (let i = 0; i < this.numberOfTones; i++) {
      this.phases.push(Math.random()*Math.PI*2);
      this.phasors.push(new LinearPhasor(this.phases[i], this.multiples[i]*this.frequency));
    }
  }

  setPhasorFrequencies() { // just updates the frequencies
    for (let i = 0; i < this.numberOfTones; i++) {
      this.phasors[i].setFrequency(this.multiples[i]*this.frequency);
    }
  }

  setMultiples(multiples) {
    if (Math.min(multiples.length, this.coeffs.length) !== Math.min(this.multiples.length, this.coeffs.length)) {
      this.multiples = multiples;
      this.calculate();
    } else {
      this.multiples = multiples;
      this.setPhasorFrequencies();
    }
  }

  setCoeffs(coeffs) {
    if (Math.min(this.multiples.length, coeffs.length) !== Math.min(this.multiples.length, this.coeffs.length)) {
      this.coeffs = coeffs;
      this.calculate();
    } else {
      this.coeffs = coeffs;
    }
  }

  setPhasor() {
    return; // no-op
  }

  setFrequency(frequency) {
    if (frequency !== this.frequency) {
      this.frequency = frequency;
      this.setPhasorFrequencies();
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