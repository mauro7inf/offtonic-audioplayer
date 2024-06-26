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
    this.outputIndex = 0;
    this.timer = null;
    this.filter = null;
  }

  on() {
    if (this.node === null) {
      this.createNode();
      this.connectProperties();
      if (this.node !== null) {
        for (let output = 0; output < this.constructor.numberOfOutputs; output++) {
          this.node.connect(this.player.ground, output);
        }
      }
    }
  }

  off() {
    if (this.node !== null && this.player.ground !== null) {
      for (let output = 0; output < this.constructor.numberOfOutputs; output++) {
        this.node.disconnect(this.player.ground, output);
      }
    }
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
    if (event === 'identify') {
      this.identify();
    }
  }

  connectTo(destination, input) {
    if (input >= 0) {
      this.getNodeToDestination().connect(destination, this.getOutputIndexToDestination(), input);
    } else { // might be audio param
      this.getNodeToDestination().connect(destination, this.getOutputIndexToDestination());
    }
  }

  disconnectFrom(destination, input) {
    if (this.getNodeToDestination() !== null) {
      this.constructor.disconnectNodes(this.getNodeToDestination(), this.getOutputIndexToDestination(), destination, input);
    }
  }

  getFirstNode() {
    return this.node;
  }

  getNodeToFilter() {
    return this.node;
  }

  getOutputIndexToFilter() {
    return this.outputIndex;
  }

  getNodeFromFilter() {
    return null;
  }

  getNodeToDestination() {
    if (this.getProperty('filter') !== null) {
      return this.getProperty('filter').getNodeToDestination();
    } else {
      return this.getNodeToFilter();
    }
  }

  getOutputIndexToDestination() {
    if (this.getProperty('filter') !== null) {
      return this.getProperty('filter').getOutputIndexToDestination();
    } else {
      return this.getOutputIndexToFilter();
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
    } else if ('passThrough' in descriptor) {
      if (this[descriptor.passThrough] !== null) {
        this[descriptor.passThrough].connectProperty(propertyName);
      }
    } else {
      this.genericConnector(propertyName);
    }
  }

  genericConnector(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
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
    } else if ('passThrough' in descriptor) {
      if (this[descriptor.passThrough] !== null) {
        this[descriptor.passThrough].disconnectProperty(propertyName);
      }
    } else {
      this.genericDisconnector(propertyName);
    }
  }

  genericDisconnector(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
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
    this.connectComponentOrRefToAudioParamName(rawValue, paramName, true);
  }

  connectComponentOrRefToAudioParamName(rawValue, paramName, zeroParamDuringTransition) {
    let param = null;
    if (this.node !== null) {
      param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
    }
    this.connectComponentOrRefToAudioParam(rawValue, param, zeroParamDuringTransition);
  }

  connectComponentOrRefToAudioParam(rawValue, param, zeroParamDuringTransition) {
    let value = this.resolveReference(rawValue);
    if (value !== null && param !== null) {
      if (typeof value === 'object' && value.isAudioComponent) {
        if (!('ref' in rawValue)) { // only turn it on if it's owned by this AudioComponent, which references aren't
          value.on();
        }
        if (zeroParamDuringTransition)
        {
          param.value = 0;
        }
        value.connectTo(param);
      } else {
        param.value = value;
      }
    }
  }

  disconnectAudioParam(propertyName) {
    let paramName = this.constructor.getParamName(propertyName);
    let rawValue = this.getProperty(propertyName, false);
    this.disconnectComponentOrRefFromAudioParamName(rawValue, paramName, true);
  }

  disconnectComponentOrRefFromAudioParamName(rawValue, paramName, zeroParamDuringTransition) {
    let param = null;
    if (this.node !== null) {
      param = this.constructor.getParamFromNode(this.node, paramName, this.constructor.isNativeNode);
    }
    this.disconnectComponentOrRefFromAudioParam(rawValue, param, zeroParamDuringTransition);
  }

  disconnectComponentOrRefFromAudioParam(rawValue, param, zeroParamDuringTransition) {
    let value = this.resolveReference(rawValue);
    if (value !== null && param !== null) {
      if (typeof value === 'object' && value.isAudioComponent) {
        value.disconnectFrom(param);
        if (!('ref' in rawValue)) { // only turn it off if it's owned by this AudioComponent, which references aren't
          value.off();
        }
      } else {
        if (zeroParamDuringTransition) {
          param.value = 0;
        }
      }
    }
  }

  connectInputIndex(propertyName) {
    let rawValue = this.getProperty(propertyName, false);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (this.node !== null) {
      this.connectComponentOrRefToInputIndex(rawValue, this.node, inputIndex);
    }
  }

  connectComponentOrRefToInputIndex(rawValue, node, inputIndex) {
    let value = this.resolveReference(rawValue);
    if (value !== null && typeof value === 'object' && value.isAudioComponent) {
      if (!('ref' in rawValue)) { // only turn it on if it's owned by this AudioComponent, which references aren't
        value.on();
      }
      value.connectTo(node, inputIndex);
    }
  }

  disconnectInputIndex(propertyName) {
    let rawValue = this.getProperty(propertyName, false);
    let inputIndex = this.constructor.propertyDescriptors[propertyName].inputIndex;
    if (this.node !== null) {
      this.disconnectComponentOrRefFromInputIndex(rawValue, this.node, inputIndex);
    }
  }

  disconnectComponentOrRefFromInputIndex(rawValue, node, inputIndex) {
    let value = this.resolveReference(rawValue);
    if (value !== null && typeof value === 'object' && value.isAudioComponent) {
      value.disconnectFrom(node, inputIndex);
      if (!('ref' in rawValue)) { // only turn it off if it's owned by this AudioComponent, which references aren't
        value.off();
      }
    }
  }

  connectFilter() {
    let rawFilter = this.getProperty('filter', false);
    let filter = this.resolveReference(rawFilter);
    if (filter !== null && this.getNodeToFilter() !== null) {
      if (!('ref' in rawFilter)) {
        filter.on();
      }
      this.getNodeToFilter().connect(filter.getFirstNode(), this.getOutputIndexToFilter());
      if (this.getNodeFromFilter() !== null) {
        filter.connectTo(this.getNodeFromFilter());
      }
    } else {
      if (this.getNodeFromFilter() !== null) {
        this.getNodeToFilter().connect(this.getNodeFromFilter(), this.getOutputIndexToFilter());
      }
    }
  }

  disconnectFilter() {
    let rawFilter = this.getProperty('filter', false);
    let filter = this.resolveReference(rawFilter);
    if (filter !== null && this.getNodeToFilter() !== null) {
      this.constructor.disconnectNodes(this.getNodeToFilter(), this.getOutputIndexToFilter(), filter.getFirstNode());
      if (this.getNodeFromFilter() !== null) {
        filter.disconnectFrom(this.getNodeFromFilter());
      }
      if (!('ref' in rawFilter)) {
        filter.off();
      }
    } else {
      if (this.getNodeFromFilter() !== null) {
        this.constructor.disconnectNodes(this.getNodeToFilter(), this.getOutputIndexToFilter(), this.getNodeFromFilter());
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

  nodeOutputDefinition(outputIndex) {
    return {
      className: 'NodeOutput',
      node: this.node,
      outputIndex: outputIndex
    };
  }
}

export default AudioComponent;