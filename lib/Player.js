class Player {
  static o;

  constructor() {
    this.ctx = Player.o.ctx;
    this.destination = this.ctx.destination;
    this.destinationIndex = 0;
    this.node = null;
    this.playing = [];

    this.setupNode();
  }

  setupNode() {
    this.node = this.ctx.createGain();
    this.node.gain.value = 0.1;
    this.node.connect(this.destination);
  }

  play(playable) {
    playable.on();
    playable.node.connect(this.node, playable.outputIndex);
    this.playing.push(playable);
  }

  stop(playable) {
    let index = this.playing.indexOf(playable);
    if (index !== -1)
    {
      this.playing.splice(index, 1);
      playable.node.disconnect(this.node, playable.outputIndex);
      playable.off();
    }
  }

  stopAll() {
    this.playing.forEach(playable => {
      playable.node.disconnect(this.node, playable.outputIndex);
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