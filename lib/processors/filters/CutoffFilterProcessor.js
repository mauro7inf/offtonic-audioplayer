import FilterProcessor from './FilterProcessor.js';

class CutoffFilterProcessor extends FilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'highCutoff'
    },
    {
      name: 'lowCutoff'
    }
  ];

  constructor(options) {
    super(options);
    this.isNormalized = options.processorOptions.isNormalized;
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
    if (input > high) {
      output = high;
    } else if (input < low) {
      output = low;
    }
    if (this.isNormalized) {
      output = (output - (high + low)/2)*(2/(high - low));
    }
    return output;
  }
}

registerProcessor('CutoffFilterProcessor', CutoffFilterProcessor);

export default CutoffFilterProcessor;