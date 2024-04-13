import Registry from './registries/Registry.js';

class Player {
  static o;

  constructor() {
    this.ctx = Player.o.ctx;
    this.destination = this.ctx.destination;
    this.destinationIndex = 0;
    this.gain = 1;
    this.node = null;
    this.ground = null;
    this.inputIndex = 0;
    this.playing = [];
    this.registry = new Registry();
    this.orchestra = this.registry.orchestra;
    this.timer = null;
    this.tuning = null;
    this.isOn = false;
  }

  on() {
    this.ctx.resume();
    this.setupNodes();
    if (this.timer === null) {
      this.timer = o.createComponent({
        name: 'Default Timer',
        className: 'Timer'
      }, this, this, this.registry);
      this.timer.on();
    }
    if (this.tuning === null) {
      this.tuning = o.createComponent({
        name: '12TET',
        className: 'MeantoneTuning',
        tuningName: '12TET'
      }, this, this, this.registry);
      this.tuning.play();
    }
    this.timer.setTuning(this.tuning, false);
    this.tuning.setTuning(this.tuning, false);
    this.isOn = true;
  }

  off() {
    this.stopAll();
    this.cleanupNodes();
    if (this.timer !== null) {
      this.timer.cleanup();
    }
    this.timer = null;
    if (this.tuning !== null) {
      this.tuning.cleanup();
    }
    this.tuning = null;
    this.isOn = false;
  }

  setupNodes() {
    if (this.node === null) {
      this.node = this.ctx.createGain();
      this.node.gain.value = this.gain;
      this.node.connect(this.destination);
    }
    if (this.ground === null) {
      this.ground = this.ctx.createGain();
      this.ground.gain.value = 0;
      this.ground.connect(this.destination);
    }
  }

  cleanupNodes() {
    if (this.node !== null) {
      this.node.disconnect(this.destination);
    }
    this.node = null;
    if (this.ground !== null) {
      this.ground.disconnect(this.destination);
    }
    this.ground = null;
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

  createComponent(properties) {
    return Player.o.createComponent(properties, this, this, this.registry, this.tuning);
  }
}

export default Player;