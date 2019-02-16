import ShepardGenerator from './ShepardGenerator.js';

class ShepardOctaveGenerator extends ShepardGenerator {
  constructor(options) {
    super();
    this.octave = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('octave', options, ShepardOctaveGenerator.defaultOptions.octave);
    this._updateShepardOctaveGeneratorParameters();
  }

  _updateShepardOctaveGeneratorParameters() {
    let a = this.octave;
    let b = 10 - this.octave;
    let aa = Math.pow(a, a);
    let bb = Math.pow(b, b);
    let abab = Math.pow(a + b, a + b);
    let log = Math.log(this.frequency/ShepardGenerator.C0)/Math.log(2);
    for (let i = 0; i < 10; i++) {
      let x = i + log;
      this.shepardCoeffs[i] = Math.pow(Math.pow(x/10, a)*Math.pow(1 - x/10, b)*(abab/(aa*bb)), 0.8);
    }
  }
}

ShepardOctaveGenerator.defaultOptions = {
  octave: 4.0
}

export default ShepardOctaveGenerator;