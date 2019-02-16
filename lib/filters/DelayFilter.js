import Filter from '../Filter.js';

class DelayFilter extends Filter {
  constructor(options) { // perhaps redo as biquad or even general linear filter, but definitely rename to something more obvious
    super();
    this.a0 = null;
    this.b1 = null;
    this.last = 0;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('a0', options);
    this._initProperty('b1', options);
  }

  generate(sample) {
    let s = this.a0*sample + this.b1*this.last;
    this.last = s;
    return s;
  }
}

export default DelayFilter;