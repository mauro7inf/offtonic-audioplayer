import Component from '../Component.js';

class Action extends Component {
  constructor() {
    super();
    this.isAction = true;
  }

  perform(sequence) {
    // no-op
  }
}

export default Action;