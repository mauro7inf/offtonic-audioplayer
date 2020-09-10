import Playable from './Playable.js';

class Timer extends Playable {
  constructor() {
    super();
    this.time = 0;
    this.tempo = null; // BPM
  }

  _setTime(time) {
    this.time = time;
  }

  update() {
    super.update();
    this.time += this.getProperty('tempo')*this.mspa/60000;
  }
}

Timer.newProperties = [
  {
    name: 'time',
    setter: '_setTime',
    default: 0
  },
  {
    name: 'tempo',
    default: 60000
  }
];
Timer.setupProperties();

export default Timer;