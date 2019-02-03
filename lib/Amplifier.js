class Amplifier {
  constructor(amplitude) {
    this.amplitude = amplitude;
  }

  setAmplitude(amplitude) {
    this.amplitude = amplitude;
  }

  update() {
    // doesn't need to do anything
  }

  generate() {
    this.update();
    return this.amplitude;
  }
}

export default Amplifier;