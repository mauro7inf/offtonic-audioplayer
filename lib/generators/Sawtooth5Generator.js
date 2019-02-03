import FourierGenerator from './FourierGenerator.js';

class Sawtooth5Generator extends FourierGenerator {
  constructor(frequency) {
    super([1, 1/2, 1/3, 1/4, 1/5], frequency);
  }
}

export default Sawtooth5Generator;