import Filter from './Filter.js';

class LinearFilter extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'memory',
      isProcessorOption: true,
      value: 0
    }
  ];

  static processorName = 'LinearFilterProcessor';

  constructor() {
    super();
    this.memory = null;
  }
}

export default LinearFilter;