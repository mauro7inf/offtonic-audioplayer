import PulseGenerator from './PulseGenerator.js';

class SquareGenerator extends PulseGenerator {
  constructor(frequency) {
    super(1.0, frequency);
  }
}

export default SquareGenerator;