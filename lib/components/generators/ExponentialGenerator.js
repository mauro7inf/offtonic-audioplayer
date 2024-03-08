import LinearGenerator from './LinearGenerator.js';

class ExponentialGenerator extends LinearGenerator {
  static newPropertyDescriptors = [
    {
      name: 'startValue',
      isProcessorOption: true,
      defaultValue: 1
    },
    {
      name: 'endValue',
      isProcessorOption: true,
      defaultValue: 2
    },
    {
      name: 'baseline',
      isProcessorOption: true,
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