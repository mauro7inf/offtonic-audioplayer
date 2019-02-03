import ShepardGenerator from './ShepardGenerator.js';

class ShepardOctaveGenerator extends ShepardGenerator {
  constructor(octave, frequency) {
    super(frequency);
    this.octave = octave;
  }

  updateCoefficients() {
    // assume frequency has already been updated
    let a = this.octave;
    let b = 10 - this.octave;
    let aa = Math.pow(a, a);
    let bb = Math.pow(b, b);
    let abab = Math.pow(a + b, a + b);
    let log = Math.log(this.frequency/ShepardGenerator.C0)/Math.log(2);
    for (let i = 0; i < 10; i++) {
      let x = i + log;
      this.shepardCoeffs[i] = Math.pow(Math.pow(x/10, a)*Math.pow(1 - x/10, b)*(abab/(aa*bb)), 0.8);
    }
  }

  setOctave(octave) {
    if (octave !== this.octave) {
      this.octave = octave;
      this.updateCoefficients();
    }
  }
}

export default ShepardOctaveGenerator;