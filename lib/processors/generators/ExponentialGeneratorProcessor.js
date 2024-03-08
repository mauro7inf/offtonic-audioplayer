class ExponentialGeneratorProcessor extends OfftonicAudioplayer.LinearGeneratorProcessor {
  constructor(options) {
    super(options);
    this.baseline = options.processorOptions.baseline;
    this.sign = 1;
    this.startLogDelta = 0;
    this.endLogDelta = 0;
    this.setupConstants();
  }

  setupConstants() {
    if (this.startValue < this.baseline) {
      this.sign = -1; // 1 otherwise
    }

    let startDelta = this.sign * (this.startValue - this.baseline);
    this.startLogDelta = Math.log(startDelta);
    let endDelta = this.sign * (this.endValue - this.baseline);
    this.endLogDelta = Math.log(endDelta);
  }

  interpolate(time) {
    let logDelta = this.startLogDelta + (this.endLogDelta - this.startLogDelta) * this.timeFraction(time);
    return this.baseline + this.sign * Math.exp(logDelta);
  }
}

OfftonicAudioplayer.registerProcessor('ExponentialGeneratorProcessor', ExponentialGeneratorProcessor);