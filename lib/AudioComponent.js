import Component from './Component.js';

class AudioComponent extends Component {
  static processorName = null;

  constructor() {
    super();
    this.isAudioComponent = true;
    this.node = null;
    this.isNativeNode = false;
    this.outputIndex = 0;
    this.player = this.constructor.o.player;
  }

  genericSetter(propertyName, value) {
    super.genericSetter(propertyName, value);
    this.connectProperty(propertyName);
  }

  connectProperties() {
    Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => {
      this.connectProperty(propertyName);
    });
  }

  connectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('connector' in descriptor) {
      this[descriptor.connector]();
      return;
    }
    if (descriptor.isAudioParam) {
      let paramName = propertyName;
      if ('paramName' in descriptor) {
        paramName = descriptor.paramName;
      }
      this.connectAudioParam(propertyName, paramName);
    }
    if (descriptor.inputIndex >= 0) {
      this.connectInputIndex(descriptor.inputIndex);
    }
  }

  disconnectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('disconnector' in descriptor) {
      this[descriptor.disconnector]();
      return;
    }
    if (descriptor.isAudioParam) {
      let paramName = propertyName;
      if ('paramName' in descriptor) {
        paramName = descriptor.paramName;
      }
      this.disconnectAudioParam(propertyName, paramName);
    }
    if (descriptor.inputIndex >= 0) {
      this.disconnectInputIndex(propertyName);
    }
  }

  getParamFromNode(node, paramName, isNativeNode) {
    if (node !== null) {
      if (isNativeNode) {
        return node[paramName];
      } else {
        return node.parameters.get(paramName);
      }
    }
    return null;
  }

  connectAudioParam(propertyName, paramName) {
    let value = this[propertyName];
    if (value !== null && this.node !== null) {
      let param = this.getParamFromNode(this.node, paramName, this.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        value.on();
        value.node.connect(param, value.outputIndex);
      } else {
        param.value = value;
      }
    }
  }

  disconnectAudioParam(propertyName, paramName) {
    let value = this[propertyName];
    if (value !== null && this.node !== null) {
      let param = this.getParamFromNode(this.node, paramName, this.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        value.node.disconnect(param, value.outputIndex);
        value.off();
      }
    }
  }

  connectInputIndex(propertyName) {
    let value = this[propertyName];
    if (value !== null && this.node !== null) {
      value.on();
      value.node.connect(this.node, value.outputIndex, inputIndex);
    }
  }

  disconnectInputIndex(propertyName) {
    let value = this[propertyName];
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null && this.node !== null) {
      value.node.disconnect(this.node, value.outputIndex, descriptor.inputIndex);
      value.off();
    }
  }

  cleanup() {
    this.off();
    super.cleanup();
  }

  //TODO connectTo and disconnectFrom, and rewrite all this connection stuff

  createNode() {
    if (this.constructor.processorName != null) {
      this.node = new AudioWorkletNode(this.ctx, this.constructor.processorName, this.getProcessorOptions());
    }
  }

  getProcessorOptions() {
    let options = {
      parameterData: {},
      processorOptions: {}
    };
    Object.values(this.constructor.propertyDescriptors).forEach(descriptor => {
      this.addProcessorOption(options, descriptor);
    });
    return options;
  }

  addProcessorOption(options, descriptor) {
    if (descriptor.isAudioParam) {
      options = this.addAudioParamOption(options, descriptor.name);
    }
    if (descriptor.isProcessorOption) {
      options = this.addProcessorOptionOption(options, descriptor.name);
    }
    return options;
  }

  addAudioParamOption(options, propertyName) {
    let value = this.getProperty(propertyName);
    if (typeof value === 'number') {
      options.parameterData[propertyName] = value;
    }
    return options;
  }

  addProcessorOptionOption(options, propertyName) {
    options.processorOptions[propertyName] = this.getProperty(propertyName);
    return options;
  }

  on() {
    if (this.node === null) {
      this.createNode();
      this.connectProperties();
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