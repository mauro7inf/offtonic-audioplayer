class TwoZeroFilterDriverProcessor extends OfftonicAudioplayer.AudioComponentProcessor {
  static newParameterDescriptors = [
    {
      name: 'b0'
    },
    {
      name: 'radius'
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
        outputs[0][channel][frame] = this.getParameter('b0', frame);
        if (outputs[1].length > 0) {
          outputs[1][channel][frame] = this.calculateB1(frame);
        }
        if (outputs[2].length > 0) {
          outputs[2][channel][frame] = this.calculateB2(frame);
        }
      }
    }
    return !this.isDone();
  }

  calculateB1(frame) {
    let b0 = this.getParameter('b0', frame);
    let r = this.getParameter('radius', frame);
    let f = this.getParameter('frequency', frame);
    return -2*r*Math.cos(f*2*Math.PI/sampleRate)*b0;
  }

  calculateB2(frame) {
    let b0 = this.getParameter('b0', frame);
    let r = this.getParameter('radius', frame);
    return r*r*b0;
  }
}

OfftonicAudioplayer.registerProcessor('TwoZeroFilterDriverProcessor', TwoZeroFilterDriverProcessor);