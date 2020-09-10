import Component from './Component.js';

class Filter extends Component {
  constructor(options) {
    super();
    this._setOptions(options);
  }

  generate(sample) {
    return sample;
  }
}

export default Filter;