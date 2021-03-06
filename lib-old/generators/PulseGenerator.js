import Oscillator from '../Oscillator.js';

class PulseGenerator extends Oscillator {
  constructor(options) {
    super();
    this.pulseWidth = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(PulseGenerator, options);
  }

  generate() {
    let sample = (this.phase < this.pulseWidth*Math.PI) ? 1.0 : -1.0;
    this.update();
    return sample;
  }
}

PulseGenerator.properties = ['pulseWidth'];

PulseGenerator.defaultOptions = {
  pulseWidth: 0.8
};

export default PulseGenerator;