import Generator from './Generator.js';

class Oscillator extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 440
    },
    {
      name: 'initialPhase',
      isProcessorOption: true,
      defaultValue: null
    }
  ];

  static processorName = 'OscillatorProcessor';

  constructor() {
    super();
    this.initialPhase = null;
    this.frequency = null;
  }
}

export default Oscillator;