class AudioComponentProcessor extends AudioWorkletProcessor {
  static newParameterDescriptors = [];

  static get parameterDescriptors() {
    if (!this.hasOwnProperty('generatedParameterDescriptors')) {
      this.generateParameterDescriptors();
    }
    return this.generatedParameterDescriptors;
  }

  static generateParameterDescriptors() {
    let descriptors = {};
    if ('parameterDescriptors' in Object.getPrototypeOf(this)) {
      Object.getPrototypeOf(this).parameterDescriptors.forEach(descriptor => {
        descriptors[descriptor.name] = descriptor;
      });
    }
    if (this.hasOwnProperty('newParameterDescriptors')) {
      this.newParameterDescriptors.forEach(descriptor => {
        descriptors[descriptor.name] = descriptor;
      });
    }
    this.generatedParameterDescriptors = Object.values(descriptors);
  }

  constructor(options) {
    super(options);
    this.inputs = null;
    this.parameters = null;
    this.port.onmessage = (e) => this.receiveMessage(e);
  }

  process(inputs, outputs, parameters) {
    this.inputs = inputs;
    this.parameters = parameters;
    return this._process(outputs);
  }

  _process(outputs) {
    return true;
  }

  getParameter(paramName, frame) {
    return this.parameters[paramName].length > 1 ? this.parameters[paramName][frame] : this.parameters[paramName][0];
  }

  receiveMessage(e) {
    // no-op
  }
}

export default AudioComponentProcessor