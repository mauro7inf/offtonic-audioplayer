class GeneratorSequenceProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'generator'
    }
  ];

  constructor(options) {
    super(options);
    this.lastValue = 0;
    this.isHolding = false;
  }

  generate() {
    if (!this.isHolding) {
      this.lastValue = this.getParameter('generator', this.frame);
    }
    return this.lastValue;
  }

  receiveMessage(e) {
    super.receiveMessage(e);
    if ('hold' in e.data) {
      this.isHolding = true;
      this.port.postMessage({held: 'held'});
    }
    if ('unhold' in e.data) {
      this.isHolding = false;
    }
  }
}

OfftonicAudioplayer.registerProcessor('GeneratorSequenceProcessor', GeneratorSequenceProcessor);