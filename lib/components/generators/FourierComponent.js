import AudioComponent from '../AudioComponent.js';

class FourierComponent extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'coeff',
      defaultValue: 1,
      isAudioParam: true,
      paramName: null,
      connector: 'connectCoeff',
      disconnector: 'disconnectCoeff'
    },
    {
      name: 'multiple',
      defaultValue: 1,
      isAudioParam: true,
      paramName: null,
      connector: 'connectMultiple',
      disconnector: 'disconnectMultiple'
    }
  ];

  static isNativeNode = true;

  // The frequency comes from elsewhere and connects to the multipleNode (gainNode).
  // The multiple connects to the multipleNode (gainNode)'s gain.
  // The multipleNode connects to the oscillator (oscillatorNode)'s frequency.
  // The oscillator connects to the node (gainNode).
  // The Fourier coefficient coeff connects to the node (gainNode)'s gain.
  // The node connects to the destination.

  constructor() {
    super();
    this.coeff = null;
    this.multiple = null;
    this.multipleNode = null;
    this.occilator = null;
  }

  createNode() {
    this.node = this.ctx.createGain();
    this.node.gain.value = 0;
    this.oscillator = this.ctx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 0;
    this.oscillator.connect(this.node);
    this.oscillator.start();
    this.multipleNode = this.ctx.createGain();
    this.multipleNode.gain.value = 0;
    this.multipleNode.connect(this.oscillator.frequency);
  }

  cleanupNode() {
    if (this.multipleNode !== null && this.oscillator !== null) {
      this.multipleNode.disconnect(this.oscillator.frequency);
    }
    this.multipleNode = null;

    if (this.oscillator !== null && this.node !== null) {
      this.oscillator.disconnect(this.node);
      this.oscillator.stop();
    }
    this.oscillator = null;

    this.node = null;
  }

  getFirstNode() {
    return this.multipleNode;
  }

  connectCoeff() {
    if (this.node !== null) {
      this.connectComponentOrRefToAudioParam(this.getProperty('coeff', false), this.node.gain, true);
    }
  }

  disconnectCoeff() {
    if (this.node !== null) {
      this.disconnectComponentOrRefFromAudioParam(this.getProperty('coeff', false), this.node.gain, true);
    }
  }

  connectMultiple() {
    if (this.multipleNode !== null) {
      this.connectComponentOrRefToAudioParam(this.getProperty('multiple', false), this.multipleNode.gain, true);
    }
  }

  disconnectMultiple() {
    if (this.multipleNode !== null) {
      this.disconnectComponentOrRefFromAudioParam(this.getProperty('multiple', false), this.multipleNode.gain, true);
    }
  }
}

export default FourierComponent;