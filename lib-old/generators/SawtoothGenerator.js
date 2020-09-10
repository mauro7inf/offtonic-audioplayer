import Oscillator from '../Oscillator.js';

class SawtoothGenerator extends Oscillator {
  constructor(options) {
    super();
    this._setOptions(options)
  }

  generate() {
    let sample = (this.phase/Math.PI) - 1.0;
    this.update();
    return sample;
  }
}

export default SawtoothGenerator;