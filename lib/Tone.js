import Playable from './Playable.js';
import utils from './utils.js';

class Tone extends Playable {
  constructor(options) {
    super(); // always call super with no options
    // clean out components
    this.generator = null;
    this.envelope = null;
    this.amplifier = null;
    // these parameters actually only get used by subcomponents, so they aren't technically required
    this.frequency = undefined; // Hz; A4 is 440 Hz
    this.duration = undefined; // ms
    this.amplitude = undefined; // 0.1 is plenty loud; total amplitude shouldn't be greater than 1 or there will be clipping
    this.filters = [];
    this._setOptions(options);
  }

  setOptions(options) {
    super.setOptions(options);
    this._initComponent('generator', options, Tone.defaultOptions.generator);
    this._initComponent('envelope', options, Tone.defaultOptions.envelope);
    this._initComponent('amplifier', options, Tone.defaultOptions.amplifier);
    this._initProperty('frequency', options);
    this._initProperty('duration', options);
    this._initProperty('amplitude', options);
    this._setFilters(options.filters);
    this._updateToneParameters();
  }

  // if a filters array is present, these replace existing filters; if not, leave them alone
  // may want to change this behavior
  _setFilters(filters) {
    if (filters !== undefined) {
      this.filters = [];
      for (let i = 0; i < filters.length; i++) {
        this.addFilterFromOptions(filters[i]);
      }
    }
  }

  addFilterFromOptions(options) {
    let filter = utils.buildComponent(options);
    if (filter !== undefined) {
      this.addFilter(filter);
    } else {
      console.error('Can\'t create filter with no className.');
    }
  }

  addFilter(filter) {
    filter.setOptions(this._createFilterOptions());
    this.filters.push(filter);
  }

  _createFilterOptions() {
    let filterOptions = {};
    if (this.frequency !== undefined) {
      filterOptions.toneFrequency = this.frequency;
    }
    if (this.duration !== undefined) {
      filterOptions.toneDuration = this.duration;
    }
    return filterOptions;
  }

  _updateToneParameters() {
    if (this.frequency !== undefined) {
      this.generator.setOptions({frequency: this.frequency}); // generator can decide whether it's a no-op
    }
    if (this.duration !== undefined) {
      this.envelope.setOptions({duration: this.duration}); // envelope can decide whether it's a no-op
    }
    if (this.amplitude !== undefined) {
      this.amplifier.setOptions({amplitude: this.amplitude}); // amplifier can decide whether this is a no-op
    }
  let filterOptions = this._createFilterOptions();
    for (let i = 0; i < this.filters.length; i++) {
      this.filters[i].setOptions(this._createFilterOptions()); // filter can decide whether it's a no-op
    }
  }

  stop() {
    this.envelope.stop(); // this may not stop the tone immediately
  }

  generate() {
    let sample = this.generator.generate();
    for (let i = 0; i < this.filters.length; i++) {
      sample = this.filters[i].generate(sample);
    }
    sample *= this.envelope.generate();
    if (!this.envelope.isPlaying) {
      this.off();
    }
    sample *= this.amplifier.generate();
    return sample;
  }
}

Tone.globalContext = null;

Tone.defaultOptions = {
  generator: {
    className: 'SineGenerator'
  },
  envelope: {
    className: 'ADSREnvelope',
    attack: 10,
    decay: 10,
    release: 20,
    attackGain: 2
  },
  amplifier: {
    className: 'Amplifier'
  }
};

export default Tone;