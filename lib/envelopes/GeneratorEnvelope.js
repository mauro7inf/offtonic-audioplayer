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

GeneratorEnvelope.newProperties = [
  {
    name: 'isIndependent',
    default: false
  },
  {
    name: 'generator',
    default: {
      className: 'Oscillator'
    }
  }
];
GeneratorEnvelope.setupProperties();

export default GeneratorEnvelope;