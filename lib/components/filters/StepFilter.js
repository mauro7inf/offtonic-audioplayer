import Filter from './Filter.js';

class StepFilter extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'steps',
      isAudioParam: true,
      defaultValue: Math.pow(2, 23)
    },
    {
      name: 'highCutoff',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'lowCutoff',
      isAudioParam: true,
      defaultValue: -1
    }
  ];

  static processorName = 'StepFilterProcessor';

  constructor() {
    super();
    this.steps = null;
    this.highCutoff = null;
    this.lowCutoff = null;
  }
}

export default StepFilter;