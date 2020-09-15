import TimedComponent from '../TimedComponent.js';

class GeneratorEnvelope extends TimedComponent {
  constructor() {
    super();
  }

  update() {
    super.update();
    this.value = this.getProperty('generator');
  }
}

GeneratorEnvelope.newProperties = {
  isIndependent: {
    default: false
  },
  generator: {
    default: {
      className: 'Oscillator'
    }
  }
};
GeneratorEnvelope.setupProperties();

export default GeneratorEnvelope;