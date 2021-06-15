import GeneratorProcessor from './GeneratorProcessor.js';

class WhiteNoiseGeneratorProcessor extends GeneratorProcessor {
  constructor() {
    super();
  }

  generate() {
    return 2*Math.random() - 1;
  }
}

registerProcessor('WhiteNoiseGeneratorProcessor', WhiteNoiseGeneratorProcessor);

export default WhiteNoiseGeneratorProcessor;