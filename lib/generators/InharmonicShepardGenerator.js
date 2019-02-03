import InharmonicGenerator from './InharmonicGenerator.js';

class InharmonicShepardGenerator extends InharmonicGenerator {
  constructor(factor, frequency) {
    super([], [], frequency);
    this.setFactor(factor);
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    if (this.factor && frequency !== this.lastFrequency) {
      this.lastFrequency = frequency;
      this.calculateFrequency();
      this.calculateMultiples();
      this.calculateCoeffs();
    }
  }

  calculateFrequency() {
    while (this.frequency >= this.factor*InharmonicShepardGenerator.C0) {
      this.frequency /= this.factor;
    }
    while (this.frequency < InharmonicShepardGenerator.C0) {
      this.frequency *= this.factor;
    }
  }

  setFactor(factor) {
    if (factor !== this.factor) {
      this.factor = factor;
      this.frequency = this.lastFrequency;
      this.calculateFrequency();
      this.calculateMultiples();
      this.calculateCoeffs();
    }
  }

  calculateMultiples() {
    let multiples = [];
    for (let m = 1; m <= 1024; m *= this.factor) {
      multiples.push(m);
    }
    this.setMultiples(multiples);
  }

  calculateCoeffs() {
    let coeffs = [];
    let log = Math.log(this.frequency/InharmonicShepardGenerator.C0)/Math.log(2);
    let logF = Math.log(this.factor)/Math.log(2);
    for (let i = 0; i < this.multiples.length; i++) {
      coeffs[i] = Math.cos(Math.PI*(i*logF + log)/10.0);
    }
    this.setCoeffs(coeffs);
  }
}

InharmonicShepardGenerator.C0 = 440/Math.pow(2, 4.75);

export default InharmonicShepardGenerator;