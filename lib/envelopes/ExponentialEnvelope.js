import TimedComponent from '../TimedComponent.js';

class ExponentialEnvelope extends TimedComponent {
  constructor() {
    super();
    this.startValue = null;
    this.endValue = null;
  }

  update() {
    super.update();
    let zeroValue = this.getProperty('zeroValue');
    let startValue = this.getProperty('startValue');
    let endValue = this.getProperty('endValue');
    let reducedStart = startValue - zeroValue;
    let reducedEnd = endValue - zeroValue;
    let r = reducedEnd/reducedStart;
    let duration = this.getProperty('duration');
    if (duration === null) {
      duration = 1000; // meh
    }
    this.value = zeroValue + reducedStart*Math.pow(r, (this._timer.time - this.startTime)/duration);
  }
}

ExponentialEnvelope.newProperties = [
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
    name: 'zeroValue',
    default: 0
  }
];
ExponentialEnvelope.setupProperties();

export default ExponentialEnvelope;