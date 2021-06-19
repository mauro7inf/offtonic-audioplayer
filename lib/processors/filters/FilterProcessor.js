import AudioComponentProcessor from '../AudioComponentProcessor.js';

class FilterProcessor extends AudioComponentProcessor {
  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    for (let frame = 0; frame < output[0].length; frame++) {
      for (let channel = 0; channel < output.length; channel++) {
        if (this.inputs[0].length > 0) {
          output[channel][frame] = this.filter(this.inputs[0][channel][frame], frame, channel);
        }
      }
    }
    return !this.isDone();
  }

  filter(input, frame, channel) {
    return input;
  }
}

registerProcessor('FilterProcessor', FilterProcessor);

export default FilterProcessor;