import TimedComponent from './TimedComponent.js';

class Tone extends TimedComponent {
  constructor() {
    super();
    this.generator = null;
    this.frequency = null;
    this.filter = null;
    this.envelope = null;
    this.amplifiers = [];
    this.gain = null;
  }

  _setGenerator(generator) {
    this.cleanupProperty('generator');
    this.generator = generator;
    if (this.frequency !== null && this.constructor.isComponent(this.generator)) {
      this.generator.setProperties({frequency: this.frequency});
    }
  }

  _setFrequency(frequency) {
    this.cleanupProperty('frequency');
    this.frequency = frequency;
    if (this.constructor.isComponent(this.generator)) {
      this.generator.setProperties({frequency: this.frequency});
    }
    if (this.constructor.isComponent(this.filter)) {
      this.filter.setProperties({frequency: this.frequency});
    }
  }

  _setFilter(filter) {
    this.cleanupProperty('filter');
    this.filter = filter;
    if (this.constructor.isComponent(this.filter)) {
      this.filter.setProperties({frequency: this.frequency});
    }
  }

  _addAmplifier(amplifier) {
    this.amplifiers.push(amplifier);
  }

  _removeAmplifier(index) {
    let removed = this.amplifiers.splice(index, 1);
    if (this.constructor.isComponent(removed[0])) {
      removed[0].cleanup();
    }
  }

  _stop() {
    if (this.constructor.isComponent(this.envelope) // don't stop references, just direct components
        && typeof this.envelope === 'object'
        && 'stop' in this.envelope
        && typeof this.envelope.stop === 'function') {
      this.envelope.stop();
    }
    else {
      this.off();
    }
  }

  update() {
    super.update();
    let envelope = this.getComponentProperty('envelope');
    if (typeof envelope === 'object' && envelope.isPlaying === false) { // explicit === false because envelope might not be an instance of Playable
      this.off();
      this.value = 0;
    } else {
      this.value = this.getProperty('generator');
      if (this.filter !== null) {
        this.value = this.getComponentProperty('filter').filter(this.value);
      }
      this.value *= this.getProperty('gain');
      this.value *= this.getProperty('envelope');
      for (let i = 0; i < this.amplifiers.length; i++) {
        this.value *= this.getProperty('amplifiers', i);
      }
    }
  }
}

Tone.newProperties = [
  {
    name: 'generator',
    setter: '_setGenerator',
    default: {
      className: 'Oscillator'
    }
  },
  {
    name: 'envelope',
    default: 1
  },
  {
    name: 'filter',
    setter: '_setFilter'
  },
  {
    name: 'amplifiers',
    adder: '_addAmplifier',
    remover: '_removeAmplifier',
    removerName: 'removeAmplifiers',
    list: true
  },
  {
    name: 'gain',
    default: 0.05
  },
  {
    name: 'frequency',
    setter: '_setFrequency',
    default: 440
  }
];
Tone.setupProperties();

export default Tone;