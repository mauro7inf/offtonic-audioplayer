import Envelope from '../Envelope.js';

class LinearEnvelope extends Envelope {
  constructor(startValue, endValue, duration) {
    super(duration);
    this.startValue = startValue;
    this.endValue = endValue;
    this.setup();
  }

  setup() {
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

  setDuration(duration) {
    if (duration !== this.duration) {
      this.duration = duration;
      this.setup();
    }
  }

  setStartValue(startValue) {
    if (startValue !== this.startValue) {
      this.startValue = startValue;
      this.setup();
    }
  }

  setEndValue(endValue) {
    if (endValue !== this.endValue) {
      this.endValue = endValue;
      this.setup();
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

export default LinearEnvelope;