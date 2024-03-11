class ExponentialSineOscillatorProcessor extends OfftonicAudioplayer.OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'baseline'
    },
    {
      name: 'minValue'
    },
    {
      name: 'maxValue'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let b = this.getParameter('baseline', this.frame);
    let min = this.getParameter('minValue', this.frame);
    let max = this.getParameter('maxValue', this.frame);

    let sign = 1;
    if (min < b) {
      sign = -1;
    }

    let minDiff = sign*(min - b);
    let maxDiff = sign*(max - b);
    let logMinDiff = Math.log(minDiff);
    let logMaxDiff = Math.log(maxDiff);
    let logCenter = (logMinDiff + logMaxDiff)/2;
    let logAmplitude = logCenter - logMinDiff; // this might need to be sign-adjusted

    let logValue = logCenter + logAmplitude*Math.sin(this.phase);
    return b + sign*Math.exp(logValue);
  }
}

OfftonicAudioplayer.registerProcessor('ExponentialSineOscillatorProcessor', ExponentialSineOscillatorProcessor);