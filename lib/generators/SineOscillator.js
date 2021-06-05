import AudioComponent from '../AudioComponent.js';

class SineOscillator extends AudioComponent {
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

  static processorName = 'SineOscillatorProcessor';

  constructor() {
    super();
    this.initialPhase = null;
    this.frequency = null;
  }

  createNode() {
    super.createNode();
  }
}

export default SineOscillator;