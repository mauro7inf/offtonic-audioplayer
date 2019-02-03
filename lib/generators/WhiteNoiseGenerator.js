import Generator from '../Generator.js';

class WhiteNoiseGenerator extends Generator {
  constructor() {
    super(); // frequency is irrelevant in white noise
  }

  generate() {
    let sample = 2.0*Math.random() - 1.0;
    this.update();
    return sample;
  }
}

export default WhiteNoiseGenerator;