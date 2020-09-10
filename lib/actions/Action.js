import Component from '../Component.js';

class Action extends Component {
  constructor() {
    super();
    this.time = null;
  }

  _setTime(time) {
    if (this.time === null) {
      this.time = time;
      let numericalTime = this.getProperty('time'); // get the value, if the property is an AudioComponent
      this.cleanupProperty('time'); // clean up the AudioComponent -- shouldn't be necessary
      this.time = numericalTime; // this.time has a number in it until someone decides to set this.time directly
    }
  }

  execute() {
    // no-op; implement in sub-classes
  }
}

Action.newProperties = [
  {
    name: 'time',
    setter: '_setTime',
    default: 0
  }
];
Action.setupProperties();

export default Action;