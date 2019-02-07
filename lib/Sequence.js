import Playable from './Playable.js';

class Sequence extends Playable {
  constructor(tempo, actions) {
    super();
    this.tempo = tempo;
    this.beat = 0;
    this.beatsPerFrame = (this.tempo/60000)*Sequence.mspa;

    this.actions = [];
    actions.forEach((a) => {
      this.addAction(a);
    });
  }

  addAction(actionItem) { // TODO: use an ordered list
    this.actions.push({
      beat: actionItem.beat,
      action: actionItem.action
    });
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
  }

  update() {
    this.beat += this.beatsPerFrame;
  }

  generate() {
    for (let i = 0; i < this.actions.length; i++) {
      if (this.beat >= this.actions[i].beat) {
        this.actions[i].action();
        this.actions.splice(i, 1);
        i--;
      }
    }
    if (this.actions.length === 0) {
      this.isPlaying = false;
    }
    this.update();
    return 0;
  }
}

Sequence.mspa = null;

export default Sequence;