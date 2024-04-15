import Oscillator from './Oscillator.js';

class TriangleOscillator extends Oscillator {
  static newPropertyDescriptors = [
    {
      name: 'pulseWidth',
      isAudioParam: true,
      defaultValue: 0.5
    }
  ];

  static processorName = 'TriangleOscillatorProcessor';

  constructor() {
    super();
    this.pulseWidth = null;
  }
}

export default TriangleOscillator;