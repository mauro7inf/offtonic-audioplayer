import Envelope from '../Envelope.js';

class LinearEnvelope extends Envelope {
  constructor(options) {
    super();
    this.startValue = null;
    this.endValue = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(LinearEnvelope, options);
    this._updateLinearEnvelopeParameters();
  }

  _updateLinearEnvelopeParameters() {
    this.endFrame = this.duration/Envelope.mspa;
    this.updateCurrentValue();
  }

  updateCurrentValue() {
    if (this.frame < 0) {
      this.currentValue = this.startValue;
      this.isPlaying = true;
    } else if (this.frame > this.endFrame) {
      this.currentValue = this.endValue;
      this.isPlaying = false;
    } else {
      this.currentValue = (this.frame/this.endFrame)*(this.endValue - this.startValue) + this.startValue;
      this.isPlaying = true;
    }
  }

  update() {
    this.frame++;
    this.updateCurrentValue();
  }

  generate() {
    let envelope = this.currentValue;
    this.update();
    return envelope;
  }
}

LinearEnvelope.properties = ['startValue', 'endValue'];

export default LinearEnvelope;