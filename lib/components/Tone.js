import Playable from './Playable.js';

class Tone extends Playable {
  static newPropertyDescriptors = [
    {
      name: 'gain',
      isAudioParam: true,
      defaultValue: 0.1,
      connector: 'connectGain', // TODO specify node to which to connect property
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

  // Generator and envelope both go into ToneProcessor, which then goes to filter, and from there to gain, which is output.
  constructor() {
    super();
    this.gain = null;
    this.generator = null;
    this.envelope = null;
    this.frequency = null;
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
  }

  cleanupNode() {
    this.gainNode = null;
    super.cleanupNode();
  }

  connectGain() {
    let rawGain = this.getProperty('gain', false);
    let gain = this.resolveReference(rawGain);
    if (gain !== null && this.gainNode !== null) {
      if (typeof gain === 'object' && gain.isAudioComponent) {
        if (!('ref' in rawGain)) {
          gain.on(); // don't turn it on if it's a reference
        }
        this.gainNode.gain.value = 0; // initialize to 0 because otherwise anything you connect will get added to 1
        gain.connectTo(this.gainNode.gain);
      } else {
        this.gainNode.gain.value = gain;
      }
    }
  }

  disconnectGain() {
    let rawGain = this.getProperty('gain', false);
    let gain = this.resolveReference(rawGain);
    if (gain !== null && this.gainNode !== null) {
      if (typeof gain === 'object' && gain.isAudioComponent) {
        gain.disconnectFrom(this.gainNode.gain);
        if (!('ref' in rawGain)) {
          gain.off(); // don't turn it off if it's a reference
        }
      }
    }
  }

  getNodeFromFilter() {
    return this.gainNode;
  }

  getNodeToDestination() {
    return this.gainNode;
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