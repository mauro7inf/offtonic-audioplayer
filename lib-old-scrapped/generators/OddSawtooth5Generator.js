import FourierGenerator from './FourierGenerator.js';

class OddSawtooth5Generator extends FourierGenerator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    super.setOptions({fourierCoeffs: [1, 0, 1/3, 0, 1/5]});
  }
}

export default OddSawtooth5Generator;