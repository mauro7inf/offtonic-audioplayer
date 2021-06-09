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
    if (typeof this.getProperty('value') === 'number') {
      this.node.offset.value = this.getProperty('value');
    }
    this.node.start();
  }

  cleanupNode() {
    this.node.stop();
    super.cleanupNode();
  }
}

export default ConstantGenerator;