class FilterProcessor extends OfftonicAudioplayer.AudioComponentProcessor {
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

OfftonicAudioplayer.registerProcessor('FilterProcessor', FilterProcessor);