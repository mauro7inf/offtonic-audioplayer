import InharmonicGenerator from './InharmonicGenerator.js';

const C0 = 440/Math.pow(2, 4.75); // lowest possible frequency
const C10 = 1024*C0; // C0 <= frequency < C10

class ShepardGenerator extends InharmonicGenerator {
  constructor() {
    super();
    this.ratio = null;
    this.shepardFunction = null;
    this.reducedFrequency = null;
    this.lastFrequency = null;
    this.lastReducedFrequency = null;
    this.lastRatio = null;
  }

  _calculateParameters() {
    let ratio = this.getProperty('ratio');
    let frequency = this.getProperty('frequency');
    if (ratio !== this.lastRatio || frequency !== this.lastFrequency) {
      this.lastRatio = ratio;
      this.lastFrequency = frequency;
      this.reducedFrequency = frequency/Math.pow(ratio, Math.floor(Math.log(frequency/C0)/Math.log(ratio)));
      this.multiples = [this.reducedFrequency/frequency];
      while (this.multiples[this.multiples.length - 1]*ratio*frequency < C10) {
        this.multiples.push(this.multiples[this.multiples.length - 1]*ratio);
      }

      while (this.phases.length < this.multiples.length) {
        this.phases.push(Math.random()*2*Math.PI);
      }
      while (this.phases.length > this.multiples.length) {
        this.phases.pop();
      }

      if (this.lastReducedFrequency !== null) {
        // move phases
        let delta = Math.pow(ratio, 1/10);
        let change = this.reducedFrequency/this.lastReducedFrequency;
        if (change < delta/ratio) { // went over the top of the range and to the other side
          this.phases.unshift(this.phases.pop());
        } else if (change > ratio/delta) { // went under the bottom of the range and to the other side
          this.phases.push(this.phases.shift());
        }
      }
      this.lastReducedFrequency = this.reducedFrequency;
    }
  }

  _calculateCoeffs() { // has to be run every time step in case the function has changed, since we can't easily check for that
    this.coeffs = [];
    for (let i = 0; i < this.multiples.length; i++) {
      let x = Math.log(this.multiples[i]*this.getProperty('frequency')/C0)/(10*Math.log(2));
      this.coeffs[i] = this.shepardFunction.call(this, x);
    }
  }

  _getCoeffs(index) {
    this._calculateParameters();
    this._calculateCoeffs();
    if (index === undefined) {
      return this.coeffs;
    } else {
      return this.coeffs[index];
    }
  }

  _getMultiples(index) {
    this._calculateParameters();
    if (index === undefined) {
      return this.multiples;
    } else {
      return this.multiples[index];
    }
  }

  _setShepardFunction(func) {
    this.cleanupProperty('shepardFunction');
    if (func === null || func === undefined) {
      this.shepardFunction = this.getShepardFunction();
    } else {
      this.shepardFunction = func;
    }
  }

  getShepardFunction() {
    return (x => Math.sin(Math.PI*x));
  }
}

ShepardGenerator.newProperties = [
  {
    name: 'coeffs',
    getter: '_getCoeffs',
    setter: null
  },
  {
    name: 'multiples',
    getter: '_getMultiples',
    setter: null
  },
  {
    name: 'ratio',
    default: 2
  },
  {
    name: 'shepardFunction',
    setter: `_setShepardFunction`,
    default: null
  }
];
ShepardGenerator.setupProperties();

export default ShepardGenerator;