import AudioComponent from './AudioComponent.js';

class Timer extends AudioComponent {
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