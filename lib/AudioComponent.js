import Component from './Component.js';

class AudioComponent extends Component {
  constructor() {
    super();
    this.playerFrame = null;
    this.value = null;
  }

  update() {}

  generate() {
    if (this.playerFrame !== this.player.now()) {
      this.playerFrame = this.player.now();
      this.update();
    }
    return this.value;
  }
}

AudioComponent.setupProperties();

export default AudioComponent;