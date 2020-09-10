import Component from './Component.js';

class Generator extends Component {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  generate() {
    return 0; // abstract class
  }
}

Generator.mspa = null;

export default Generator;