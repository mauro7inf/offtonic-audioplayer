import FilterProcessor from './FilterProcessor.js';

class LinearFilterProcessor extends FilterProcessor {
  constructor(options) {
    super(options);
    this.memory = options.processorOptions.memory;
    this.lastInputs = []; // array index is channel index; value is array of last inputs
    this.lastOutputs = []; // array index is channel index; value is array of last outputs
  }

  filter(input, frame, channel) {
    this.prefillMemory(channel);
    let feedbackCoefficients = this.getFeedbackCoefficients(frame);
    let feedforwardCoefficients = this.getFeedforwardCoefficients(frame);
    let output = feedforwardCoefficients[0]*input;
    for (let i = 1; i < feedforwardCoefficients.length && i < this.memory + 1; i++) {
      output += feedforwardCoefficients[i]*this.lastInputs[channel][i - 1];
    }
    for (let i = 1; i < feedbackCoefficients.length && i < this.memory + 1; i++) {
      output -= feedbackCoefficients[i]*this.lastOutputs[channel][i - 1];
    }
    output /= feedbackCoefficients[0];
    if (!isFinite(output)) {
      output = 0;
    }
    this.addToMemory(input, output, channel);
    return output;
  }

  getFeedbackCoefficients(frame) {
    return [1];
  }

  getFeedforwardCoefficients(frame) {
    return [1];
  }

  prefillMemory(channel) {
    while (this.lastInputs.length <= channel) {
      let newInputs = [];
      for (let i = 0; i < this.memory; i++) {
        newInputs[i] = 0;
      }
      this.lastInputs.push(newInputs);
    }
    while (this.lastOutputs.length <= channel) {
      let newOutputs = [];
      for (let i = 0; i < this.memory; i++) {
        newOutputs[i] = 0;
      }
      this.lastOutputs.push(newOutputs);
    }
  }

  addToMemory(input, output, channel) {
    if (this.memory > 0) {
      this.lastInputs[channel].pop();
      this.lastInputs[channel].unshift(input);
      this.lastOutputs[channel].pop();
      this.lastOutputs[channel].unshift(output);
    }
  }
}

registerProcessor('LinearFilterProcessor', LinearFilterProcessor);

export default LinearFilterProcessor;