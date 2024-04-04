import FirstOrderFilter from './FirstOrderFilter.js';

class BiquadFilter extends FirstOrderFilter {
  static newPropertyDescriptors = [
    {
      name: 'a2',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'b2',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'memory',
      isProcessorOption: true,
      value: 2
    }
  ];

  static processorName = 'BiquadFilterProcessor';

  constructor() {
    super();
    this.a2 = null;
    this.b2 = null;
  }
}

export default BiquadFilter;