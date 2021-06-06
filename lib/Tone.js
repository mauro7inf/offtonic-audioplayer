import AudioComponent from './AudioComponent.js';

class Tone extends AudioComponent {
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
      defaultValue: 1
    }
  ];

  static processorName = 'ToneProcessor';

  static numberOfInputs = 2;

  // Generator and envelope both go into ToneProcessor, which then goes to filter (TODO) and from there to gain, which is output.
  constructor() {
    super();
    this.gain = null;
    this.generator = null;
    this.envelope = null;
    // TODO add filter
    this.gainNode = null;
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
}

export default Tone;