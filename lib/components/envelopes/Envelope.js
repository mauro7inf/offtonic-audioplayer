import Generator from '../generators/Generator.js';

// base envelope class just outputs a constant 1
class Envelope extends Generator {
  static processorName = 'EnvelopeProcessor';

  constructor() {
    super();
    this.isEnvelope = true;
    this.callbacks = [];
    this.phase = 'main'; // TODO make into property?
    this.phaseHandlers = {
      stop: () => this.stop()
    };
  }

  createNode() {
    super.createNode();
    if (this.phase !== null) {
      this.changePhase(this.phase);
    }
  }

  changePhase(phase) {
    if (this.phase !== phase) {
      this.phase = phase;
      if (this.node !== null) {
        this.node.port.postMessage({phase: phase});
      }
      if (this.phase in this.phaseHandlers) {
        this.phaseHandlers[this.phase]();
      }
    }
  }

  receiveMessage(e) {
    super.receiveMessage(e);
    if ('phase' in e.data) {
      if (this.phase !== e.data.phase) {
        this.phase = e.data.phase;
        if (this.phase in this.phaseHandlers) {
          this.phaseHandlers[this.phase]();
        }
      }
    }
  }

  // override this to include a release phase
  startRelease(callback) {
    this.registerCallback(callback)
    this.changePhase('release');
  }

  registerCallback(callback) {
    if (callback !== undefined && callback !== null) {
      this.callbacks.push(callback);
    }
  }

  stop() {
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }
}

export default Envelope;