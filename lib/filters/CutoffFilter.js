import Filter from '../Filter.js';

class CutoffFilter extends Filter {
  constructor(low, high) {
    super();
    this.low = low;
    this.high = high;
  }

  generate(sample) {
    let s = sample;
    if (s > this.high) {
      s = this.high;
    } else if (s < this.low) {
      s = this.low;
    }
    s = -1.0 + 2.0*(s - this.low)/(this.high - this.low);
    return s;
  }
}

export default CutoffFilter;