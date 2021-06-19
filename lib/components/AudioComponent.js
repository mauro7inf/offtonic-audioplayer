import Component from './Component.js';

class AudioComponent extends Component {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: null
    },
    {
      name: 'filter', // TODO allow changing filter during playback (disconnect the right things, connect the right things)
      defaultValue: null,
      connector: 'connectFilter',
      disconnector: 'disconnectFilter'
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

  static disconnectNodes(node1, outputIndex, node2, inputIndex) {
    try {
      if (inputIndex === null || inputIndex === undefined) {
        node1.disconnect(node2, outputIndex);
      } else {
        node1.disconnect(node2, outputIndex, inputIndex);
      }
    } catch (e) {
      this.constructor.o.warn(e);
    }
  }

  constructor() {
    super();
    this.isAudioComponent = true;
    this.node = null;
    this.timer = null;
    this.filter = null;
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
      this.getNodeToDestination().connect(destination, 0, input);
    } else { // might be audio param
      this.getNodeToDestination().connect(destination, 0);
    }
  }

  disconnectFrom(destination, input) {
    this.constructor.disconnectNodes(this.getNodeToDestination(), 0, destination, input);
  }

  getFirstNode() {
    return this.node;
  }

  getNodeToFilter() {
    return this.node;
  }

  getNodeFromFilter() {
    return null;
  }

  getNodeToDestination() {
    if (this.getProperty('filter') !== null) {
      return this.getProperty('filter').getNodeToDestination();
    } else {
      return this.node;
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
    let rawValue = this.getProperty(propertyName, false);
    let value = this.resolveReference(rawValue);
    if (value !== null && this.node !== null) {
      let param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        if (!('ref' in rawValue)) { // only turn it on if it's owned by this AudioComponent, which references aren't
          value.on();
        }
        param.value = 0;
        value.connectTo(param);
      } else {
        param.value = value;
      }
    }
  }

  disconnectAudioParam(propertyName) {
    let paramName = this.constructor.getParamName(propertyName);
    let rawValue = this.getProperty(propertyName, false);
    let value = this.resolveReference(rawValue);
    if (value !== null && this.node !== null) {
      let param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
      if (typeof value === 'object' && value.isAudioComponent) {
        value.disconnectFrom(param);
        if (!('ref' in rawValue)) { // only turn it off if it's owned by this AudioComponent, which references aren't
          value.off();
        }
      } else {
        param.value = 0;
      }
    }
  }

  connectInputIndex(propertyName) {
    let rawValue = this.getProperty(propertyName, false);
    let value = this.resolveReference(rawValue);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null && this.node !== null) {
      if (!('ref' in rawValue)) { // only turn it on if it's owned by this AudioComponent, which references aren't
        value.on();
      }
      value.connectTo(this.node, inputIndex);
    }
  }

  disconnectInputIndex(propertyName) {
    let rawValue = this.getProperty(propertyName, false);
    let value = this.resolveReference(rawValue);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (value !== null && this.node !== null) {
      value.disconnectFrom(this.node, inputIndex);
      if (!('ref' in rawValue)) { // only turn it off if it's owned by this AudioComponent, which references aren't
        value.off();
      }
    }
  }

  connectFilter() {
    let rawFilter = this.getProperty('filter', false);
    let filter = this.resolveReference(rawFilter);
    if (filter !== null) {
      if (!('ref' in rawFilter)) {
        filter.on();
      }
      this.getNodeToFilter().connect(filter.getFirstNode());
      if (this.getNodeFromFilter() !== null) {
        filter.connectTo(this.getNodeFromFilter());
      }
    } else {
      if (this.getNodeFromFilter() !== null) {
        this.getNodeToFilter().connect(this.getNodeFromFilter());
      }
    }
  }

  disconnectFilter() {
    let rawFilter = this.getProperty('filter', false);
    let filter = this.resolveReference(rawFilter);
    if (filter !== null) {
      this.constructor.disconnectNode(this.getNodeToFilter(), 0, filter.getFirstNode());
      if (this.getNodeFromFilter() !== null) {
        filter.disconnectFrom(this.getNodeFromFilter());
      }
      if (!('ref' in rawFilter)) {
        filter.off();
      }
    } else {
      if (this.getNodeFromFilter() !== null) {
        this.constructor.disconnectNodes(this.getNodeToFilter(), 0, this.getNodeFromFilter());
      }
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