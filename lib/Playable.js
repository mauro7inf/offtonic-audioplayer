import AudioComponent from './AudioComponent.js';

class Playable extends AudioComponent {
  constructor() {
    super();
  }

  play() {
    this.player.play(this);
  }

  stop() {
    this.player.stop(this);
  }

  release() {
    this.stop();
  }
}

export default Playable;