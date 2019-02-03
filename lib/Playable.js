class Playable {
  constructor() {
    this.globalContext = Playable.globalContext;
    this.player = this.globalContext !== null ? this.globalContext.player : null;

    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
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