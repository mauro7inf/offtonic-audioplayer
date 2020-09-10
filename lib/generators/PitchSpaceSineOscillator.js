import Oscillator from './Oscillator.js';

class PitchSpaceSineOscillator extends Oscillator {
  constructor() {
    super();
    this.isNormalized = null;
    this.bottomFrequency = null;
    this.topFrequency = null;
  }

  getFunction() {
    return (x => {
      let f0 = this.getProperty('bottomFrequency');
      let f1 = this.getProperty('topFrequency');
      let r = f1/f0;
      if (!this.getProperty('isNormalized')) {
        return f0*Math.pow(r, (1 + Math.sin(x))/2);
      } else {
        return Math.pow(r, (1 + Math.sin(x))/2)/((r - 1)/2) - (r + 1)/(r - 1);
      }
    });
  }
}

PitchSpaceSineOscillator.newProperties = [
  {
    name: 'isNormalized',
    default: false
  },
  {
    name: 'bottomFrequency',
    default: 440
  },
  {
    name: 'topFrequency',
    default: 880
  }
];
PitchSpaceSineOscillator.setupProperties();

export default PitchSpaceSineOscillator;