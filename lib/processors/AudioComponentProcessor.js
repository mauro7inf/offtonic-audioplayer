// This processor must always be loaded first

// we're adding this to the AudioWorkletGlobalScope to get around Firefox's ban on importing modules
globalThis.OfftonicAudioplayer = {};

OfftonicAudioplayer.registerProcessor = function (name, constructor) {
  registerProcessor(name, constructor);
  OfftonicAudioplayer[name] = constructor;
}

class AudioComponentProcessor extends AudioWorkletProcessor {
  static newParameterDescriptors = [
    {
      name: 'done',
      defaultValue: 0,
      automationRate: 'k-rate'
    },
    {
      name: 'timer'
    }
  ];

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
    this.bufferLength = 128;
    this.timedEvents = [];
    this.queuedDurationEvents = [];
    this.port.onmessage = (e) => this.receiveMessage(e);
  }

  process(inputs, outputs, parameters) {
    this.inputs = inputs;
    this.parameters = parameters;
    if (outputs[0][0] !== undefined) {
      this.bufferLength = outputs[0][0].length;
    }
    this.checkTimer();
    if (outputs[0][0] !== undefined) {
      return this._process(outputs);
    } else {
      return !this.isDone();
    }
  }

  _process(outputs) {
    return !this.isDone();
  }

  isDone() {
    return !!this.getParameter('done', 0);
  }

  getParameter(paramName, frame) {
    if (this.parameters !== null && this.parameters[paramName] !== null) {
      return this.parameters[paramName].length > 1 ? this.parameters[paramName][frame] : this.parameters[paramName][0];
    } else {
      return null;
    }
  }

  receiveMessage(e) {
    if ('timedEvent' in e.data) {
      this.handleTimedEvent(e.data.timedEvent);
    }
  }

  handleTimedEvent(timedEvent) {
    if (!('time' in timedEvent) && ('duration' in timedEvent)) {
      if (this.parameters !== null) {
        timedEvent.time = this.getParameter('timer', 0) + timedEvent.duration;
      } else {
        this.queuedDurationEvents.push(timedEvent);
        return;
      }
    }
    let eventIndex = this.timedEvents.length;
    while (eventIndex > 0 && this.timedEvents[eventIndex - 1].time > timedEvent.time) {
      eventIndex--;
    }
    this.timedEvents.splice(eventIndex, 0, timedEvent);
  }

  triggerEvent(event) {
    this.port.postMessage({triggerEvent: event});
  }

  checkTimer() {
    this.handleQueuedDurationEvents();
    let time = this.getParameter('timer', this.bufferLength - 1);
    while (time !== null && this.timedEvents.length > 0 && this.timedEvents[0].time <= time) {
      this.triggerEvent(this.timedEvents[0].event);
      this.timedEvents.shift();
    }
  }

  handleQueuedDurationEvents() {
    if (this.queuedDurationEvents.length > 0) {
      let newQueuedDurationEvents = [];
      while (this.queuedDurationEvents.length > 0) {
        newQueuedDurationEvents.push(this.queuedDurationEvents.shift());
      }
      newQueuedDurationEvents.forEach(durationEvent => {
        this.handleTimedEvent(durationEvent);
      });
    }
  }
}

OfftonicAudioplayer.registerProcessor('AudioComponentProcessor', AudioComponentProcessor);