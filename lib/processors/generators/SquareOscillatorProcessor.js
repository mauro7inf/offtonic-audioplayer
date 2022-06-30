class SquareOscillatorProcessor extends OfftonicAudioplayer.OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let k = this.getParameter('pulseWidth', this.frame);
    if (this.phase < k*2*Math.PI) {
      return 1;
    } else {
      return -1;
    }
  }
}

OfftonicAudioplayer.registerProcessor('SquareOscillatorProcessor', SquareOscillatorProcessor);