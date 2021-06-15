import AudioComponent from '../AudioComponent.js';

class WhiteNoiseGenerator extends AudioComponent {
  static processorName = 'WhiteNoiseGeneratorProcessor';
  
  constructor() {
    super();
  }
}

export default WhiteNoiseGenerator;