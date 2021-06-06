class PrototypeNote {
  static o;

  constructor() {
    this.ctx = PrototypeNote.o.ctx;
    this.node = null;
    this.player = PrototypeNote.o.player;
  }

  play() {
    this.player.play(this);
  }

  stop() {
    this.player.stop(this);
  }

  on() {
    if (this.node === null) {
      this.node = new AudioWorkletNode(this.ctx, 'PrototypeProcessor');
    }
  }

  off() {
    if (this.node !== null) {
      this.node = null;
    }
  }

  connectTo(destination) {
    this.node.connect(destination);
  }

  disconnectFrom(destination) {
    this.node.disconnect(destination);
  }
}

export default PrototypeNote;