import Tuning from './Tuning.js';

class MeantoneTuning extends Tuning {
  static newPropertyDescriptors = [
    {
      name: 'octave',
      defaultValue: 1200,
      isAudioParam: true
    },
    {
      name: 'fifth',
      defaultValue: 700,
      isAudioParam: true
    }
  ];

  static processorName = 'MeantoneTuningProcessor';

  constructor() {
    super();
  }
}

export default MeantoneTuning;