import Generator from './Generator.js';

class Oscillator extends Generator {
  constructor(options) {
    super();
    this.frequency = null;;
    this.phase = Math.random()*2.0*Math.PI; // random phase to prevent things from lining up oddly
    this.phasor = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Oscillator, options);
    this._updateOscillatorParameters();
  }

  _updateOscillatorParameters() {
    if (this.phasor !== null && this.phasor !== undefined) {
      this.phasor.setOptions({
        phase: this.phase,
        frequency: this.frequency
      });
    }
  }

  update() {
    this.phase = this.phasor.generate();
  }

  generate() {
    this.update();
    return 0; // abstract class
  }
}

Oscillator.components = ['phasor'];
Oscillator.properties = ['frequency', 'phase'];

Oscillator.defaultOptions = {
  phasor: {
    className: 'LinearPhasor'
  }
};

export default Oscillator;