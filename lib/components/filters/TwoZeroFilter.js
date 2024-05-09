import BiquadDriver from './BiquadDriver.js';

class TwoZeroFilter extends BiquadDriver {
  static newPropertyDescriptors = [
    {
      name: 'b0',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'radius',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'frequency',
      isAudioParam: true,
      defaultValue: 0
    }
  ];

  static numberOfInputs = 0; // filter itself has 1 input, but the node driving it has 0

  static numberOfOutputs = 3; // filter itself has 1 output, but the node driving it has 3

  static processorName = 'TwoZeroFilterDriverProcessor';

  constructor() {
    super();
    this.radius = null;
    this.frequency = null;
    this.biquad = null;
  }

  coefficientMap() {
    return {
      b0: this.nodeOutputDefinition(0),
      b1: this.nodeOutputDefinition(1),
      b2: this.nodeOutputDefinition(2),
      a0: 1,
      a1: 0,
      a2: 0
    };
  }
}

export default TwoZeroFilter;