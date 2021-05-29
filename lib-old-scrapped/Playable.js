import Component from './Component.js';
import utils from './utils.js';

// options object optional
class Playable extends Component {
  constructor(options) {
    super();
    this.globalContext = Playable.globalContext;
    this.player = this.globalContext !== null ? this.globalContext.player : null;
    this.isPlaying = false;
    this.timerName = null; // name of timer for timer duration
    this.timerDuration = null; // in beats of the named timer
    this.endTime = null;
    this.stopping = false;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Playable, options);
    this._updatePlayableParameters();
  }

  _updatePlayableParameters() {
    if (this.timerDuration !== null && this.timerName === null) {
      console.error('Playable Component has timerDuration but no timerName');
    }
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
    if (this.timerName !== null && this.timerDuration !== null) {
      let startTime = this.player.getTimer(this.timerName).time;
      this.endTime = startTime + this.timerDuration;
    }
  }

  stop() { // override to do any cleanup necessary, like release envelopes
    this.off();
  }

  off() {
    this.isPlaying = false;
  }

  _generate() {
    if (!this.stopping && this.timerName !== null && this.timerDuration !== null) {
      let timer = this.player.getTimer(this.timerName);
      if (timer === undefined || timer.time >= this.endTime) {
        this.stopping = true;
        this.stop();
      }
    }
    return this.generate();
  }

  generate() {
    return 0;
  }
}

Playable.properties = ['timerName', 'timerDuration'];

Playable.globalContext = null;

export default Playable;