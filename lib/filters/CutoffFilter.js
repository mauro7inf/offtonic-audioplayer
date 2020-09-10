import Filter from './Filter.js';

class CutoffFilter extends Filter {
  constructor() {
    super();
    this.low = null;
    this.high = null;
    this.isNormalized = null;
  }

  _filter(value) {
    let high = this.getProperty('high');
    let low = this.getProperty('low');
    let filtered = value;
    if (value < low) {
      filtered = low;
    }
    if (value > high) {
      filtered = high;
    }
    if (this.getProperty('isNormalized')) {
      filtered = (filtered - (high + low)/2)*2/(high - low);
    }
    return filtered;
  }
}

CutoffFilter.newProperties = [
  {
    name: 'low',
    default: -1
  },
  {
    name: 'high',
    default: 1
  },
  {
    name: 'isNormalized',
    default: true
  }
];
CutoffFilter.setupProperties();

export default CutoffFilter;