import AudioComponent from '../AudioComponent.js';

class Multiplier extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'term1', // TODO make this an array
      isAudioComponent: true,
      inputIndex: 0,
      defaultValue: null
    },
    {
      name: 'term2',
      isAudioComponent: true,
      inputIndex: 1,
      defaultValue: null
    }
  ];

  static processorName = 'MultiplierProcessor';
  static numberOfInputs = 2;

  constructor() {
    super();
    this.term1 = null;
    this.term2 = null;
    // TODO make this work as an envelope or filter too
  }
}

export default Multiplier;