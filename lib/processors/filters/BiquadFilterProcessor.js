class BiquadFilterProcessor extends OfftonicAudioplayer.FirstOrderFilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'a2'
    },
    {
      name: 'b2'
    }
  ];

  constructor(options) {
    super(options);
  }

  getFeedbackCoefficients(frame) {
    return [this.getParameter('a0', frame), this.getParameter('a1', frame), this.getParameter('a2', frame)];
  }

  getFeedforwardCoefficients(frame) {
    return [this.getParameter('b0', frame), this.getParameter('b1', frame), this.getParameter('b2', frame)];
  }
}

OfftonicAudioplayer.registerProcessor('BiquadFilterProcessor', BiquadFilterProcessor);