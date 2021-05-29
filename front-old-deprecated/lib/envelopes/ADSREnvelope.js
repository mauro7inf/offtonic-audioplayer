import TimedComponent from '../TimedComponent.js';

class ADSREnvelope extends TimedComponent {
  constructor() {
    super();
    this.stopTime = null;
    this.attack = null;
    this.attackGain = null;
    this.decay = null;
    this.release = null;
  }

  play() {
    super.play();
  }

  _stop() {
    this.stopTime = this._timer.time; // don't call super since that calls off()
  }

  update() {
    super.update();
    if (this.isPlaying && !this.isStopping) {
      let attack = this.getProperty('attack');
      let attackGain = this.getProperty('attackGain');
      let decay = this.getProperty('decay');
      let decayTime = this.startTime + attack;
      let sustainTime = decayTime + decay;
      if (this._timer.time <= decayTime) {
        this.value = (attackGain/attack)*(this._timer.time - this.startTime);
      } else if (this._timer.time <= sustainTime) {
        this.value = attackGain + ((1 - attackGain)/decay)*(this._timer.time - decayTime);
      } else {
        this.value = 1;
      }
    } else {
      let release = this.getProperty('release');
      let releaseTime = this.stopTime + release;
      if (this._timer.time <= releaseTime) {
        this.value = 1 + (-1/release)*(this._timer.time - this.stopTime);
      } else {
        this.value = 0;
        this.off();
      }
    }
  }
}

ADSREnvelope.newProperties = {
  isIndependent: {
    default: false
  },
  attack: {
    default: 10
  },
  attackGain: {
    default: 2
  },
  decay: {
    default: 20
  },
  release: {
    default: 50
  },
};
ADSREnvelope.setupProperties();

export default ADSREnvelope;