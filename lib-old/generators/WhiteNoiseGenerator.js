import Generator from '../Generator.js';

class WhiteNoiseGenerator extends Generator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  generate() {
    let sample = 2.0*Math.random() - 1.0;
    return sample;
  }
}

export default WhiteNoiseGenerator;