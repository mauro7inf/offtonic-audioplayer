import GeneratorProcessor from './GeneratorProcessor.js';

class LinearGeneratorProcessor extends GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.startTime = options.processorOptions.startTime;
    this.startValue = options.processorOptions.startValue;
    this.endTime = options.processorOptions.endTime;
    this.endValue = options.processorOptions.endValue;
  }

  generate() {
    let time = this.getParameter('timer', this.frame);
    if (time < this.startTime) {
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