import AudioComponent from './AudioComponent.js';

class Playable extends AudioComponent {
  constructor() {
    super();
  }

  play() {
    this.player.play(this);
  }

  release() {
    this.stop();
  }

  stop() {
    this.player.stop(this);
  }
}

export default Playable;