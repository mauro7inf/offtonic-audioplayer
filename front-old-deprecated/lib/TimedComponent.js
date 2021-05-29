import Playable from './Playable.js';

class TimedComponent extends Playable {
  constructor() {
    super();
    this.timer = null;
    this._timer = null;
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
  }

  _setTimer(timer) {
    if (this.timer !== null && typeof this.timer === 'object' && !('ref' in this.timer) && timer !== this.timer) {
      this.timer.off();
    }
    if (timer === null || timer === undefined) {
      this.timer = {ref: 'Global Timer'};
    } else {
      this.timer = timer;
    }
    if ('ref' in this.timer) {
      this._timer = this.resolveReference(this.timer);
    } else {
      if (this.isPlaying) {
        this.timer.play();
      }
      this._timer = this.timer;
    }
  }

  _setEndTime(time) {
    this.endTime = time;
    if (this.startTime !== null) {
      this.duration = this.endTime - this.startTime;
    }
  }

  _setDuration(time) {
    this.duration = time;
    if (this.startTime !== null) {
      this.endTime = this.startTime + this.duration;
    }
  }

  _setupTimes() {
    this.startTime = this._timer.time;
    if (this.endTime !== null && this.duration === null) {
      this.duration = this.endTime - this.startTime;
    } else if (this.duration !== null && this.endTime === null) {
      this.endTime = this.startTime + this.duration;
    } else if (this.duration !== null && this.endTime !== null) {
      if (this.duration < this.endTime - this.startTime) {
        this.endTime = this.startTime + this.duration;
      } else {
        this.duration = this.endTime - this.startTime;
      }
    }
  }

  play() {
    this._setupTimes();
    super.play();
  }

  update() {
    if (this.endTime !== null && this._timer.time >= this.endTime) {
      this.stop();
    }
    super.update();
  }
}

TimedComponent.newProperties = {
  timer: {
    setter: '_setTimer',
    default: {ref: 'Global Timer'}
  },
  endTime: {
    setter: '_setEndTime'
  },
  duration: {
    setter: '_setDuration'
  }
};
TimedComponent.setupProperties();

export default TimedComponent;