import ReferenceAction from './ReferenceAction.js';

class PropertyAction extends ReferenceAction {
  constructor() {
    super();
  }

  execute() {
    this.getReference().setProperties(this.getProperty('properties'));
  }
}

PropertyAction.newProperties = [
  {
    name: 'properties',
    default: {},
    componentProperty: false
  }
];
PropertyAction.setupProperties();

export default PropertyAction;