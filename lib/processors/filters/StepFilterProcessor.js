import FilterProcessor from './FilterProcessor.js';

class StepFilterProcessor extends FilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'steps'
    },
    {
      name: 'highCutoff'
    },
    {
      name: 'lowCutoff'
    }
  ];

  constructor(options) {
    super(options);
  }

  filter(input, frame, channel) {
    let output = input;
    let high = this.getParameter('highCutoff', frame);
    let low = this.getParameter('lowCutoff', frame);
    if (high < low) {
      let temp = high;
      high = low;
      low = temp;
    }
    let width = high - low;
    let steps = this.getParameter('steps', frame);
    if (steps <= 1) {
      return (high + low)/2;
    }
    // divide the range into n slices
    let sliceWidth = width/steps;
    let sliceIndex = Math.floor((input - low)/sliceWidth)
    if (input === high) { // don't count top edge as belonging to the first slice out of the range
      sliceIndex--;
    }
    output = low + sliceIndex*(width/(steps - 1));

    return output;
  }
}

registerProcessor('StepFilterProcessor', StepFilterProcessor);

export default StepFilterProcessor;