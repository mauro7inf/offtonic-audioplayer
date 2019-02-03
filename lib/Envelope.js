class Envelope {
  constructor(duration) {
    this.setDuration(duration);
    this.frame = 0;
    this.isPlaying = true;
  }

  setDuration(duration) {
    if (duration === undefined) {
      this.duration = null;
    } else {
      this.duration = duration;
    }
  }

  stpp() {
    // doesn't necessarily do anything
  }

  update() {
    this.frame++;
  }

  generate() {
    this.update();
    return 0; // abstract class
  }
}

Envelope.mspa = null;

export default Envelope;