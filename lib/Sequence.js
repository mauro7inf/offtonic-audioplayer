import Playable from './Playable.js';

class Sequence extends Playable {
  constructor(actions) {
    super();
    this.frame = 0;

    this.actions = [];
    actions.forEach((a) => {
      this.addAction(a);
    });
  }

  addAction(actionItem) { // TODO: use an ordered list
    this.actions.push({
      frame: actionItem.time/Sequence.mspa,
      action: actionItem.action
    });
  }

  play() {
    this.isPlaying = true;
    this.player.events.push(this);
  }

  update() {
    this.frame++;
  }

  generate() {
    for (let i = 0; i < this.actions.length; i++) {
      if (this.frame >= this.actions[i].frame) {
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