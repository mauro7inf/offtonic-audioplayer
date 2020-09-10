import Oscillator from './Oscillator.js';

class TriangleOscillator extends Oscillator {
  constructor() {
    super();
    this.mod = null;
  }

  getFunction() {
    return (x => {
      let m = this.getProperty('mod')*2*Math.PI;
      if (x < m) {
        return 2*x/m - 1;
      } else {
        return (2*Math.PI + m - 2*x)/(2*Math.PI - m);
      }
    });
  }
}

TriangleOscillator.newProperties = [
  {
    name: 'mod',
    default: 0.5
  }
];
TriangleOscillator.setupProperties();

export default TriangleOscillator;