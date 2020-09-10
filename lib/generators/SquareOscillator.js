import Oscillator from './Oscillator.js';

class SquareOscillator extends Oscillator {
  constructor() {
    super();
    this.mod = null;
  }

  getFunction() {
    return (x => {
      if (x < this.getProperty('mod')*2*Math.PI) {
        return -1;
      } else {
        return 1;
      }
    });
  }
}

SquareOscillator.newProperties = [
  {
    name: 'mod',
    default: 0.5
  }
];
SquareOscillator.setupProperties();

export default SquareOscillator;