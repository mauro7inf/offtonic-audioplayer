import Component from './Component.js';

class Amplifier extends Component {
  constructor(options) {
    super();
    this.amplitude = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Amplifier, options);
  }

  update() {
    // doesn't need to do anything
  }

  generate() {
    this.update();
    return this.amplitude;
  }
}

Amplifier.properties = ['amplitude'];

export default Amplifier;