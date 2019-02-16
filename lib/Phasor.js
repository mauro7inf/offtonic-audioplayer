import Component from './Component.js';

class Phasor extends Component {
  constructor(options) {
    super();
    this.phase = null;
    this.frequency = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Phasor, options);
  }

  update() {
    this.correctPhase();
  }

  generate() {
    this.update();
    return this.phase;
  }

  correctPhase() {
    while (this.phase > 2*Math.PI) {
      this.phase -= 2*Math.PI;
    }
    while (this.phase < 0) {
      this.phase += 2*Math.PI;
    }
  }
}

Phasor.properties = ['frequency', 'phase'];

Phasor.mspa = null;

export default Phasor;