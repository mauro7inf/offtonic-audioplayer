import AudioComponent from '../AudioComponent.js';

// base envelope class just outputs a constant 1
class Envelope extends AudioComponent {
  static processorName = 'EnvelopeProcessor';
  static numberOfInputs = 1;

  constructor() {
    super();
    this.isEnvelope = true;
    this.playable = null; // the Playable instance that this envelope applies to
    this.phase = 'main'; // TODO make into property?
    this.phaseHandlers = {
      stop: () => this.stop()
    };
  }

  changePhase(phase) {
    this.phase = phase;
    if (this.node !== null) {
      this.node.port.postMessage({phase: phase});
    }
  }

  createNode() {
    super.createNode();
    if (this.phase !== null) {
      this.changePhase(this.phase);
    }
  }

  // override this to include a release phase
  startRelease() {
    this.changePhase('release');
  }

  receiveMessage(e) {
    if ('phase' in e.data) {
      this.phase = e.data.phase;
      if (this.phase in this.phaseHandlers) {
        this.phaseHandlers[this.phase]();
      }
    }
  }

  stop() {
    if (this.playable !== null) {
      this.playable.stop();
    }
  }
}

export default Envelope;