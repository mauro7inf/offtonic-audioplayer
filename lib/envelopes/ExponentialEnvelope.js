import TimedComponent from '../TimedComponent.js';

class ExponentialEnvelope extends TimedComponent {
  constructor() {
    super();
    this.startValue = null;
    this.endValue = null;
  }

  update() {
    super.update();
    let startValue = this.getProperty('startValue');
    let endValue = this.getProperty('endValue');
    let r = endValue/startValue;
    let duration = this.getProperty('duration');
    if (duration === null) {
      duration = 1000; // meh
    }
    this.value = startValue*Math.pow(r, (this._timer.time - this.startTime)/duration);
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
  }
];
ExponentialEnvelope.setupProperties();

export default ExponentialEnvelope;