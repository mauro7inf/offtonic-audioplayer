import AudioComponent from './AudioComponent.js';

class NodeOutput extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'node',
      defaultValue: null
    },
    {
      name: 'outputIndex',
      defaultValue: 0
    }
  ];

  static isNativeNode = true;

  constructor() {
    super();
  }

  on() {
    // no-op
  }

  off() {
    // no-op
  }

  createNode() {
    // no-op
  }

  cleanupNode() {
    // no-op
  }
}

export default NodeOutput;