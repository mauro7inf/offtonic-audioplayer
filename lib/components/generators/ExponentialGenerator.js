import LinearGenerator from './LinearGenerator.js';

class ExponentialGenerator extends LinearGenerator {
  static newPropertyDescriptors = [
    {
      name: 'startValue',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'endValue',
      isAudioParam: true,
      defaultValue: 2
    },
    {
      name: 'baseline',
      isAudioParam: true,
      defaultValue: 0
    }
  ];

  static processorName = 'ExponentialGeneratorProcessor';

  constructor() {
    super();
    this.baseline = null;
  }
}

export default ExponentialGenerator;