import Generator from './generators/Generator.js';

class Timer extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'tempo',
      isAudioParam: true,
      defaultValue: 60000
    },
    {
      name: 'initialTime',
      isProcessorOption: true,
      defaultValue: 0
    }
  ];

  static processorName = 'TimerProcessor';

  constructor() {
    super();
    this.tempo = null;
  }
}

export default Timer;