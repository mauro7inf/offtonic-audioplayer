import Generator from '../Generator.js';

class WhiteNoiseGenerator extends Generator {
  constructor(options) {
    super(); // frequency is irrelevant in white noise
    this._setOptions(options);
  }

  generate() {
    let sample = 2.0*Math.random() - 1.0;
    return sample;
  }
}

export default WhiteNoiseGenerator;