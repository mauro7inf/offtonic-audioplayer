import AudioComponent from '../AudioComponent.js';

class RedNoiseGenerator extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 440
    },
    {
      name: 'initialValue',
      isProcessorOption: true,
      defaultValue: null
    }
  ];

  static processorName = 'RedNoiseGeneratorProcessor';
  
  constructor() {
    super();
    this.frequency = null;
    this.initialValue = null;
  }
}

export default RedNoiseGenerator;