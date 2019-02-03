class Phasor {
  constructor(phase, frequency) {
    this.phase = phase;
    this.frequency = frequency;
  }

  setFrequency(frequency) {
    this.frequency = frequency;
  }

  setPhase(phase) {
    this.phase = phase;
  }

  update() {
    this.correctPhase();
  }

  generate() {
    this.update();
    return this.phase;
  }

  correctPhase() {
    while (this.phase > 2*Math.PI) {
      this.phase -= 2*Math.PI;
    }
    while (this.phase < 0) {
      this.phase += 2*Math.PI;
    }
  }
}

Phasor.mspa = null;

export default Phasor;