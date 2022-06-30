// This file is generated.  Do not modify it directly! 

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
    this.bufferLength = outputs[0][0].length;
    this.checkTimer();
    return this._process(outputs);
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

registerProcessor('AudioComponentProcessor', AudioComponentProcessor);




class MultiplierProcessor extends AudioComponentProcessor {
  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    if (this.inputs[0].length > 0 && this.inputs[1].length > 0) {
      for (let channel = 0; channel < output.length; channel++) {
        for (let i = 0; i < output[channel].length; i++) {
          output[channel][i] = this.inputs.length > 0 ? 1 : 0;
          for (let input = 0; input < this.inputs.length; input++) {
            output[channel][i] *= this.inputs[input][channel][i];
          }
        }
      }
    }
    return !this.isDone();
  }
}

registerProcessor('MultiplierProcessor', MultiplierProcessor);




class FilterProcessor extends AudioComponentProcessor {
  static newParameterDescriptors = [
    {
      name: 'scaling'
    },
    {
      name: 'offset'
    }
  ];

  constructor(options) {
    super(options);
  }

  _process(outputs) {
    const output = outputs[0];
    for (let frame = 0; frame < output[0].length; frame++) {
      for (let channel = 0; channel < output.length; channel++) {
        if (this.inputs[0].length > 0) {
          output[channel][frame] = this.filter(this.inputs[0][channel][frame], frame, channel)*this.getParameter('scaling', frame) +
            this.getParameter('offset', frame);
        }
      }
    }
    return !this.isDone();
  }

  filter(input, frame, channel) {
    return input;
  }
}

registerProcessor('FilterProcessor', FilterProcessor);




class LinearFilterProcessor extends FilterProcessor {
  constructor(options) {
    super(options);
    this.memory = options.processorOptions.memory;
    this.lastInputs = []; // array index is channel index; value is array of last inputs
    this.lastOutputs = []; // array index is channel index; value is array of last outputs
  }

  filter(input, frame, channel) {
    this.prefillMemory(channel);
    let feedbackCoefficients = this.getFeedbackCoefficients(frame);
    let feedforwardCoefficients = this.getFeedforwardCoefficients(frame);
    let output = feedforwardCoefficients[0]*input;
    for (let i = 1; i < feedforwardCoefficients.length && i < this.memory + 1; i++) {
      output += feedforwardCoefficients[i]*this.lastInputs[channel][i - 1];
    }
    for (let i = 1; i < feedbackCoefficients.length && i < this.memory + 1; i++) {
      output -= feedbackCoefficients[i]*this.lastOutputs[channel][i - 1];
    }
    output /= feedbackCoefficients[0];
    if (!isFinite(output)) {
      output = 0;
    }
    this.addToMemory(input, output, channel);
    return output;
  }

  getFeedbackCoefficients(frame) {
    return [1];
  }

  getFeedforwardCoefficients(frame) {
    return [1];
  }

  prefillMemory(channel) {
    while (this.lastInputs.length <= channel) {
      let newInputs = [];
      for (let i = 0; i < this.memory; i++) {
        newInputs[i] = 0;
      }
      this.lastInputs.push(newInputs);
    }
    while (this.lastOutputs.length <= channel) {
      let newOutputs = [];
      for (let i = 0; i < this.memory; i++) {
        newOutputs[i] = 0;
      }
      this.lastOutputs.push(newOutputs);
    }
  }

  addToMemory(input, output, channel) {
    if (this.memory > 0) {
      this.lastInputs[channel].pop();
      this.lastInputs[channel].unshift(input);
      this.lastOutputs[channel].pop();
      this.lastOutputs[channel].unshift(output);
    }
  }
}

registerProcessor('LinearFilterProcessor', LinearFilterProcessor);




class GeneratorProcessor extends AudioComponentProcessor {
  static newParameterDescriptors = [
    {
      name: 'scaling'
    },
    {
      name: 'offset'
    }
  ];

  constructor(options) {
    super(options);
    this.frame = 0;
  }

  _process(outputs) {
    const output = outputs[0];
    for (let i = 0; i < output[0].length; i++) {
      this.frame = i;
      let value = this.generate()*this.getParameter('scaling', this.frame) + this.getParameter('offset', this.frame);
      for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
        output[channelIndex][i] = value;
      }
    }
    return !this.isDone();
  }

  generate() {
    return 0;
  }
}

registerProcessor('GeneratorProcessor', GeneratorProcessor);




class OscillatorProcessor extends GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.phase = options.processorOptions.initialPhase === null ? Math.random()*2*Math.PI : options.processorOptions.initialPhase;
  }

  generate() {
    let value = this.wave();
    this.updatePhase();
    return value;
  }

  updatePhase() {
    this.phase += this.getParameter('frequency', this.frame)*2*Math.PI/sampleRate;
    while (this.phase < 0) {
      this.phase += 2*Math.PI;
    }
    while (this.phase >= 2*Math.PI) {
      this.phase -= 2*Math.PI;
    }
  }

  wave() {
    return 0;
  }
}

registerProcessor('OscillatorProcessor', OscillatorProcessor);




class SawtoothOscillatorProcessor extends OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let k = this.getParameter('pulseWidth', this.frame);
    let twoPiK = k*2*Math.PI;
    if (this.phase < twoPiK) {
      return 1 - this.phase/twoPiK;
    } else {
      return (twoPiK - this.phase)/(2*Math.PI - twoPiK);
    }
  }
}

registerProcessor('SawtoothOscillatorProcessor', SawtoothOscillatorProcessor);




class SquareOscillatorProcessor extends OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let k = this.getParameter('pulseWidth', this.frame);
    if (this.phase < k*2*Math.PI) {
      return 1;
    } else {
      return -1;
    }
  }
}

registerProcessor('SquareOscillatorProcessor', SquareOscillatorProcessor);




class WhiteNoiseGeneratorProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
  }

  generate() {
    return 2*Math.random() - 1;
  }
}

registerProcessor('WhiteNoiseGeneratorProcessor', WhiteNoiseGeneratorProcessor);




class TimerProcessor extends GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'tempo'
    }
  ];

  constructor(options) {
    super(options);
    this.time = options.processorOptions.initialTime;
  }
  
  generate() {
    this.time += this.getParameter('tempo', this.frame)/(60*sampleRate);
    return this.time;
  }
}

registerProcessor('TimerProcessor', TimerProcessor);




class EnvelopeProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
    this.phase = 'main';
    this.phaseHandlers = {
      release: () => this.startRelease()
    };
  }

  generate() {
    return 1; // no-op, essentially
  }

  changePhase(phase) {
    this.phase = phase;
    this.port.postMessage({phase: phase});
    if (this.phase in this.phaseHandlers) {
      this.phaseHandlers[this.phase]();
    }
  }

  receiveMessage(e) {
    super.receiveMessage(e);
    if ('phase' in e.data) {
      this.phase = e.data.phase;
      if (this.phase in this.phaseHandlers) {
        this.phaseHandlers[this.phase]();
      }
    }
  }

  startRelease() {
    this.changePhase('stop');
  }
}

registerProcessor('EnvelopeProcessor', EnvelopeProcessor);




class FirstOrderFilterProcessor extends LinearFilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'a0'
    },
    {
      name: 'a1'
    },
    {
      name: 'b0'
    },
    {
      name: 'b1'
    }
  ];

  constructor(options) {
    super(options);
  }

  getFeedbackCoefficients(frame) {
    return [this.getParameter('a0', frame), this.getParameter('a1', frame)];
  }

  getFeedforwardCoefficients(frame) {
    return [this.getParameter('b0', frame), this.getParameter('b1', frame)];
  }
}

registerProcessor('FirstOrderFilterProcessor', FirstOrderFilterProcessor);




class LinearGeneratorProcessor extends GeneratorProcessor {
  constructor(options) {
    super(options);
    this.isAbsolute = options.processorOptions.isAbsolute;
    this.startTime = options.processorOptions.startTime;
    this.startValue = options.processorOptions.startValue;
    this.endTime = options.processorOptions.endTime;
    this.endValue = options.processorOptions.endValue;
    this.timesSet = this.isAbsolute;
  }

  generate() {
    let time = this.getParameter('timer', this.frame);
    if (!this.timesSet && time !== null) {
      this.startTime += time;
      this.endTime += time;
      this.timesSet = true;
    }
    if (time === null || time < this.startTime) {
      return this.startValue;
    } else if (time > this.endTime) {
      return this.endValue;
    } else {
      return this.startValue + (this.endValue - this.startValue)*(time - this.startTime)/(this.endTime - this.startTime);
    }
  }
}

registerProcessor('LinearGeneratorProcessor', LinearGeneratorProcessor);




class SineOscillatorProcessor extends OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let normalizedPhase = this.phase;
    let k = this.getParameter('pulseWidth', this.frame);
    if (k !== 0.5) {
      if (this.phase < k*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*this.phase;
      } else if (this.phase > (2 - k)*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*(this.phase - 2*Math.PI) + 2*Math.PI;
      } else {
        normalizedPhase = (1/(2 - 2*k))*(this.phase - Math.PI) + Math.PI;
      }
    }
    return Math.sin(normalizedPhase);
  }
}

registerProcessor('SineOscillatorProcessor', SineOscillatorProcessor);




class ADSREnvelopeProcessor extends EnvelopeProcessor {
  constructor(options) {
    super(options);
    this.attack = options.processorOptions.attack;
    this.attackGain = options.processorOptions.attackGain;
    this.decay = options.processorOptions.decay;
    this.release = options.processorOptions.release;
    this.currentFrame = 0;
    this.attackUntilFrame = (sampleRate/1000)*this.attack;
    this.decayUntilFrame = this.attackUntilFrame + (sampleRate/1000)*this.decay;
    this.releaseStartFrame = null;
    this.releaseUntilFrame = null;
    this.releaseFromValue = null;
    this.value = 0;
  }

  generate() {
    if (this.phase === 'main') {
      if (this.currentFrame <= this.attackUntilFrame) {
        this.value = (this.currentFrame/this.attackUntilFrame)*this.attackGain
      } else if (this.currentFrame <= this.decayUntilFrame) {
        this.value = ((this.currentFrame - this.attackUntilFrame)/(this.decayUntilFrame - this.attackUntilFrame)) *
          (1 - this.attackGain) + this.attackGain;
      } else {
        this.value = 1;
      }
    } else if (this.phase === 'release') {
      if (this.currentFrame <= this.releaseUntilFrame) {
        this.value = (1 - ((this.currentFrame - this.releaseStartFrame)/(this.releaseUntilFrame - this.releaseStartFrame))) *
          this.releaseFromValue;
      } else {
        this.value = 0;
        this.changePhase('stop');
      }
    } else if (this.phase === 'stop') {
      this.value = 0;
    }
    this.currentFrame++;
    return this.value;
  }

  startRelease() {
    this.releaseStartFrame = this.currentFrame;
    this.releaseUntilFrame = this.currentFrame + (sampleRate/1000)*this.release;
    this.releaseFromValue = this.value;
  }
}

registerProcessor('ADSREnvelopeProcessor', ADSREnvelopeProcessor);




class StepFilterProcessor extends FilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'steps'
    },
    {
      name: 'highCutoff'
    },
    {
      name: 'lowCutoff'
    }
  ];

  constructor(options) {
    super(options);
  }

  filter(input, frame, channel) {
    let output = input;
    let high = this.getParameter('highCutoff', frame);
    let low = this.getParameter('lowCutoff', frame);
    if (high < low) {
      let temp = high;
      high = low;
      low = temp;
    }
    let width = high - low;
    let steps = this.getParameter('steps', frame);
    if (steps <= 1) {
      return (high + low)/2;
    }
    // divide the range into n slices
    let sliceWidth = width/steps;
    let sliceIndex = Math.floor((input - low)/sliceWidth)
    if (input === high) { // don't count top edge as belonging to the first slice out of the range
      sliceIndex--;
    }
    output = low + sliceIndex*(width/(steps - 1));

    return output;
  }
}

registerProcessor('StepFilterProcessor', StepFilterProcessor);




class TriangleOscillatorProcessor extends OscillatorProcessor {
  static newParameterDescriptors = [
    {
      name: 'pulseWidth'
    }
  ];

  constructor(options) {
    super(options);
  }

  wave() {
    let normalizedPhase = this.phase;
    let k = this.getParameter('pulseWidth', this.frame);
    if (k !== 0.5) {
      if (this.phase < k*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*this.phase;
      } else if (this.phase > (2 - k)*Math.PI && k !== 0) {
        normalizedPhase = (1/(2*k))*(this.phase - 2*Math.PI) + 2*Math.PI;
      } else {
        normalizedPhase = (1/(2 - 2*k))*(this.phase - Math.PI) + Math.PI;
      }
    }
    if (normalizedPhase < Math.PI/2) {
      return normalizedPhase*2/Math.PI;
    } else if (normalizedPhase < 3*Math.PI/2) {
      return 2 - normalizedPhase*2/Math.PI
    } else {
      return normalizedPhase*2/Math.PI - 4;
    }
  }
}

registerProcessor('TriangleOscillatorProcessor', TriangleOscillatorProcessor);




class CutoffFilterProcessor extends FilterProcessor {
  static newParameterDescriptors = [
    {
      name: 'highCutoff'
    },
    {
      name: 'lowCutoff'
    }
  ];

  constructor(options) {
    super(options);
    this.isNormalized = options.processorOptions.isNormalized;
  }

  filter(input, frame, channel) {
    let output = input;
    let high = this.getParameter('highCutoff', frame);
    let low = this.getParameter('lowCutoff', frame);
    if (high < low) {
      let temp = high;
      high = low;
      low = temp;
    }
    if (input > high) {
      output = high;
    } else if (input < low) {
      output = low;
    }
    if (this.isNormalized) {
      output = (output - (high + low)/2)*(2/(high - low));
    }
    return output;
  }
}

registerProcessor('CutoffFilterProcessor', CutoffFilterProcessor);




class RedNoiseGeneratorProcessor extends GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    }
  ];

  constructor(options) {
    super(options);
    this.value = options.processorOptions.initialValue === null ? 2*Math.random() - 1 : options.processorOptions.initialValue;
  }

  generate() {
    let r = Math.exp(-this.getParameter('frequency', this.frame)/sampleRate);
    let s = Math.sqrt(1 - r*r);
    this.value = s*(2*Math.random() - 1) + r*this.value;
    return this.value;
  }
}

registerProcessor('RedNoiseGeneratorProcessor', RedNoiseGeneratorProcessor);


