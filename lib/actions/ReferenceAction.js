import Action from './Action.js';

class ReferenceAction extends Action {
  constructor() {
    super();
    this.refName = null;
  }

  getReference() {
    return this.resolveReference(this.getProperty('refName'));
  }
}

ReferenceAction.newProperties = [
  {
    name: 'refName'
  }
];
ReferenceAction.setupProperties();

export default ReferenceAction;