import FourierGenerator from './FourierGenerator.js';

class FourierSawtoothGenerator extends FourierGenerator { // TODO: get phases lined up correctly?
  constructor() {
    super();
    this.coeffs = [];
    this.wasOddOnly = null;
  }

  _calculateCoeffs() {
    let terms = Math.max(Math.floor(this.getProperty('terms')), 0);
    let isOddOnly = this.getProperty('isOddOnly');
    if (isOddOnly !== this.wasOddOnly || this.coeffs.length !== terms) {
      this.wasOddOnly = isOddOnly;
      this.coeffs = [];
      for (let i = 0; i < terms; i++) {
        if (i % 2 === 0 || !isOddOnly) { // i is the array element, but the odd harmonics are elements 0, 2, 4, etc.
          this.coeffs[i] = 1/(i + 1);
        } else {
          this.coeffs[i] = 0;
        }
      }
    }
  }

  _getCoeffs(index) {
    this._calculateCoeffs();
    if (index === undefined) {
      return this.coeffs;
    } else {
      return this.coeffs[index];
    }
  }
}

FourierSawtoothGenerator.newProperties = [
  {
    name: 'coeffs',
    getter: '_getCoeffs',
    setter: null
  },
  {
    name: 'isOddOnly',
    default: false
  },
  {
    name: 'terms',
    default: 5
  }
];
FourierSawtoothGenerator.setupProperties();

export default FourierSawtoothGenerator;