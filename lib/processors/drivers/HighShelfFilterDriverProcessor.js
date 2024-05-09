class HighShelfFilterDriverProcessor extends OfftonicAudioplayer.AudioComponentProcessor {
  static newParameterDescriptors = [
    {
      name: 'boost'
    },
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
  }

  _process(outputs) {
    for (let frame = 0; frame < outputs[0][0].length; frame++) {
      for (let channel = 0; channel < outputs[0].length; channel++) {
        let k = this.calculateK(frame);
        let b = this.getParameter('boost', frame);
        outputs[0][channel][frame] = this.calculateA0(b, k);
        if (outputs[1].length > 0) {
          outputs[1][channel][frame] = this.calculateA1(b, k);
        }
        if (outputs[2].length > 0) {
          outputs[2][channel][frame] = this.calculateB0(b, k);
        }
        if (outputs[3].length > 0) {
          outputs[3][channel][frame] = this.calculateB1(b, k);
        }
      }
    }
    return !this.isDone();
  }

  calculateK(frame) {
    let f = this.getParameter('frequency', frame);
    return Math.tan(Math.PI*f/sampleRate);
  }

  calculateB0(b, k) {
    return b + k;
  }

  calculateB1(b, k) {
    return -(b - k);
  }

  calculateA0(b, k) {
    return 1 + k
  }

  calculateA1(b, k) {
    return -(1 - k);
  }
}

OfftonicAudioplayer.registerProcessor('HighShelfFilterDriverProcessor', HighShelfFilterDriverProcessor);