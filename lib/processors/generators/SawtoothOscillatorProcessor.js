import OscillatorProcessor from './OscillatorProcessor.js';

class SawtoothOscillatorProcessor extends OscillatorProcessor {
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
    let twoPiK = k*2*Math.PI;
    if (this.phase < twoPiK) {
      return 1 - this.phase/twoPiK;
    } else {
      return (twoPiK - this.phase)/(2*Math.PI - twoPiK);
    }
  }
}

registerProcessor('SawtoothOscillatorProcessor', SawtoothOscillatorProcessor);

export default SawtoothOscillatorProcessor;