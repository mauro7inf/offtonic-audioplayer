import GeneratorProcessor from './GeneratorProcessor.js';

class LinearGeneratorProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
    this.isAbsolute = options.processorOptions.isAbsolute;
    this.startTime = options.processorOptions.startTime;
    this.startValue = options.processorOptions.startValue;
    this.endTime = options.processorOptions.endTime;
    this.endValue = options.processorOptions.endValue;
    this.timesSet = this.isAbsolute;
  }

  generate() {
    let time = this.getParameter('timer', this.frame);
    if (!this.timesSet && time !== null) {
      this.startTime += time;
      this.endTime += time;
      this.timesSet = true;
    }
    if (time === null || time < this.startTime) {
      return this.startValue;
    } else if (time > this.endTime) {
      return this.endValue;
    } else {
      return this.startValue + (this.endValue - this.startValue)*(time - this.startTime)/(this.endTime - this.startTime);
    }
  }
}

registerProcessor('LinearGeneratorProcessor', LinearGeneratorProcessor);

export default LinearGeneratorProcessor;