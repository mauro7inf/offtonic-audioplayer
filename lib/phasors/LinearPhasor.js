import Phasor from '../Phasor.js';

class LinearPhasor extends Phasor {
  constructor(phase, frequency) {
    super(phase, frequency);
  }

  update() {
    this.phase += Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

export default LinearPhasor;