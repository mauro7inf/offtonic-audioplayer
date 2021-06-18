import AudioComponentProcessor from '../AudioComponentProcessor.js';

class MultiplierProcessor extends AudioComponentProcessor {
  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    if (this.inputs[0].length > 0 && this.inputs[1].length > 0) {
      for (let channel = 0; channel < output.length; channel++) {
        for (let i = 0; i < output[channel].length; i++) {
          output[channel][i] = this.inputs.length > 0 ? 1 : 0;
          for (let input = 0; input < this.inputs.length; input++) {
            output[channel][i] *= this.inputs[input][channel][i];
          }
        }
      }
    }
    return !this.isDone();
  }
}

registerProcessor('MultiplierProcessor', MultiplierProcessor);