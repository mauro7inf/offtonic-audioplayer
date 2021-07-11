import Action from './Action.js';

class PlayAction extends Action {
  static newPropertyDescriptors = [
    {
      name: 'playable',
      defaultValue: null
    }
  ];

  constructor() {
    super();
    this.playable = null;
  }

  perform(sequence) {
    let playable = this.getProperty('playable');
    if (playable !== null) {
      playable.play();
      sequence.registerPlayable(playable);
    }
  }
}

export default PlayAction;