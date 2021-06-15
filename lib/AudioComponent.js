import Component from './Component.js';

class AudioComponent extends Component {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: null
    }
  ];

  static processorName = null;

  static numberOfInputs = 0;
  static numberOfOutputs = 1;
  static outputChannelCount = null;

  static isNativeNode = false;

  static getParamName(propertyName) {
    if ('paramName' in this.propertyDescriptors[propertyName]) {
      return this.propertyDescriptors[propertyName].paramName;
    } else {
      return propertyName;
    }
  }

  static getProcessorOptionName(propertyName) {
    if ('processorOptionName' in this.propertyDescriptors[propertyName]) {
      return this.propertyDescriptors[propertyName].processorOptionName;
    } else {
      return propertyName;
    }
  }

  static getParamFromNode(node, paramName, isNativeNode) {
    if (node !== null) {
      if (isNativeNode) {
        return node[paramName];
      } else {
        return node.parameters.get(paramName);
      }
    }
    return null;
  }

  constructor() {
    super();
    this.isAudioComponent = true;
    this.node = null;
  }

  on() {
    if (this.node === null) {
      this.createNode();
      this.connectProperties();
    }
  }

  off() {
    this.disconnectProperties();
    this.cleanupNode();
  }

  createNode() {
    if (this.constructor.processorName != null) {
      this.node = new AudioWorkletNode(this.ctx, this.constructor.processorName, this.getProcessorOptions());
      this.node.port.onmessage = (e) => this.receiveMessage(e);
    }
  }

  cleanupNode() {
    if (this.node !== null && !this.constructor.isNativeNode) {
      this.node.parameters.get('done').value = 1;
    }
    this.node = null;
  }

  receiveMessage(e) {
    if ('triggerEvent' in e.data) {
      this.handleTriggeredEvent(e.data.triggerEvent);
    }
  }

  registerTimedEvent(time, event, isAbsolute) {
    if (this.node !== null && !this.constructor.isNativeNode) {
      let timeKey = isAbsolute ? 'time' : 'duration';
      let timedEvent = {
        event: event
      };
      timedEvent[timeKey] = time;
      this.node.port.postMessage({
        timedEvent: timedEvent
      });
    }
  }

  handleTriggeredEvent(event) {
    // no-op
  }

  connectTo(destination, input) {
    if (input >= 0) {
      this.node.connect(destination, 0, input);
    } else { // might be audio param
      this.node.connect(destination, 0);
    }
  }

  disconnectFrom(destination, input) {
    if (input >= 0) {
      this.node.disconnect(destination, 0, input);
    } else { // might be audio param
      this.node.disconnect(destination, 0);
    }
  }

  cleanup() {
    this.off();
    super.cleanup();
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

  disconnectProperties() {
    Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => {
      this.disconnectProperty(propertyName);
    });
  }

  connectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('connector' in descriptor) {
      this[descriptor.connector]();
      return;
    }
    if (descriptor.isAudioParam) {
      this.connectAudioParam(propertyName);
    }
    if (descriptor.inputIndex >= 0) {
      this.connectInputIndex(propertyName);
    }
  }

  disconnectProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('disconnector' in descriptor) {
      this[descriptor.disconnector]();
      return;
    }
    if (descriptor.isAudioParam) {
      this.disconnectAudioParam(propertyName);
    }
    if (descriptor.inputIndex >= 0) {
      this.disconnectInputIndex(propertyName);
    }
  }

  connectAudioParam(propertyName) {
    let paramName = this.constructor.getParamName(propertyName);
    let value = this.getProperty(propertyName);
    if (value !== null && this.node !== null) {
      let param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        value.on();
        param.value = 0;
        value.connectTo(param);
      } else {
        param.value = value;
      }
    }
  }

  disconnectAudioParam(propertyName) {
    let paramName = this.constructor.getParamName(propertyName);
    let value = this.getProperty(propertyName);
    if (value !== null && this.node !== null) {
      let param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        value.disconnectFrom(param);
        value.off();
      } else {
        param.value = 0;
      }
    }
  }

  connectInputIndex(propertyName) {
    let value = this.getProperty(propertyName);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null && this.node !== null) {
      value.on();
      value.connectTo(this.node, inputIndex);
    }
  }

  disconnectInputIndex(propertyName) {
    let value = this.getProperty(propertyName);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null && this.node !== null) {
      value.disconnectFrom(this.node, inputIndex);
      value.off();
    }
  }

  getProcessorOptions() {
    let options = {
      parameterData: {},
      processorOptions: {}
    };
    const basicOptions = ['numberOfInputs', 'numberOfOutputs', 'outputChannelCount'];
    basicOptions.forEach(option => {
      if (this.constructor[option] !== null) {
        options[option] = this.constructor[option];
      }
    });
    Object.values(this.constructor.propertyDescriptors).forEach(descriptor => {
      this.addProcessorOption(options, descriptor);
    });
    return options;
  }

  addProcessorOption(options, descriptor) {
    if (descriptor.isProcessorOption) {
      options = this.addProcessorOptionOption(options, descriptor.name);
    }
    return options;
  }

  addProcessorOptionOption(options, propertyName) {
    options.processorOptions[this.constructor.getProcessorOptionName(propertyName)] = this.getProperty(propertyName);
    return options;
  }
}

export default AudioComponent;