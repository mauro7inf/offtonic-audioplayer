import Timer from '../Timer.js';

class Metronome extends Timer {
  constructor(options) {
    super();
    this.tempo = null; // BPM
    this.dt = null; // beats per audio frame
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initFields(Metronome, options);
    this._updateMetronomeParameters();
  }

  _updateMetronomeParameters() {
    this.dt = (this.tempo * Timer.mspa)/60000; // beats per min, times ms per audio frame, times minutes per ms
  }

  update() {
    this.time += this.dt;
  }
}

Metronome.properties = ['tempo'];

Metronome.defaultOptions = {
  tempo: 60
};

export default Metronome;