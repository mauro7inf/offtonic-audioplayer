import AudioComponent from '../AudioComponent.js';

class Generator extends AudioComponent {
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

  static processorName = 'GeneratorProcessor';

  constructor() {
    super();
    this.scaling = null;
    this.offset = null;
  }
}

export default Generator;