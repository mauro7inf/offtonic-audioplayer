import Generator from './generators/Generator.js';

class Note extends Generator {
  static newPropertyDescriptors = [
    {
      name: 'note',
      isProcessorOption: true,
      defaultValue: 'C4'
    },
    {
      name: 'tuningName',
      isProcessorOption: true,
      defaultValue: null,
      getter: 'getTuningName'
    }
  ];

  static processorName = 'NoteProcessor';

  constructor() {
    super();
    this.tuningName = null;
  }

  getTuningName() {
    if (this.tuningName !== null) {
      return this.tuningName;
    } else {
      return this.tuning.getTuningName();
    }
  }
}

export default Note;