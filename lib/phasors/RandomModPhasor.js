import Phasor from '../Phasor.js';

class RandomModPhasor extends Phasor {
  constructor(options) {
    super();
    this.randomness = null;
    this._setOptions(options)
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('randomness', options, RandomModPhasor.defaultOptions.randomness);
  }

  update() {
    this.phase += (1 + this.randomness*(2*Math.random() - 1))*Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

RandomModPhasor.defaultOptions = {
  randomness: 0.15
}

export default RandomModPhasor;