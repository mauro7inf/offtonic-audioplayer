class PrototypeProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = 0.1*(Math.random()*2 - 1);
      }
    });
    return true;
  }
}

registerProcessor('PrototypeProcessor', PrototypeProcessor);