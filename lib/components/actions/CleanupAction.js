import Action from './Action.js';

class CleanupAction extends Action {
  static newPropertyDescriptors = [
    {
      name: 'component',
      defaultValue: null,
      cleaner: null
    }
  ];

  constructor() {
    super();
    this.component = null;
  }

  perform(sequence) {
    let component = this.getProperty('component');
    if (component !== null) {
      sequence.removeFromCreated(component);
    }
    super.perform(sequence);
  }
}

export default CleanupAction;