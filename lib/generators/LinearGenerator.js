import AudioComponent from '../AudioComponent.js';

class LinearGenerator extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: {
        className: 'Timer' // TODO global timer reference?
      }
    },
    {
      name: 'startTime',
      isProcessorOption: true,
      defaultValue: 0
    },
    {
      name: 'startValue',
      isProcessorOption: true,
      defaultValue: 0
    },
    {
      name: 'endTime',
      isProcessorOption: true,
      defaultValue: 1000
    },
    {
      name: 'endValue',
      isProcessorOption: true,
      defaultValue: 1
    }
  ];

  static processorName = 'LinearGeneratorProcessor';

  constructor() {
    super();
    this.startTime = null;
    this.startValue = null;
    this.endTime = null;
    this.endValue = null;
  }
}

export default LinearGenerator;