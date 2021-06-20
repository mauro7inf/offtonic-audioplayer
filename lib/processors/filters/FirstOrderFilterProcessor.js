import LinearFilterProcessor from './LinearFilterProcessor.js';

class FirstOrderFilterProcessor extends LinearFilterProcessor {
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
  }

  getFeedbackCoefficients(frame) {
    return [this.getParameter('a0', frame), this.getParameter('a1', frame)];
  }

  getFeedforwardCoefficients(frame) {
    return [this.getParameter('b0', frame), this.getParameter('b1', frame)];
  }
}

registerProcessor('FirstOrderFilterProcessor', FirstOrderFilterProcessor);

export default FirstOrderFilterProcessor;