import Component from './Component.js';

class Envelope extends Component {
  constructor(options) {
    super();
    this.frame = 0;
    this.isPlaying = true;
    this.duration = null;
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initProperty('duration', options);
  }

  stpp() {
    // doesn't necessarily do anything
  }

  off() {
    this.isPlaying = false;
  }

  update() {
    this.frame++;
  }

  generate() {
    this.update();
    return 0; // abstract class
  }
}

Envelope.mspa = null;

export default Envelope;