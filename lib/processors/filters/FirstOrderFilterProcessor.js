import FilterProcessor from './FilterProcessor.js';

class FirstOrderFilterProcessor extends FilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'a0'
    },
    {
      name: 'a1'
    },
    {
      name: 'b0'
    },
    {
      name: 'b1'
    }
  ];

  constructor(options) {
    super(options);
    this.lastInputs = []; // array index is channel index
    this.lastOutputs = []; // array index is channel index
  }

  filter(input, frame, channel) {
    while (this.lastInputs.length <= channel) {
      this.lastInputs.push(0);
    }
    while (this.lastOutputs.length <= channel) {
      this.lastOutputs.push(0);
    }
    let output = (this.getParameter('b0', frame)*input + this.getParameter('b1', frame)*this.lastInputs[channel] -
      this.getParameter('a1', frame)*this.lastOutputs[channel])/this.getParameter('a0', frame);
    this.lastInputs[channel] = input;
    this.lastOutputs[channel] = output;
    return output;
  }
}

registerProcessor('FirstOrderFilterProcessor', FirstOrderFilterProcessor);

export default FirstOrderFilterProcessor;