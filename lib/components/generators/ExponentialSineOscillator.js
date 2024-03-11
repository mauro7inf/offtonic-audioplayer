import Oscillator from './Oscillator.js';

class ExponentialSineOscillator extends Oscillator {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 0.5
    },
    {
      name: 'initialPhase',
      isProcessorOption: true,
      defaultValue: 1.5*Math.PI
    },
    {
      name: 'baseline',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'minValue',
      isAudioParam: true,
      defaultValue: 440/Math.pow(2, 0.75)
    },
    {
      name: 'maxValue',
      isAudioParam: true,
      defaultValue: 440*Math.pow(2, 0.25)
    }
  ];

  static processorName = 'ExponentialSineOscillatorProcessor';

  constructor() {
    super();
    this.baseline = null;
    this.minValue = null;
    this.maxValue = null;
  }
}

export default ExponentialSineOscillator;