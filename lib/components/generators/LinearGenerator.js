import Generator from './Generator.js';

class LinearGenerator extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'timer',
      isAudioParam: true,
      defaultValue: {
       ref: 'Default Timer'
      }
    },
    {
      name: 'startTime',
      isProcessorOption: true,
      defaultValue: 0
    },
    {
      name: 'startValue',
      isAudioParam: true,
      defaultValue: 0
    },
    {
      name: 'endTime',
      isProcessorOption: true,
      defaultValue: 1000
    },
    {
      name: 'endValue',
      isAudioParam: true,
      defaultValue: 1
    },
    {
      name: 'isAbsolute',
      isProcessorOption: true,
      defaultValue: false
    }
  ];

  static processorName = 'LinearGeneratorProcessor';

  constructor() {
    super();
    this.startTime = null;
    this.startValue = null;
    this.endTime = null;
    this.endValue = null;
    this.isAbsolute = null;
  }
}

export default LinearGenerator;