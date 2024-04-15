import Filter from './Filter.js';

class TwoZeroFilter extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'b0',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'scaling',
      passThrough: 'biquad',
      defaultValue: 1
    },
    {
      name: 'offset',
      passThrough: 'biquad',
      defaultValue: 0
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

  createNode() {
    super.createNode();
    this.biquad = this.createComponent({
      className: 'BiquadFilter',
      scaling: this.scaling,
      offset: this.offset,
      b0: {
        className: 'NodeOutput',
        node: this.node,
        outputIndex: 0
      },
      b1: {
        className: 'NodeOutput',
        node: this.node,
        outputIndex: 1
      },
      b2: {
        className: 'NodeOutput',
        node: this.node,
        outputIndex: 2
      },
      a0: 1,
      a1: 0,
      a2: 0
    });
    this.biquad.on();
  }

  cleanupNode() {
    if (this.biquad !== null) {
      this.biquad.off();
      this.biquad.cleanup();
      this.biquad = null;
    }
    super.cleanupNode();
  }

  getFirstNode() {
    return this.biquad.getFirstNode();
  }

  getNodeToFilter() {
    return this.biquad.getNodeToFilter();
  }
}

export default TwoZeroFilter;