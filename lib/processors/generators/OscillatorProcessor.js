class OscillatorProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.phase = options.processorOptions.initialPhase === null ? Math.random()*2*Math.PI : options.processorOptions.initialPhase;
  }

  generate() {
    let value = this.wave();
    this.updatePhase();
    return value;
  }

  updatePhase() {
    this.phase += this.getParameter('frequency', this.frame)*2*Math.PI/sampleRate;
    while (this.phase < 0) {
      this.phase += 2*Math.PI;
    }
    while (this.phase >= 2*Math.PI) {
      this.phase -= 2*Math.PI;
    }
  }

  wave() {
    return 0;
  }
}

OfftonicAudioplayer.registerProcessor('OscillatorProcessor', OscillatorProcessor);