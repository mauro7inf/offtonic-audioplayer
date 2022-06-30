class SineOscillatorProcessor extends OfftonicAudioplayer.OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let normalizedPhase = this.phase;
    let k = this.getParameter('pulseWidth', this.frame);
    if (k !== 0.5) {
      if (this.phase < k*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*this.phase;
      } else if (this.phase > (2 - k)*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*(this.phase - 2*Math.PI) + 2*Math.PI;
      } else {
        normalizedPhase = (1/(2 - 2*k))*(this.phase - Math.PI) + Math.PI;
      }
    }
    return Math.sin(normalizedPhase);
  }
}

OfftonicAudioplayer.registerProcessor('SineOscillatorProcessor', SineOscillatorProcessor);