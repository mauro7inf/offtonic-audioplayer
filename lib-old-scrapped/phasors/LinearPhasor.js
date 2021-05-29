import Phasor from '../Phasor.js';

class LinearPhasor extends Phasor {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  update() {
    this.phase += Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

export default LinearPhasor;