import Oscillator from '../Oscillator.js';

class SineGenerator extends Oscillator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  generate() {
    let sample = Math.sin(this.phase);
    this.update();
    return sample;
  }
}

export default SineGenerator;