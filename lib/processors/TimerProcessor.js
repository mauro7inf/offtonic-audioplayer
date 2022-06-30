class TimerProcessor extends OfftonicAudioplayer.GeneratorProcessor {
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

OfftonicAudioplayer.registerProcessor('TimerProcessor', TimerProcessor);