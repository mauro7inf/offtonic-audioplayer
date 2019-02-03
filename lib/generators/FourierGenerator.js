import Generator from '../Generator.js';

class FourierGenerator extends Generator {
  constructor(fourierCoeffs, frequency) {
    super(frequency);
    this.fourierCoeffs = fourierCoeffs;
    this.fourierOffsets = [];
    this.fourierCoeffs.forEach((c) => {
      this.fourierOffsets.push(Math.random()*Math.PI*2);
    });
  }

  generate() {
    let sample = 0;
    for (let i = 0; i < this.fourierCoeffs.length; i++) {
      sample += this.fourierCoeffs[i]*Math.sin((i + 1)*(this.phase - this.fourierOffsets[i]));
    }
    this.update();
    return sample;
  }
}

export default FourierGenerator;