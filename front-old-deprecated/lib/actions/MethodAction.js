import ReferenceAction from './ReferenceAction.js';

class MethodAction extends ReferenceAction {
  constructor() {
    super();
    this.executeMethod = null;
    this.executeArguments = null;
  }

  execute() {
    let component = this.getReference();
    component[this.executeMethod].apply(component, this.getProperty('executeArguments'));
  }
}

MethodAction.newProperties = {
  executeMethod: {},
  executeArguments: {
    default: undefined
  }
};
MethodAction.setupProperties();

export default MethodAction;