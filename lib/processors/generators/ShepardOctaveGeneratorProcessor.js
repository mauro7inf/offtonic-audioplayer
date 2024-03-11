class ShepardOctaveGeneratorProcessor extends OfftonicAudioplayer.ShepardGeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'peakFrequency'
    }
  ];

  constructor(options) {
    super(options);
    this.lastPeak = NaN;
    this.peakFraction = NaN;
    this.logPeakFraction = NaN;
    this.logPeakFractionComplement = NaN;
  }

  generate() {
    let p = this.getParameter('peakFrequency', this.frame);
    if (p !== this.lastPeak) {
      this.updatePeak(p);
    }
    return super.generate();
  }

  updatePeak(p) {
    this.lastPeak = p;
    this.peakFraction = (Math.log(this.lastPeak) - this.constructor.logC0)/(this.constructor.logC10 - this.constructor.logC0);
    this.logPeakFraction = Math.log(this.peakFraction);
    this.logPeakFractionComplement = Math.log(1 - this.peakFraction);
  }

  calculateCoefficient(phi) {
    if (phi <= 0 || phi >= 1) {
      return 0;
    } else {
      let logC = this.peakFraction*Math.log(phi) + (1 - this.peakFraction)*Math.log(1 - phi) - this.peakFraction*this.logPeakFraction - (1 - this.peakFraction)*this.logPeakFractionComplement;
      return 0.25*Math.exp(5*logC);
    }
  }
}

OfftonicAudioplayer.registerProcessor('ShepardOctaveGeneratorProcessor', ShepardOctaveGeneratorProcessor);