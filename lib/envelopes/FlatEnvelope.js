import Envelope from '../Envelope.js'

class FlatEnvelope extends Envelope {
  constructor(duration) {
    super(duration);
    this.frameDuration = null;
    if (this.duration !== null) {
      this.frameDuration = this.duration/Envelope.mspa;
    }
  }

  setDuration(duration) {
    if (duration !== this.duration) {
      this.duration = duration;
      if (this.duration === null) {
        this.frameDuration = null;
      } else {
        this.frameDuration = this.duration/Envelope.mspa;
      }
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