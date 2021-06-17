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
    let rawTerm1 = this.getProperty('term1', false);
    if (rawTerm1 !== null && !(typeof rawTerm1 === 'object' && 'ref' in rawTerm1)) {
      this.resolveReference(rawTerm1).on();
    }
    let rawTerm2 = this.getProperty('term2', false);
    if (rawTerm2 !== null && !(typeof rawTerm2 === 'object' && 'ref' in rawTerm2)) {
      this.resolveReference(rawTerm2).on();
    }
  }

  off() {
    let rawTerm1 = this.getProperty('term1', false);
    if (rawTerm1 !== null && !(typeof rawTerm1 === 'object' && 'ref' in rawTerm1)) {
      this.resolveReference(rawTerm1).off();
    }
    let rawTerm2 = this.getProperty('term2', false);
    if (rawTerm2 !== null && !(typeof rawTerm2 === 'object' && 'ref' in rawTerm2)) {
      this.resolveReference(rawTerm2).off();
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