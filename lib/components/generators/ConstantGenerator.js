import AudioComponent from '../AudioComponent.js';

class ConstantGenerator extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'value',
      isAudioParam: true,
      paramName: 'offset',
      defaultValue: 0
    }
  ];

  static isNativeNode = true;

  constructor() {
    super();
    this.value = null;
  }

  createNode() {
    this.node = this.ctx.createConstantSource();
    if (typeof this.getProperty('value') === 'number') { // TODO allow AudioComponents and references too?
      this.node.offset.value = this.getProperty('value');
    } else {
      this.node.offset.value = 0; // initialize to 0 just to make sure
    }
    this.node.start();
  }

  cleanupNode() {
    if (this.node !== null) {
      this.node.stop();
    }
    super.cleanupNode();
  }
}

export default ConstantGenerator;