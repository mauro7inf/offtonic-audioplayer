import Filter from './Filter.js';

class FirstOrderFilter extends Filter {
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