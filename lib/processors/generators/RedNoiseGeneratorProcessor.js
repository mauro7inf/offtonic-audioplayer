class RedNoiseGeneratorProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.value = options.processorOptions.initialValue === null ? 2*Math.random() - 1 : options.processorOptions.initialValue;
  }

  generate() {
    let r = Math.exp(-this.getParameter('frequency', this.frame)/sampleRate);
    let s = Math.sqrt(1 - r*r);
    this.value = s*(2*Math.random() - 1) + r*this.value;
    return this.value;
  }
}

OfftonicAudioplayer.registerProcessor('RedNoiseGeneratorProcessor', RedNoiseGeneratorProcessor);