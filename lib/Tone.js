import Playable from './Playable.js';
import SineGenerator from './generators/SineGenerator.js';
import ADSREnvelope from './envelopes/ADSREnvelope.js';
import Amplifier from './Amplifier.js';

class Tone extends Playable {
  constructor(frequency, duration, amplitude) {
    super();
    this.frequency = frequency; // in Hz
    this.duration = duration; // in ms
    this.amplitude = amplitude; // 0.1 is plenty loud; if the total amplitude of all sounds exceeds 1, there will be clipping

    this.generator = new SineGenerator(frequency);
    this.filters = [];
    this.envelope = new ADSREnvelope(10, 10, 20, 2.0, duration);
    this.amplifier = new Amplifier(amplitude);
  }

  stop() {
    this.envelope.stop(); // this may not stop the note immediately
  }

  generate() {
    let sample = this.generator.generate();
    this.filters.forEach((f) => {
      sample = f.generate(sample);
    });
    sample *= this.envelope.generate();
    if (!this.envelope.isPlaying) {
      this.off();
    }
    sample *= this.amplifier.generate();
    return sample;
  }

  addFilter(f) {
    this.filters.push(f);
  }

  updateParameters() {
    this.generator.setFrequency(this.frequency);
    this.envelope.setDuration(this.duration);
    this.amplifier.setAmplitude(this.amplitude);
  }

  setFrequency(frequency) {
    if (frequency !== this.frequency) {
      this.frequency = frequency;
      this.updateParameters();
    }
  }

  setDuration(duration) {
    if (duration !== this.duration) {
      this.duration = duration;
      this.updateParameters();
    }
  }

  setAmplitude(amplitude) {
    if (amplitude !== this.amplitude) {
      this.amplitude = amplitude;
      this.updateParameters();
    }
  }

  setGenerator(generator) {
    this.generator = generator;
    this.updateParameters();
  }

  setEnvelope(envelope) {
    this.envelope = envelope;
    this.updateParameters();
  }

  setAmplifier(amplifier) {
    this.amplifier = amplifier;
    this.updateParameters();
  }
}

Tone.globalContext = null;

export default Tone;