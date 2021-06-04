import Component from './Component.js';

class AudioComponent extends Component {
  static processorName = null;

  constructor() {
    super();
    this.isAudioComponent = true;
    this.node = null;
    this.outputIndex = 0;
    this.player = this.constructor.o.player;
  }

  genericSetter(propertyName, value) {
    super.genericSetter(propertyName, value);
    if (this.node !== null) {
      this.connectProperty(propertyName);
    }
  }

  connectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if (descriptor.isAudioParam) {
      this.connectAudioParam(propertyName);
    }
    if (descriptor.inputIndex >= 0) {
      this.connectInputIndex(descriptor.inputIndex);
    }
  }

  disconnectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if (descriptor.isAudioParam) {
      this.disconnectAudioParam(propertyName);
    }
    if (descriptor.inputIndex >= 0) {
      this.disconnectInputIndex(propertyName);
    }
  }

  connectAudioParam(propertyName) {
    let value = this[propertyName];
    if (value !== null) {
      if (typeof value === 'object' && value.isAudioComponent) {
        value.node.connect(this.node.parameters.get(propertyName), value.outputIndex);
      } else {
        this.node.parameters.get(propertyName).value = value;
      }
    }
  }

  disconnectAudioParam(propertyName) {
    let value = this[propertyName];
    if (value !== null) {
      if (typeof value === 'object' && value.isAudioComponent) {
        value.node.disconnect(this.node.parameters.get(propertyName), value.outputIndex);
      }
    }
  }

  connectInputIndex(propertyName) {
    let value = this[propertyName];
    if (value !== null) {
      value.node.connect(this.node, value.outputIndex, inputIndex);
    }
  }

  disconnectInputIndex(propertyName) {
    let value = this[propertyName];
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null) {
      value.node.disconnect(this.node, value.outputIndex, descriptor.inputIndex);
    }
  }

  cleanup() {
    this.off();
    super.cleanup();
  }

  //TODO connectTo and disconnectFrom, and rewrite all this connection stuff

  getProcessorOptions() {
    return {
      parameterData: {},
      processorOptions: {}
    };
  }

  on() {
    if (this.node === null && this.constructor.processorName != null) {
      this.node = new AudioWorkletNode(this.ctx, this.constructor.processorName, this.getProcessorOptions());
      Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => {
        this.connectProperty(propertyName);
      });
    }
  }

  off() {
    if (this.node !== null) {
      Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => {
        this.disconnectProperty(propertyName);
      });
      this.node = null;
    }
  }
}

export default AudioComponent;