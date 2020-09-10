import Oscillator from '../Oscillator.js';

class TriangleGenerator extends Oscillator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  generate() {
    let sample = 2.0*Math.abs((this.phase/Math.PI) - 1.0) - 1.0;
    this.update();
    return sample;
  }
}

export default TriangleGenerator;