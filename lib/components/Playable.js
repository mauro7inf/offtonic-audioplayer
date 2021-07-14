import AudioComponent from './AudioComponent.js';

class Playable extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: {ref: 'Default Timer'}
    },
    {
      name: 'duration',
      defaultValue: null
    }
  ];

  constructor() {
    super();
    this.duration = null;
    this.callbacks = [];
  }

  play() {
    this.player.play(this);
  }

  stop() {
    this.player.stop(this);
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }

  release(callback) {
    this.registerCallback(callback);
    this.stop();
  }

  registerCallback(callback) {
    if (callback !== undefined && callback !== null) {
      this.callbacks.push(callback);
    }
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