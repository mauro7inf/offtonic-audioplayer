import Generator from '../Generator.js';

class TriangleGenerator extends Generator {
  constructor(frequency) {
    super(frequency);
  }

  generate() {
    let sample = 2.0*Math.abs((this.phase/Math.PI) - 1.0) - 1.0;
    this.update();
    return sample;
  }
}

export default TriangleGenerator;