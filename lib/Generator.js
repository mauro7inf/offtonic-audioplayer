import LinearPhasor from './phasors/LinearPhasor.js';

class Generator {
  constructor(frequency) {
    this.setFrequency(frequency);
    this.phase = Math.random()*2.0*Math.PI; // random phase to prevent things from lining up oddly
    this.phasor = new LinearPhasor(this.phase, this.frequency);
  }

  setFrequency(frequency) {
    if (frequency !== this.frequency) {
      this.frequency = frequency;
      this.updateParameters();
    }
  }

  setPhasor(phasor) {
    this.phasor = phasor;
    this.updateParameters();
  }

  setPhase(phase) {
    this.phase = phase;
    this.updateParameters();
  }

  update() {
    this.phase = this.phasor.generate();
  }

  updateParameters() {
    if (this.phasor !== null && this.phasor !== undefined) {
      this.phasor.setPhase(this.phase);
      this.phasor.setFrequency(this.frequency);
    }
  }

  generate() {
    this.update();
    return 0; // abstract class
  }
}

Generator.mspa = null;

export default Generator;