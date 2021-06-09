import AudioComponent from '../AudioComponent.js';

// base envelope class just outputs a constant 1
class Envelope extends AudioComponent {
  static processorName = 'EnvelopeProcessor';

  constructor() {
    super();
    this.isEnvelope = true;
    this.playable = null; // the Playable instance that this envelope applies to
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
    this.phase = phase;
    if (this.node !== null) {
      this.node.port.postMessage({phase: phase});
    }
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

  // override this to include a release phase
  startRelease(playable) {
    this.playable = playable;
    this.changePhase('release');
  }

  stop() {
    if (this.playable !== null) {
      this.playable.stop();
    }
  }
}

export default Envelope;