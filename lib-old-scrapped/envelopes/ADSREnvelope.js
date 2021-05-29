import Envelope from '../Envelope.js'

class ADSREnvelope extends Envelope {
  constructor(options) {
    super();
    this.attack = null;
    this.decay = null;
    this.release = null;
    this.attackGain = null;
    this.releaseFrom = 1;
    this.lastEnvelope = 0;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(ADSREnvelope, options);
    this._updateADSREnvelopeParameters();
  }

  _updateADSREnvelopeParameters() {
    this.decayFrame = this.attack/Envelope.mspa;
    this.sustainFrame = (this.attack + this.decay)/Envelope.mspa;
    if (this.duration !== null) {
      this.releaseFrame = this.duration/Envelope.mspa;
      this.endFrame = (this.duration + this.release)/Envelope.mspa;
    } else {
      this.releaseFrame = Infinity;
      this.endFrame = Infinity;
    }
  }

  stop() {
    this.releaseFrame = this.frame;
    this.endFrame = this.frame + (this.release/Envelope.mspa);
    this.releaseFrom = this.lastEnvelope;
  }

  generate() {
    let envelope = 0.0;
    if (this.frame > this.endFrame) { // end phase
      this.off();
    } else if (this.frame > this.releaseFrame) { // release phase
      envelope = this.releaseFrom*(1.0 - (this.frame - this.releaseFrame)/(this.endFrame - this.releaseFrame));
    } else if (this.frame > this.sustainFrame) { // sustain phase
      envelope = 1.0;
    } else if (this.frame > this.decayFrame) { // decay phase
      envelope = ((this.frame - this.decayFrame)/(this.sustainFrame - this.decayFrame))*(1.0 - this.attackGain) + this.attackGain;
    } else { // attack phase
      envelope = (this.frame/this.decayFrame)*this.attackGain;
    }
    this.lastEnvelope = envelope;
    super.update();
    return envelope;
  }
}

ADSREnvelope.properties = ['attack', 'decay', 'release', 'attackGain'];

export default ADSREnvelope;