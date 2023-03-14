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
      defaultValue: '12TET'
    }
  ];

  static processorName = 'NoteProcessor';

  constructor() {
    super();
  }
}

export default Note;