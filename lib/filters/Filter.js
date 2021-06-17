import AudioComponent from '../AudioComponent.js';

class Filter extends AudioComponent {
  static numberOfInputs = 1;

  static processorName = 'FilterProcessor';

  constructor() {
    super();
  }
}

export default Filter;