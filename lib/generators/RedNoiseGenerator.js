import Generator from './Generator.js';

class RedNoiseGenerator extends Generator {
  constructor() {
    super();
    this.frequency = null;
    this.timeConstant = null;
  }

  update() {
    super.update();
    let r = Math.exp(-this.mspa*this.getProperty('frequency')/1000);
    let s = Math.sqrt(1 - r*r);
    this.value = s*(2*Math.random() - 1) + r*this.value;
  }
}

RedNoiseGenerator.newProperties = [
  {
    name: 'frequency',
    default: 440
  },
  {
    name: 'value'
  }
];
RedNoiseGenerator.setupProperties();

export default RedNoiseGenerator;