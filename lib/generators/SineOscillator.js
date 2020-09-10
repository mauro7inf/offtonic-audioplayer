import Oscillator from './Oscillator.js';

class SineOscillator extends Oscillator {
  constructor() {
    super();
  }

  getFunction() {
    return Math.sin;
  }
}

SineOscillator.setupProperties();

export default SineOscillator;