import AudioComponentProcessor from './AudioComponentProcessor.js';

class GeneratorProcessor extends AudioComponentProcessor {
  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    for (let i = 0; i < output[0].length; i++) {
      let value = this.generate(i);
      for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
        output[channelIndex][i] = value;
      }
    }
    return true;
  }

  // frame here is needed since a parameter might be needed and we need to know the parameter's frame
  generate(frame) {
    return 0;
  }
}

export default GeneratorProcessor;