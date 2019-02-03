import Generator from '../Generator.js';

class PulseGenerator extends Generator {
  constructor(pulseWidth, frequency) {
    super(frequency);
    this.pulseWidth = pulseWidth;
  }

  generate() {
    let sample = (this.phase < this.pulseWidth*Math.PI) ? 1.0 : -1.0;
    this.update();
    return sample;
  }
}

export default PulseGenerator;