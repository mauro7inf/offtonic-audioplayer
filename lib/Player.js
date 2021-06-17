import Registry from './Registry.js';

class Player {
  static o;

  constructor() {
    this.ctx = Player.o.ctx;
    this.destination = this.ctx.destination;
    this.destinationIndex = 0;
    this.gain = 1;
    this.node = null;
    this.inputIndex = 0;
    this.playing = [];
    this.registry = new Registry();
    this.timer = null;
    this.isOn = false;
  }

  on() {
    this.setupNode();
    if (this.timer === null) {
      this.timer = o.createComponent({
        name: 'Default Timer',
        className: 'Timer'
      }, this, this.registry);
      this.timer.on();
    }
    this.isOn = true;
  }

  off() {
    this.stopAll();
    this.cleanupNode();
    if (this.timer !== null) {
      this.timer.cleanup();
    }
    this.timer = null;
    this.isOn = false;
  }

  setupNode() {
    if (this.node === null) {
      this.node = this.ctx.createGain();
      this.node.gain.value = this.gain;
      this.node.connect(this.destination);
    }
  }

  cleanupNode() {
    if (this.node !== null) {
      this.node.disconnect(this.destination);
    }
    this.node = null;
  }

  setGain(gain) {
    this.gain = gain;
    if (this.node !== null) {
      this.node.gain.value = this.gain;
    }
  }

  play(playable) {
    playable.on();
    playable.connectTo(this.node, this.inputIndex);
    this.playing.push(playable);
  }

  stop(playable) {
    let index = this.playing.indexOf(playable);
    if (index !== -1)
    {
      this.playing.splice(index, 1);
      playable.disconnectFrom(this.node, this.inputIndex);
      playable.off();
    }
  }

  stopAll() {
    this.playing.forEach(playable => {
      playable.disconnectFrom(this.node, this.inputIndex);
      playable.off();
    });
    this.playing = [];
  }

  // untested
  setDestination(destination, destinationIndex) {
    this.node.disconnect(this.destination, null, this.destinationIndex);
    this.node.connect(destination, null, destinationIndex);

    this.destination = destination;
    this.destinationIndex = destinationIndex;
  }
}

export default Player;