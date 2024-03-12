class LinearGeneratorProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'startValue'
    },
    {
      name: 'endValue'
    }
  ];

  constructor(options) {
    super(options);
    this.isAbsolute = options.processorOptions.isAbsolute;
    this.startTime = options.processorOptions.startTime;
    this.endTime = options.processorOptions.endTime;
    this.timesSet = this.isAbsolute;
  }

  generate() {
    let time = this.getParameter('timer', this.frame);
    if (!this.timesSet && time !== null) {
      this.startTime += time;
      this.endTime += time;
      this.timesSet = true;
    }
    if (time === null || time <= this.startTime) {
      return this.getParameter('startValue', this.frame);
    } else if (time >= this.endTime) {
      return this.getParameter('endValue', this.frame);
    } else {
      return this.interpolate(time);
    }
  }

  interpolate(time) {
    let startValue = this.getParameter('startValue', this.frame);
    let endValue = this.getParameter('endValue', this.frame);
    return startValue + (endValue - startValue)*this.timeFraction(time);
  }

  timeFraction(time) {
    return (time - this.startTime)/(this.endTime - this.startTime);
  }
}

OfftonicAudioplayer.registerProcessor('LinearGeneratorProcessor', LinearGeneratorProcessor);