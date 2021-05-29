import Phasor from '../Phasor.js';

class GeneratorModPhasor extends Phasor {
  constructor(options) {
    super();
    this.generator = null;
    this.amplitude = null;
    this._setOptions(options)
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(GeneratorModPhasor, options);
  }

  update() {
    this.phase += (1 + this.amplitude*this.generator.generate())*Math.PI*this.frequency*Phasor.mspa/500.0;
    this.correctPhase();
  }
}

GeneratorModPhasor.components = ['generator'];
GeneratorModPhasor.properties = ['amplitude'];

GeneratorModPhasor.defaultOptions = {
  generator: {
    className: 'SineGenerator',
    frequency: 3
  },
  amplitude: 0.15
}

export default GeneratorModPhasor;