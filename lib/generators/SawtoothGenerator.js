import Generator from '../Generator.js';

class SawtoothGenerator extends Generator {
  constructor(frequency) {
    super(frequency);
  }

  generate() {
    let sample = (this.phase/Math.PI) - 1.0;
    this.update();
    return sample;
  }
}

export default SawtoothGenerator;