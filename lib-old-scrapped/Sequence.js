import Playable from './Playable.js';

class Sequence extends Playable {
  constructor(options) {
    super();
    this.tempo = null;
    this.timer = null;
    this.actions = [];
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Sequence, options);
    if ('actions' in options) {
      this._setActions(options.actions);
    }
    this._updateSequenceParameters();
  }

  _updateSequenceParameters() {
    if (this.changed.timer || this.changed.tempo) {
      this.timer.setOptions({tempo: this.tempo});
    }
  }

  _setActions(actions) {
    this.actions = []; // clear them out if added through setOptions; require addAction instead for adding
    for (let i = 0; i < actions.length; i++) {
      this.addAction(actions[i]);
    }
  }

  // actions should have a time, which is a number that corresponds to a time in the timer, and an action,
  // which should be a function that gets called at that time
  addAction(actionItem) { // use an ordered list
    if (this.actions.length === 0) {
      this.actions.push(actionItem);
    } else {
      for (let i = this.actions.length - 1; i >= 0; i--) {
        if (actionItem.time >= this.actions[i].time) {
          this.actions.splice(i + 1, 0, actionItem);
          break;
        } else if (i === 0) {
          this.actions.unshift(actionItem);
          break;
        }
      }
    }
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
    this.timer.play(); // if it isn't already
  }

  generate() {
    for (let i = 0; i < this.actions.length; i++) {
      if (this.timer.time >= this.actions[i].time) {
        this.actions[i].action();
        this.actions.splice(i, 1);
        i--;
      } else {
        break; // no need to keep iterating, since the list is ordered
      }
    }
    if (this.actions.length === 0) {
      this.isPlaying = false;
    }
    return 0;
  }
}

Sequence.components = ['timer'];
Sequence.properties = ['tempo'];

Sequence.defaultOptions = {
  timer: {
    className: 'Metronome'
  }
}

export default Sequence;