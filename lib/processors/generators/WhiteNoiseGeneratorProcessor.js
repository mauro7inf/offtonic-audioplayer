class WhiteNoiseGeneratorProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  constructor(options) {
    super(options);
  }

  generate() {
    return 2*Math.random() - 1;
  }
}

OfftonicAudioplayer.registerProcessor('WhiteNoiseGeneratorProcessor', WhiteNoiseGeneratorProcessor);