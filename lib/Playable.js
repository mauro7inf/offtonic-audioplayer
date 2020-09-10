import AudioComponent from './AudioComponent.js';

class Playable extends AudioComponent {
  constructor() {
    super();
    this.isPlaying = false;
    this.isStopping = false;
    this.isIndependent = null;
    this.value = 0;
  }

  play() {
    super.play();
    this.isPlaying = true;
    if (this.getProperty('isIndependent')) {
      this.player.add(this);
    }
  }

  stop() {
    if (!this.isStopping) {
      this.isStopping = true;
      this._stop();
    }
  }

  _stop() {
    this.off();
  }

  off() {
    super.off();
    this.isPlaying = false;
    this.cleanup();
  }
}

Playable.newProperties = [
  {
    name: 'isIndependent',
    default: true
  }
];
Playable.setupProperties();

export default Playable;