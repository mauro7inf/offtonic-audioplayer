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
      defaultValue: null
    }
  ];

  static processorName = 'SineOscillatorProcessor';

  constructor() {
    super();
    this.initialPhase = null;
    this.frequency = null;
  }

  getProcessorOptions() {
    let options = super.getProcessorOptions();
    if (this.frequency !== null && typeof this.frequency === 'number') {
      options.parameterData.frequency = this.frequency;
    }
    options.processorOptions.initialPhase = this.initialPhase; // include if null
    return options;
  }
}

export default SineOscillator;