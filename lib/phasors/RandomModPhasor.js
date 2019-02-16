import Phasor from '../Phasor.js';

class RandomModPhasor extends Phasor {
  constructor(options) {
    super();
    this.randomness = null;
    this._setOptions(options)
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(RandomModPhasor, options);
  }

  update() {
    this.phase += (1 + this.randomness*(2*Math.random() - 1))*Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

RandomModPhasor.properties = ['randomness'];

RandomModPhasor.defaultOptions = {
  randomness: 0.15
}

export default RandomModPhasor;