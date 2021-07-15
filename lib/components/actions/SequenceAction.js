import MethodAction from './MethodAction.js';

class SequenceAction extends MethodAction {
  static newPropertyDescriptors = [
    {
      name: 'target',
      value: null,
      cleaner: null
    }
  ];

  constructor() {
    super();
  }

  perform(sequence) {
    this.target = sequence;
    super.perform(sequence);
  }
}

export default SequenceAction;