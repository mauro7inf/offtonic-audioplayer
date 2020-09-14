import TimedComponent from '../TimedComponent.js';

class PiecewiseEnvelope extends TimedComponent {
  constructor() {
    super();
    this.currentEnvelope = 1;
    this.envelopeEvents = [];
    this.envelopeStopEvents = [];
  }

  _addEnvelopeEvent(event) {
    if (typeof event.time !== 'number' || !isFinite(event.time)) { // don't add events that don't have valid times
      return;
    }
    for (let i = this.envelopeEvents.length; i > 0; i--) {
      if (event.time >= this.envelopeEvents[i - 1].time) {
        this.envelopeEvents.splice(i, 0, event);
        return;
      }
    }
    this.envelopeEvents.unshift(event);
  }

  _addEnvelopeStopEvent(event) {
    if (typeof event.time !== 'number' || !isFinite(event.time)) { // don't add events that don't have valid times
      return;
    }
    for (let i = this.envelopeStopEvents.length; i > 0; i--) {
      if (event.time >= this.envelopeStopEvents[i - 1].time) {
        this.envelopeStopEvents.splice(i, 0, event);
        return;
      }
    }
    this.envelopeStopEvents.unshift(event);
  }

  _removeEnvelopeEvent(index) {
    let removed = this.envelopeEvents.splice(index, 1); // this is not a component property so there's no need for cleanup
  }

  _removeEnvelopeStopEvent(index) {
    let removed = this.envelopeStopEvents.splice(index, 1); // this is not a component property so there's no need for cleanup
  }

  _stop() {
    this.stopTime = this._timer.time; // don't call super since that calls off()
  }

  _setCurrentEnvelope(event) {
    this.cleanupProperty('currentEnvelope');
    this.currentEnvelope = this.constructor.create(event.envelope, this.player, this);
    if (this.constructor.isComponent(this.currentEnvelope)) {
      if (this.currentEnvelope.getProperty('startValue') === null) {
        this.currentEnvelope.setProperties({startValue: this.value});
      }
      this.currentEnvelope.play();
    }
  }

  update() {
    super.update();
    if (!this.isStopping) {
      while (this.envelopeEvents.length > 0 && this._timer.time - this.startTime >= this.envelopeEvents[0].time) {
        this._setCurrentEnvelope(this.envelopeEvents.shift());
      }
    } else {
      while (this.envelopeStopEvents.length > 0 && this._timer.time - this.stopTime >= this.envelopeStopEvents[0].time) {
        this._setCurrentEnvelope(this.envelopeStopEvents.shift());
      }
    }
    let currentEnvelope = this.getComponentProperty('currentEnvelope');
    if (this.constructor.isComponent(currentEnvelope)) {
      if (currentEnvelope.isPlaying === false) {
        if (this.isStopping && this.envelopeStopEvents.length === 0) {
          this.off();
        } else {
          this.cleanupProperty('currentEnvelope');
          this.currentEnvelope = this.value; // stay on this value until further notice
        }
      } else {
        this.value = this.getProperty('currentEnvelope');
      }
    } else {
      this.value = currentEnvelope;
    }
  }
}

PiecewiseEnvelope.newProperties = [
  {
    name: 'isIndependent',
    default: false
  },
  {
    name: 'currentEnvelope',
    setter: null
  },
  {
    name: 'envelopeEvents',
    adder: '_addEnvelopeEvent',
    remover: '_removeEnvelopeEvent',
    removerName: 'removeEnvelopeEvents',
    list: true,
    componentProperty: false
  },
  {
    name: 'envelopeStopEvents',
    adder: '_addEnvelopeStopEvent',
    remover: '_removeEnvelopeStopEvent',
    removerName: 'removeEnvelopeStopEvents',
    list: true,
    componentProperty: false
  }
];
PiecewiseEnvelope.setupProperties();

export default PiecewiseEnvelope;