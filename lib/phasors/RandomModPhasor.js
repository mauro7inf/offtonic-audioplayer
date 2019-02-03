import Phasor from '../Phasor.js';

class RandomModPhasor extends Phasor {
  constructor(randomness, phase, frequency) {
    super(phase, frequency);
    this.randomness = randomness;
  }

  update() {
    this.phase += (1 + this.randomness*(2*Math.random() - 1))*Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

export default RandomModPhasor;