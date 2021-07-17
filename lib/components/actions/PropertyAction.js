import Action from './Action.js';

class PropertyAction extends Action {
  static newPropertyDescriptors = [
    {
      name: 'component',
      defaultValue: null,
      cleaner: null
    },
    {
      name: 'properties',
      defaultValue: {}
    },
    {
      name: 'path',
      defaultValue: []
    }
  ];

  constructor() {
    super();
    this.component = null;
    this.properties = null;
    this.path = null;
  }

  perform(sequence) {
    let component = this.getProperty('component');
    if (component !== null) {
      let path = this.getProperty('path');
      if (!Array.isArray(path)) {
        path = [path];
      }
      path.forEach(pathElement => {
        if (component !== null && component !== undefined && typeof component === 'object' && component.isComponent &&
            component.hasProperty(pathElement)) {
          component = component.getProperty(pathElement);
        } else if (component !== null && component !== undefined) {
          component = component[pathElement];
        }
      });
      if (component !== null && component !== undefined && typeof component === 'object') {
        let properties = this.getProperty('properties');
        if (component.isComponent) {
          component.setProperties(properties);
        } else {
          Object.entries(properties).forEach(entry => component[entry[0]] = entry[1]);
        }
      }
    }
    super.perform(sequence);
  }
}

export default PropertyAction;