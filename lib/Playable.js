import Component from './Component.js';

// options object optional
class Playable extends Component {
  constructor(options) {
    super();
    this.globalContext = Playable.globalContext;
    this.player = this.globalContext !== null ? this.globalContext.player : null;

    this.isPlaying = false;
    this._setOptions(options);
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
  }

  stop() { // override to do any cleanup necessary, like release envelopes
    this.off();
  }

  off() {
    this.isPlaying = false;
  }

  generate() {
    return 0;
  }
}

Playable.globalContext = null;

export default Playable;