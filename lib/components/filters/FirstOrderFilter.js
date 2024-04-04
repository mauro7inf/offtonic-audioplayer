import LinearFilter from './LinearFilter.js';

class FirstOrderFilter extends LinearFilter {
  static newPropertyDescriptors = [
    {
      name: 'a0',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'a1',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'b0',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'b1',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'memory',
      isProcessorOption: true,
      value: 1
    }
  ];

  static processorName = 'FirstOrderFilterProcessor';

  constructor() {
    super();
    this.a0 = null;
    this.a1 = null;
    this.b0 = null;
    this.b1 = null;
  }
}

export default FirstOrderFilter;