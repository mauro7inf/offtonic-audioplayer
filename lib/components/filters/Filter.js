import AudioComponent from '../AudioComponent.js';

class Filter extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'scaling',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'offset',
      isAudioParam: true,
      defaultValue: 0
    }
  ];

  static numberOfInputs = 1;

  static processorName = 'FilterProcessor';

  constructor() {
    super();
    this.scaling = null;
    this.offset = null;
  }
}

export default Filter;