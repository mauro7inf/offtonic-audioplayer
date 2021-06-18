import Oscillator from './Oscillator.js';

class SineOscillator extends Oscillator {
  static newPropertyDescriptors = [
    {
      name: 'pulseWidth',
      isAudioParam: true,
      defaultValue: 0.5
    }
  ];

  static processorName = 'SawtoothOscillatorProcessor';

  constructor() {
    super();
    this.pulseWidth = null;
  }
}

export default SineOscillator;