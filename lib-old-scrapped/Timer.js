import Component from './Component.js';
import utils from './utils.js';

class Timer extends Component {
  constructor(options) {
    super();
    this.globalContext = Timer.globalContext;
    this.player = this.globalContext !== null ? this.globalContext.player : null;
    this.isPlaying = false;
    this.time = null;
    this.name = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Timer, options);
    this._setTimerName(options);
  }

  _setTimerName(options) {
    if ('name' in options) {
      if (this.name !== null) {
        console.error('Timer names should not be changed.');
      } else {
        this.name = options.name;
      }
    }
    if (this.name === null || this.name === undefined) {
      this.name = utils.createUniqueName(16); // name is necessary
    }
  }

  play() {
    if (!this.isPlaying) { // if it's already playing, don't do anything
      this.isPlaying = true;
      this.player.addTimer(this);
    }
  }

  stop() { // override if necessary to clean up anything that needs cleanung up
    this.off();
  }

  off() {
    this.isPlaying = false; // player will remove timers itself
  }

  update() { // override
    this.time++;
  }
}

Timer.properties = ['time'];

Timer.defaultOptions = {
  time: 0
}

Timer.globalContext = null;

Timer.mspa = null;

export default Timer;