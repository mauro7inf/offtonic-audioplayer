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

    this.setupNode();
  }

  setupNode() {
    this.node = this.ctx.createGain();
    this.node.gain.value = this.gain;
    this.node.connect(this.destination);
  }

  setGain(gain) {
    this.gain = gain;
    this.node.gain.value = this.gain;
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