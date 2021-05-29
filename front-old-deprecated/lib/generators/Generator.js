import AudioComponent from '../AudioComponent.js';

class Generator extends AudioComponent {
  constructor() {
    super();
    this.coeff = null;
    this.offset = null;
  }

  transform(x) {
    return x*this.getProperty('coeff') + this.getProperty('offset');
  }

  generate() {
    return this.transform(super.generate());
  }
}

Generator.newProperties = { // TODO replace with filter
  coeff: {
    default: 1
  },
  offset: {
    default: 0
  }
};
Generator.setupProperties();

export default Generator;