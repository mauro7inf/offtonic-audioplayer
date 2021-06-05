class MultiplierProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        output[channel][i] = inputs[0][channel][i];
        for (let input = 1; input < inputs.length; input++) {
          output[channel][i] *= inputs[input][channel][i];
        }
      }
    }
    return true;
  }
}

registerProcessor('MultiplierProcessor', MultiplierProcessor);