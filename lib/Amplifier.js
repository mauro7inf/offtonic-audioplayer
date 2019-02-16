import Component from './Component.js';

class Amplifier extends Component {
  constructor(options) {
    super();
    this.amplitude = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('amplitude', options);
  }

  update() {
    // doesn't need to do anything
  }

  generate() {
    this.update();
    return this.amplitude;
  }
}

export default Amplifier;