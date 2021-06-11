import AudioComponentProcessor from './AudioComponentProcessor.js';

class GeneratorProcessor extends AudioComponentProcessor {
  constructor(options) {
    super(options);
    this.frame = 0;
  }

  _process(outputs) {
    const output = outputs[0];
    for (let i = 0; i < output[0].length; i++) {
      this.frame = i;
      let value = this.generate();
      for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
        output[channelIndex][i] = value;
      }
    }
    return !this.isDone();
  }

  generate() {
    return 0;
  }
}

export default GeneratorProcessor;