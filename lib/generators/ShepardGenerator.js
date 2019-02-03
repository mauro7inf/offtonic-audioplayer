import Generator from '../Generator.js';

class ShepardGenerator extends Generator {
  constructor(frequency) {
    super(frequency);
    this.shepardPowers = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512];
    this.shepardOffsets = [];
    this.shepardCoeffs = [];
    this.shepardPowers.forEach((c) => {
      this.shepardOffsets.push(Math.random()*Math.PI*2);
    });
  }

  setFrequency(frequency) {
    if (frequency !== this.lastFrequency) {
      this.lastFrequency = frequency; // since the base frequency is modified, we don't want to redo these calculations unnecessarily
      this.frequency = frequency;
      while (this.frequency >= 2*ShepardGenerator.C0) {
        this.frequency /= 2;
      }
      while (this.frequency < ShepardGenerator.C0) {
        this.frequency *= 2;
      }
      this.updateParameters();
    }
  }

  updateParameters() {
    super.updateParameters();
    this.updateCoefficients();
  }

  updateCoefficients() {
    let log = Math.log(this.frequency/ShepardGenerator.C0)/Math.log(2);
    for (let i = 0; i < 10; i++) {
      this.shepardCoeffs[i] = Math.cos(Math.PI*(i + log)/10.0);
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