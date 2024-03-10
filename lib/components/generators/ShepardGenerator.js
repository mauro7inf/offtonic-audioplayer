import Generator from './Generator.js';

class ShepardGenerator extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 440
    },
    {
      name: 'ratio',
      isAudioParam: true,
      defaultValue: 2
    }
  ];

  static processorName = 'ShepardGeneratorProcessor';
  
  constructor() {
    super();
    this.frequency = null;
    this.ratio = null;
  }
}

export default ShepardGenerator;