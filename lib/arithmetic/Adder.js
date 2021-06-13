import AudioComponent from '../AudioComponent.js';

class Adder extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'term1', // TODO make this an array
      isAudioComponent: true,
      defaultValue: null
    },
    {
      name: 'term2',
      isAudioComponent: true,
      defaultValue: null
    }
  ];

  static isNativeNode = true; // actually, the adder doesn't have a node at all

  constructor() {
    super();
    this.term1 = null;
    this.term2 = null;
    // TODO make this work as an envelope or filter too
  }

  on() {
    if (this.getProperty('term1') !== null) {
      this.getProperty('term1').on();
    }
    if (this.getProperty('term2') !== null) {
      this.getProperty('term2').on();
    }
  }

  off() {
    if (this.getProperty('term1') !== null) {
      this.getProperty('term1').off();
    }
    if (this.getProperty('term2') !== null) {
      this.getProperty('term2').off();
    }
  }

  connectTo(destination, input) {
    if (this.getProperty('term1') !== null) {
      this.getProperty('term1').connectTo(destination, input);
    }
    if (this.getProperty('term2') !== null) {
      this.getProperty('term2').connectTo(destination, input);
    }
  }

  disconnectFrom(destination, input) {
    if (this.getProperty('term1') !== null) {
      this.getProperty('term1').disconnectFrom(destination, input);
    }
    if (this.getProperty('term2') !== null) {
      this.getProperty('term2').disconnectFrom(destination, input);
    }
  }
}

export default Adder;