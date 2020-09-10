import Envelope from '../Envelope.js'

class FlatEnvelope extends Envelope {
  constructor(options) {
    super();
    this.frameDuration = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._updateFlatEnvelopeParameters();
  }

  _updateFlatEnvelopeParameters() {
    if (this.duration === null) {
      this.frameDuration = null;
    } else {
      this.frameDuration = this.duration/Envelope.mspa;
    }
  }

  stop() {
    this.frameDuration = this.frame;
  }

  generate() {
    if (this.frameDuration !== null && this.frame > this.frameDuration) {
      this.isPlaying = false;
      return 0;
    }
    super.update();
    return 1;
  }
}

export default FlatEnvelope;