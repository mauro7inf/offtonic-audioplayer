import ShepardGenerator from './ShepardGenerator.js';

class ShepardOctaveGenerator extends ShepardGenerator {
  static newPropertyDescriptors = [
    {
      name: 'peakFrequency',
      isAudioParam: true,
      defaultValue: 440
    }
  ];

  static processorName = 'ShepardOctaveGeneratorProcessor';
  
  constructor() {
    super();
    this.peakFrequency = null;
  }
}

export default ShepardOctaveGenerator;