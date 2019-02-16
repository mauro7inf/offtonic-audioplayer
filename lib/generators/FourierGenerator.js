import Oscillator from '../Oscillator.js';

class FourierGenerator extends Oscillator {
  constructor(options) {
    super();
    this.fourierCoeffs = null;
    this.fourierOffsets = [];
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('fourierCoeffs', options, FourierGenerator.defaultOptions.fourierCoeffs);
    this._initProperty('fourierOffsets', options);
    this._updateFourierGeneratorParameters();
  }

  _updateFourierGeneratorParameters() {
    if (this.fourierCoeffs !== null && this.fourierCoeffs.length !== this.fourierOffsets.length) {
      this.fourierOffsets = [];
      for (let i = 0; i < this.fourierCoeffs.length; i++) {
        this.fourierOffsets[i] = Math.random()*Math.PI*2;
      }
    }
  }

  generate() {
    let sample = 0;
    for (let i = 0; i < this.fourierCoeffs.length; i++) {
      sample += this.fourierCoeffs[i]*Math.sin((i + 1)*(this.phase - this.fourierOffsets[i]));
    }
    this.update();
    return sample;
  }
}

FourierGenerator.defaultOptions = {
  fourierCoeffs: [1]
}

export default FourierGenerator;