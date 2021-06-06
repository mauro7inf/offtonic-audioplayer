import AudioComponentProcessor from './AudioComponentProcessor.js';

class ToneProcessor extends AudioComponentProcessor {
  static newParameterDescriptors = [
    {
      name: 'gain'
    }
  ];

  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    if (this.inputs[0].length > 0 && this.inputs[1].length > 0) {
      for (let channel = 0; channel < output.length; channel++) {
        for (let i = 0; i < output[channel].length; i++) {
          output[channel][i] = this.inputs[0][channel][i] * this.inputs[1][channel][i] * this.getParameter('gain', i);
        }
      }
    }
    return true;
  }
}

registerProcessor('ToneProcessor', ToneProcessor);