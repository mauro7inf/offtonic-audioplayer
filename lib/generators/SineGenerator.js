import Generator from '../Generator.js';

class SineGenerator extends Generator {
  constructor(frequency) {
    super(frequency);
  }

  generate() {
    let sample = Math.sin(this.phase);
    this.update();
    return sample;
  }
}

export default SineGenerator;