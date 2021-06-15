import GeneratorProcessor from './GeneratorProcessor.js';

class WhiteNoiseGeneratorProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
  }

  generate() {
    return 2*Math.random() - 1;
  }
}

registerProcessor('WhiteNoiseGeneratorProcessor', WhiteNoiseGeneratorProcessor);

export default WhiteNoiseGeneratorProcessor;