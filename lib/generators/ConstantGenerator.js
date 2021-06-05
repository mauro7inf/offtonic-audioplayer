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

  constructor() {
    super();
    this.isNativeNode = true;
    this.value = null;
  }

  createNode() {
    this.node = this.ctx.createConstantSource();
    if (typeof this.value === 'number') {
      this.node.offset.value = this.value;
    }
    this.node.start();
  }

  cleanup() {
    super.cleanup();
    this.node.stop();
  }
}

export default ConstantGenerator;