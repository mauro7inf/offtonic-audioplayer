import GeneratorProcessor from './GeneratorProcessor.js';

class SineOscillatorProcessor extends GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.phase = options.processorOptions.initialPhase === null ? Math.random()*2*Math.PI : options.processorOptions.initialPhase;
  }

  generate(frame) {
    let value = Math.sin(this.phase);
    this.phase += this.getParameter('frequency', frame)*2*Math.PI/sampleRate;
    while (this.phase < 0) {
      this.phase += 2*Math.PI;
    }
    while (this.phase >= 2*Math.PI) {
      this.phase -= 2*Math.PI;
    }
    return value;
  }
}

registerProcessor('SineOscillatorProcessor', SineOscillatorProcessor);