import Action from './Action.js';

class PlayableAction extends Action {
  constructor() {
    super();
    this.playable = null;
  }

  execute() {
    let playable = this.playable;
    if (Array.isArray(playable)) {
      for (let i = 0; i < playable.length; i++) {
        this.playable[i] = this.constructor.create(playable[i], this.player, null); // don't make the action the parent object
        this.getComponentProperty('playable', i).play();
      }
    } else if (playable !== null) {
      this.playable = this.constructor.create(playable, this.player, null);
      this.getComponentProperty('playable').play();
    }
  }
}

PlayableAction.newProperties = {
  playable: {
    componentProperty: false
  }
};
PlayableAction.setupProperties();

export default PlayableAction;