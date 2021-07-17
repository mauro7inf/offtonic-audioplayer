import Action from './Action.js';

class CreateAction extends Action {
  static newPropertyDescriptors = [
    {
      name: 'component',
      defaultValue: null,
      cleaner: null
    },
    {
      name: 'store',
      defaultValue: true
    },
    {
      name: 'run',
      defaultValue: true
    }
  ];

  constructor() {
    super();
    this.component = null;
    this.store = null;
    this.run = null;
  }

  perform(sequence) {
    let component = this.getProperty('component');
    if (component !== null) {
      if (component.isAudioComponent && this.getProperty('run')) {
        component.on();
      }
      if (this.getProperty('store')) {
        sequence.registerCreated(component);
      }
    }
    super.perform(sequence);
  }
}

export default CreateAction;