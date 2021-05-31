class Player {
  static o;

  constructor() {
    this.ctx = Player.o.ctx;
    this.destination = this.ctx.destination;
    this.playing = [];
    this.isStopping = false; // prevents redundant calls to remove()
  }

  add(playable) {
    playable.node.connect(this.destination);
    this.playing.push(playable);
  }

  // untested
  remove(playable) {
    if (!this.isStopping) {
      let index = this.playing.indexOf(playable);
      if (index !== -1)
      {
        this.playing.splice(index, 1);
        playable.node.disconnect(this.destination);
      }
    }
  }

  stop() {
    this.isStopping = true;
    this.playing.forEach(playable => {
      playable.node.disconnect(this.destination);
      playable.stop();
    });
    this.playing = [];
    this.isStopping = false;
  }

  // untested
  setDestination(destination) {
    this.playing.forEach(playable => {
      playable.node.disconnect(this.destination);
      playable.node.connect(destination);
    });

    this.destination = destination;
  }
}

export default Player;