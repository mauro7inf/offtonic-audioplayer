import FourierGenerator from './FourierGenerator.js';

class OddSawtooth5Generator extends FourierGenerator {
  constructor(frequency) {
    super([1, 0, 1/3, 0, 1/5], frequency);
  }
}

export default OddSawtooth5Generator;