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
    this.getProperty('playable').play();
    sequence.registerPlayable(this.getProperty('playable'));
  }
}

export default PlayAction;