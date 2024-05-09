import BiquadDriver from './BiquadDriver.js';

class TwoPoleFilter extends BiquadDriver {
  static newPropertyDescriptors = [
    {
      name: 'b0',
      passThrough: 'biquad',
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

  static numberOfOutputs = 2; // filter itself has 1 output, but the node driving it has 2

  static processorName = 'TwoPoleFilterDriverProcessor';

  constructor() {
    super();
    this.radius = null;
    this.frequency = null;
  }

  coefficientMap() {
    return {
      b0: this.b0,
      b1: 0,
      b2: 0,
      a0: 1,
      a1: this.nodeOutputDefinition(0),
      a2: this.nodeOutputDefinition(1)
    };
  }
}

export default TwoPoleFilter;