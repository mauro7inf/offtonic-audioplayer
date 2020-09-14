import TimedComponent from '../TimedComponent.js';

class CubicEnvelope extends TimedComponent {
  constructor() {
    super();
    this.startValue = null;
    this.endValue = null;
    this.startSlope = null;
    this.endSlope = null;
  }

  update() {
    super.update();
    let startValue = this.getProperty('startValue');
    let endValue = this.getProperty('endValue');
    let startSlope = this.getProperty('startSlope');
    let endSlope = this.getProperty('endSlope');
    let duration = this.getProperty('duration');
    if (duration === null) {
      duration = 1000; // meh
    }
    let m = (endValue - startValue)/duration;
    let x = this._timer.time - this.startTime;
    let m0 = startSlope - m;
    let m1 = endSlope - m;
    this.value = startValue + x*(x - duration)*((m0 + m1)*x/(duration*duration) - m0/duration) + m*x;
  }
}

CubicEnvelope.newProperties = [
  {
    name: 'isIndependent',
    default: false
  },
  {
    name: 'startValue',
    default: 1
  },
  {
    name: 'endValue',
    default: 2
  },
  {
    name: 'startSlope',
    default: 0
  },
  {
    name: 'endSlope',
    default: 0
  }
];
CubicEnvelope.setupProperties();

export default CubicEnvelope;