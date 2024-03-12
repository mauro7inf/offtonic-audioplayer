class ExponentialGeneratorProcessor extends OfftonicAudioplayer.LinearGeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'baseline'
    }
  ];

  constructor(options) {
    super(options);
  }

  interpolate(time) {
    let startValue = this.getParameter('startValue', this.frame);
    let endValue = this.getParameter('endValue', this.frame);
    let baseline = this.getParameter('baseline', this.frame);

    let sign = 1;
    if (startValue < baseline) {
      sign = -1;
    }

    let startDelta = sign * (startValue - baseline);
    let endDelta = sign * (endValue - baseline);
    let logStartDelta = Math.log(startDelta);
    let logEndDelta = Math.log(endDelta);
    let logDelta = logStartDelta + (logEndDelta - logStartDelta) * this.timeFraction(time);
    return baseline + sign * Math.exp(logDelta);
  }
}

OfftonicAudioplayer.registerProcessor('ExponentialGeneratorProcessor', ExponentialGeneratorProcessor);