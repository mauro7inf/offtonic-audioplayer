import AudioComponent from './AudioComponent.js';

class Tone extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'gain',
      isAudioParam: true,
      defaultValue: 0.1
    },
    {
      name: 'generator',
      isAudioComponent: true,
      defaultValue: {
        className: 'SineOscillator'
      },
      connector: 'connectGenerator'
    }
  ];

  constructor() {
    super();
    this.envelopeNode = null;
    this.gain = null;
    this.generator = null;
  }

  createNode() {
    this.node = this.ctx.createGain();
    this.envelopeNode = this.ctx.createGain();
    this.envelopeNode.connect(this.node);
  }

  connectGenerator() {
    this.generator.connect(this.envelopeNode);
  }
}

export default Tone;