import AudioComponent from '../AudioComponent.js';

class FourierSawtooth extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioComponent: true,
      defaultValue: 440,
      setter: 'setFrequency'
    },
    {
      name: 'highestMultiple',
      defaultValue: 5
    },
    {
      name: 'includeEven',
      defaultValue: true
    },
    {
      name: 'includeOdd',
      defaultValue: true
    }
  ];

  static isNativeNode = true;

  constructor() {
    super();
    this.frequency = null;
    this.componentCount = null;
    this.includeEven = null;
    this.includeOdd = null;
    this.fourierGenerator = null;
  }

  on() {
    if (this.fourierGenerator === null) {
      this.createNode();
      this.connectProperties();
      if (this.fourierGenerator !== null) {
        this.fourierGenerator.on();
      }
    }
  }

  off() {
    if (this.fourierGenerator !== null) {
      this.fourierGenerator.off();
    }
    this.disconnectProperties();
    this.cleanupNode();
  }

  createNode() {
    let fourierComponents = [];
    for (let n = 1; n <= this.highestMultiple; n++) {
      if ((n % 2 === 0 && this.includeEven) || (n % 2 === 1 && this.includeOdd)) {
        fourierComponents.push({n: n, a: 1/n});
      }
    }
    let generatorDef = {
      className: 'FourierGenerator',
      frequency: this.frequency,
      fourierComponents: fourierComponents
    };
    this.fourierGenerator = this.createComponent(generatorDef);
  }

  cleanupNode() {
    if (this.fourierGenerator !== null) {
      this.fourierGenerator.cleanup();
    }
    this.fourierGenerator = null;
  }

  getNodeToFilter() {
    if (this.fourierGenerator !== null) {
      return this.fourierGenerator.getNodeToDestination();
    } else {
      return null;
    }
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    if (this.fourierGenerator !== null && this.frequency !== null) {
      this.fourierGenerator.setProperty('frequency', frequency);
    }
  }
}

export default FourierSawtooth;