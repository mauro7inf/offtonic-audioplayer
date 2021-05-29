import ReferenceAction from './ReferenceAction.js';

class PropertyAction extends ReferenceAction {
  constructor() {
    super();
  }

  execute() {
    this.getReference().setProperties(this.getProperty('properties'), this.getProperty('path'));
  }
}

PropertyAction.newProperties = {
  properties: {
    default: {},
    componentProperty: false
  },
  path: {
    default: undefined
  }
};
PropertyAction.setupProperties();

export default PropertyAction;