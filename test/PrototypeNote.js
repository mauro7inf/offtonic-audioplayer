class PrototypeNote {
  static o;

  constructor() {
    this.ctx = PrototypeNote.o.ctx;
    this.node = null;
    this.player = PrototypeNote.o.player;
  }

  play() {
    if (this.node === null) {
      this.node = new AudioWorkletNode(this.ctx, 'prototype-processor');
      if (this.player) {
        this.player.add(this);
      }
    }
  }

  // untested
  stop() {
    if (this.node !== null) {
      if (this.player) {
        this.player.remove(this);
      }
      this.node = null;
    }
  }
}

export default PrototypeNote;