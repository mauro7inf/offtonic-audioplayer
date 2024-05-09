import BiquadDriver from './BiquadDriver.js';

class LowShelfFilter extends BiquadDriver {
  static newPropertyDescriptors = [
    {
      name: 'boost',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 0
    }
  ];

  static numberOfInputs = 0; // filter itself has 1 input, but the node driving it has 0

  static numberOfOutputs = 4; // filter itself has 1 output, but the node driving it has 4

  static processorName = 'LowShelfFilterDriverProcessor';

  constructor() {
    super();
    this.boost = null;
    this.frequency = null;
  }

  coefficientMap() {
    return {
      b0: this.nodeOutputDefinition(2),
      b1: this.nodeOutputDefinition(3),
      b2: 0,
      a0: this.nodeOutputDefinition(0),
      a1: this.nodeOutputDefinition(1),
      a2: 0
    };
  }
}

export default LowShelfFilter;