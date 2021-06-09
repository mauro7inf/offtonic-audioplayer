import AudioComponent from '../AudioComponent.js';

class Oscillator extends AudioComponent {
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

  constructor() {
    super();
    this.initialPhase = null;
    this.frequency = null;
  }
}

export default Oscillator;