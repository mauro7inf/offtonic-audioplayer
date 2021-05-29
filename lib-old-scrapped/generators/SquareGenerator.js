import PulseGenerator from './PulseGenerator.js';

class SquareGenerator extends PulseGenerator {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    super.setOptions({pulseWidth: 1.0});
  }
}

export default SquareGenerator;