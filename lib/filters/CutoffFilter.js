import Filter from '../Filter.js';

class CutoffFilter extends Filter {
  constructor(options) {
    super();
    this.low = null;
    this.high = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('low', options);
    this._initProperty('high', options);
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