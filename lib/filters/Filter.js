import Component from '../Component.js';

class Filter extends Component {
  constructor() {
    super();
    this.nextFilter = null;
  }

  _filter(value) {
    return value;
  }

  filter(value) {
    let filteredValue = this._filter(value);
    if (this.nextFilter !== null) {
      filteredValue = this.getProperty('nextFilter').filter(filteredValue);
    }
    return filteredValue;
  }
}

Filter.newProperties = {
  nextFilter: {
    default: null
  }
};
Filter.setupProperties();

export default Filter;