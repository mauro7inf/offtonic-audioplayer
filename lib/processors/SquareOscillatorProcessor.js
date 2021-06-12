import OscillatorProcessor from './OscillatorProcessor.js';

class SquareOscillatorProcessor extends OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let k = this.getParameter('pulseWidth', this.frame);
    if (this.phase < k*2*Math.PI) {
      return 1;
    } else {
      return -1;
    }
  }
}

registerProcessor('SquareOscillatorProcessor', SquareOscillatorProcessor);

export default SquareOscillatorProcessor;