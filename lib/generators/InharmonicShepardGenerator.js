import InharmonicGenerator from './InharmonicGenerator.js';

class InharmonicShepardGenerator extends InharmonicGenerator {
  constructor(options) {
    super();
    this.factor = null;
    this.lastFrequency = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('factor', options, InharmonicShepardGenerator.defaultOptions.factor);
    this._updateInharmonicShepardGeneratorParameters();
  }

  _updateInharmonicShepardGeneratorParameters() {
    let factorChanged = false;
    if (this.factor !== this.lastFactor) {
      this.lastFactor = this.factor;
      factorChanged = true;
    }
    if (this.factor !== null && (factorChanged || this.frequency !== this.lastFrequency)) {
      // will result in unnecessary calculation if frequency isn't updated at all
      this.lastFrequency = this.frequency;
      while (this.frequency >= this.factor*InharmonicShepardGenerator.C0) {
        this.frequency /= this.factor;
      }
      while (this.frequency < InharmonicShepardGenerator.C0) {
        this.frequency *= this.factor;
      }

      let multiples = [];
      for (let m = 1; m <= 1024; m *= this.factor) {
        multiples.push(m);
      }

      let coeffs = [];
      let log = Math.log(this.frequency/InharmonicShepardGenerator.C0)/Math.log(2);
      let logF = Math.log(this.factor)/Math.log(2);
      for (let i = 0; i < this.multiples.length; i++) {
        coeffs[i] = Math.cos(Math.PI*(i*logF + log)/10.0);
      }
      
      super.setOptions({
        multiples: multiples,
        coeffs: coeffs
      }); // call super so that this function doesn't get run again
    }
  }
}

InharmonicShepardGenerator.C0 = 440/Math.pow(2, 4.75);

InharmonicShepardGenerator.defaultOptions = {
  factor: 2
}

export default InharmonicShepardGenerator;