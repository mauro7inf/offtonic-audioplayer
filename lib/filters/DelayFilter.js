import Filter from '../Filter.js';

class DelayFilter extends Filter {
  constructor(a0, b1) { // perhaps redo as biquad or even general linear filter
    super();
    this.a0 = a0;
    this.b1 = b1;
    this.last = 0;
  }

  generate(sample) {
    let s = this.a0*sample + this.b1*this.last;
    this.last = s;
    return s;
  }
}

export default DelayFilter;