import OscillatorProcessor from './OscillatorProcessor.js';

class SineOscillatorProcessor extends OscillatorProcessor {
  constructor(options) {
    super(options);
  }

  wave() {
    return Math.sin(this.phase);
  }
}

registerProcessor('SineOscillatorProcessor', SineOscillatorProcessor);