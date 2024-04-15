import Oscillator from './Oscillator.js';

class SawtoothOscillator extends Oscillator {
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

export default SawtoothOscillator;