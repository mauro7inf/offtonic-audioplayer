import Filter from './Filter.js';

class BiquadDriver extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'scaling',
      passThrough: 'biquad',
      defaultValue: 1
    },
    {
      name: 'offset',
      passThrough: 'biquad',
      defaultValue: 0
    }
  ];

  constructor() {
    super();
    this.biquad = null;
  }

  coefficientMap() {
    return {
      b0: 1,
      b1: 0,
      b2: 0,
      a0: 1,
      a1: 0,
      a2: 0
    };
  }

  createNode() {
    super.createNode();
    this.biquad = this.createComponent({
      className: 'BiquadFilter',
      scaling: this.scaling,
      offset: this.offset,
      b0: this.coefficientMap()['b0'],
      b1: this.coefficientMap()['b1'],
      b2: this.coefficientMap()['b2'],
      a0: this.coefficientMap()['a0'],
      a1: this.coefficientMap()['a1'],
      a2: this.coefficientMap()['a2']
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

export default BiquadDriver;