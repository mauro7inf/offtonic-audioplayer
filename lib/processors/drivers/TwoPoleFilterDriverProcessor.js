class TwoPoleFilterDriverProcessor extends OfftonicAudioplayer.AudioComponentProcessor {
  static newParameterDescriptors = [
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
        outputs[0][channel][frame] = this.calculateA1(frame);
        if (outputs[1].length > 0) {
          outputs[1][channel][frame] = this.calculateA2(frame);
        }
      }
    }
    return !this.isDone();
  }

  calculateA1(frame) {
    let r = this.getParameter('radius', frame);
    let f = this.getParameter('frequency', frame);
    return -2*r*Math.cos(f*2*Math.PI/sampleRate)
  }

  calculateA2(frame) {
    let r = this.getParameter('radius', frame);
    return r*r;
  }
}

OfftonicAudioplayer.registerProcessor('TwoPoleFilterDriverProcessor', TwoPoleFilterDriverProcessor);