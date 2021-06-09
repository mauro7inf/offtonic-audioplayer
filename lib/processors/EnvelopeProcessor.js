import GeneratorProcessor from './GeneratorProcessor.js';

class EnvelopeProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
    this.phase = 'main';
    this.phaseHandlers = {
      release: () => this.startRelease()
    };
  }

  generate() {
    return 1; // no-op, essentially
  }

  changePhase(phase) {
    this.phase = phase;
    this.port.postMessage({phase: phase});
    if (this.phase in this.phaseHandlers) {
      this.phaseHandlers[this.phase]();
    }
  }

  receiveMessage(e) {
    if ('phase' in e.data) {
      this.phase = e.data.phase;
      if (this.phase in this.phaseHandlers) {
        this.phaseHandlers[this.phase]();
      }
    }
  }

  startRelease() {
    this.changePhase('stop');
  }
}

registerProcessor('EnvelopeProcessor', EnvelopeProcessor);

export default EnvelopeProcessor;