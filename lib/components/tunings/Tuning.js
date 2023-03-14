import Playable from '../Playable.js';

class Tuning extends Playable {
  static newPropertyDescriptors = [
    {
      name: 'tuningName',
      defaultValue: null,
      isProcessorOption: true
    }
  ];

  static processorName = 'TuningProcessor';

  constructor() {
    super();
  }

  getTuningName() {
    return this.getProperty('tuningName');
  }
}

export default Tuning;