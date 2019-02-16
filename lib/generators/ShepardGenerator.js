import Oscillator from '../Oscillator.js';

class ShepardGenerator extends Oscillator {
  constructor(options) {
    super();
    this.shepardPowers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]; // constant
    this.shepardOffsets = [];
    this.shepardCoeffs = [];
    this.lastFrequency = null;
    for (let i = 0; i < this.shepardPowers.length; i++) {
      this.shepardOffsets[i] = Math.random()*Math.PI*2;
    } // doesn't have to change once set... probably
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._updateShepardGeneratorParameters();
  }

  _updateShepardGeneratorParameters() {
    if (this.frequency !== this.lastFrequency) {
      this.lastFrequency = this.frequency;
      while (this.frequency >= 2*ShepardGenerator.C0) {
        this.frequency /= 2;
      }
      while (this.frequency < ShepardGenerator.C0) {
        this.frequency *= 2;
      }
      this.phasor.setOptions({frequency: this.frequency});
      let log = Math.log(this.frequency/ShepardGenerator.C0)/Math.log(2);
      for (let i = 0; i < this.shepardPowers.length; i++) {
        this.shepardCoeffs[i] = Math.cos(Math.PI*(i + log)/10.0);
      }
    }
  }

  generate() {
    let sample = 0;
    for (let i = 0; i < this.shepardCoeffs.length; i++) {
      sample += this.shepardCoeffs[i]*Math.sin(this.shepardPowers[i]*(this.phase - this.shepardOffsets[i]));
    }
    this.update();
    return sample;
  }
}

ShepardGenerator.C0 = 440/Math.pow(2, 4.75);

export default ShepardGenerator;