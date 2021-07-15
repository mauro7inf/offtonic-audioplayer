import Component from '../Component.js';

class Action extends Component {
  constructor() {
    super();
    this.isAction = true;
  }

  perform(sequence) {
    this.cleanup();
  }
}

export default Action;