import Filter from './Filter.js';

class CutoffFilter extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'highCutoff',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'lowCutoff',
      isAudioParam: true,
      defaultValue: -1
    },
    {
      name: 'isNormalized',
      isProcessorOption: true, // TODO make this changeable
      defaultValue: true
    }
  ];

  static processorName = 'CutoffFilterProcessor';

  constructor() {
    super();
    this.highCutoff = null;
    this.lowCutoff = null;
    this.isNormalized = null;
  }
}

export default CutoffFilter;