import Playable from './Playable.js';

class Tone extends Playable {
  static newPropertyDescriptors = [
    {
      name: 'gain',
      isAudioParam: true,
      defaultValue: 0.1,
      connector: 'connectGain',
      disconnector: 'disconnectGain'
    },
    {
      name: 'generator',
      isAudioComponent: true,
      inputIndex: 0,
      defaultValue: {
        className: 'SineOscillator'
      }
    },
    {
      name: 'envelope',
      isAudioComponent: true,
      inputIndex: 1,
      defaultValue: {
        className: 'ADSREnvelope'
      }
    },
    {
      name: 'frequency',
      defaultValue: null,
      getter: 'getFrequency',
      setter: 'setFrequency'
    }
  ];

  static processorName = 'MultiplierProcessor';

  static numberOfInputs = 2;

  // Generator and envelope both go into ToneProcessor, which then goes to filter (TODO) and from there to gain, which is output.
  constructor() {
    super();
    this.gain = null;
    this.generator = null;
    this.envelope = null;
    this.frequency = null;
    // TODO add filter
    this.gainNode = null;
    this.isFrequencySetOnGenerator = false;
  }

  finishSetup() {
    super.finishSetup();
    if (!this.isFrequencySetOnGenerator && this.getProperty('generator') !== null) {
      this.setFrequency(this.frequency);
    }
  }

  createNode() {
    super.createNode();
    this.gainNode = this.ctx.createGain();
    this.node.connect(this.gainNode);
  }

  cleanupNode() {
    if (this.gainNode !== null && this.node !== null) {
      this.node.disconnect(this.gainNode);
    }
    this.gainNode = null;
    super.cleanupNode();
  }

  connectGain() {
    if (this.gain !== null && this.gainNode !== null) {
      if (typeof this.gain === 'object' && this.gain.isAudioComponent) {
        this.gain.on();
        this.gain.connectTo(this.gainNode.gain);
      } else {
        this.gainNode.gain.value = this.gain;
      }
    }
  }

  disconnectGain() {
    if (this.gain !== null && this.gainNode !== null) {
      if (typeof this.gain === 'object' && this.gain.isAudioComponent) {
        this.gain.disconnectFrom(this.gainNode.gain);
        this.gain.off();
      }
    }
  }

  connectTo(destination, input) {
    if (input >= 0) {
      this.gainNode.connect(destination, 0, input);
    } else {
      this.gainNode.connect(destination, 0);
    }
  }

  disconnectFrom(destination, input) {
    if (input >= 0) {
      this.gainNode.disconnect(destination, 0, input);
    } else {
      this.gainNode.disconnect(destination, 0);
    }
  }

  getFrequency() {
    if (this.generator !== null) {
      let frequency = this.generator.getProperty('frequency');
      if (frequency !== null && frequency !== undefined) {
        return frequency;
      }
    }
    return this.frequency;
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    if (this.generator !== null) {
      this.generator.setProperty('frequency', frequency);
      this.isFrequencySetOnGenerator = true;
    }
  }

  release() {
    let envelope = this.getProperty('envelope');
    if (envelope !== null && typeof envelope === 'object' && envelope.isEnvelope) {
      envelope.startRelease(this);
    } else {
      this.stop();
    }
  }
}

export default Tone;