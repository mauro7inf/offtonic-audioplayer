import InharmonicGenerator from './InharmonicGenerator.js';

class FourierGenerator extends InharmonicGenerator {
  constructor() {
    super();
    this.multiples = [];
  }

  _calculateMultiples() {
    if (this.coeffs !== null) {
      let coeffsLength = this.getProperty('coeffs').length;
      if (coeffsLength > this.multiples.length) {
        for (let i = this.multiples.length; i < coeffsLength; i++) {
          this.multiples[i] = i + 1; // 
        }
      }
    }
  }

  _getMultiples(index) {
    this._calculateMultiples();
    if (index === undefined) {
      return this.multiples;
    } else {
      return this.multiples[index];
    }
  }
}

FourierGenerator.newProperties = [
  {
    name: 'multiples',
    getter: '_getMultiples',
    setter: null
  }
];
FourierGenerator.setupProperties();

export default FourierGenerator;