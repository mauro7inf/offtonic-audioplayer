import AudioComponent from './AudioComponent.js';

class Playable extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: {
        className: 'Timer' // TODO global timer reference?
      }
    },
    {
      name: 'duration',
      defaultValue: null
    }
  ];

  constructor() {
    super();
    this.duration = null;
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

  createNode() {
    super.createNode();
    let duration = this.getProperty('duration');
    if (duration !== null && !this.constructor.isNativeNode && this.node !== null) {
      this.registerTimedEvent(duration, 'release', false);
    }
  }

  handleTriggeredEvent(event) {
    super.handleTriggeredEvent(event);
    if (event === 'release') {
      this.release();
    }
  }
}

export default Playable;