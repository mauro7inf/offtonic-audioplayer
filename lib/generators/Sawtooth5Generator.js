import FourierGenerator from './FourierGenerator.js';

class Sawtooth5Generator extends FourierGenerator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    super.setOptions({fourierCoeffs: [1, 1/2, 1/3, 1/4, 1/5]});
  }
}

export default Sawtooth5Generator;