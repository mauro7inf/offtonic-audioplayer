import TimedComponent from '../TimedComponent.js';

class LinearEnvelope extends TimedComponent {
  constructor() {
    super();
    this.startValue = null;
    this.endValue = null;
  }

  update() {
    super.update();
    let startValue = this.getProperty('startValue');
    let endValue = this.getProperty('endValue');
    let d = endValue - startValue;
    let duration = this.getProperty('duration');
    if (duration === null) {
      duration = 1000; // meh
    }
    this.value = startValue + d*(this._timer.time - this.startTime)/duration;
  }
}

LinearEnvelope.newProperties = {
  isIndependent: {
    default: false
  },
  startValue: {
    default: 0
  },
  endValue: {
    default: 1
  }
};
LinearEnvelope.setupProperties();

export default LinearEnvelope;