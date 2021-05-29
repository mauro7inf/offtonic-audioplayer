import Generator from '../Generator.js';

class RedNoiseGenerator extends Generator {
  constructor(options) {
    super();
    this.timeConstant = null; // ms
    this.r = null; // y[n] = r*y[n - 1] + s*x[n]
    this.s = null; // s = sqrt(1 - r^2)
    this.sample = 2.0*Math.random() - 1.0;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(RedNoiseGenerator, options);
    this._updateRedNoiseGeneratorParameters();
  }

  _updateRedNoiseGeneratorParameters() {
    if (this.changed.timeConstant === 'set') {
      this.r = Math.exp(-Generator.mspa/this.timeConstant);
      this.s = Math.sqrt(1 - this.r*this.r);
    }
  }

  generate() {
    this.sample = this.r*this.sample + this.s*(2.0*Math.random() - 1.0);
    return this.sample;
  }
}

RedNoiseGenerator.properties = ['timeConstant'];

export default RedNoiseGenerator;