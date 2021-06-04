class Component {
  static o;

  static newPropertyDescriptors = [];

  static generatedPropertyDescriptors = null;

  // Object where each key is the name of a property, and its value is its descriptor
  static get propertyDescriptors() {
    if (this.generatedPropertyDescriptors === null) {
      this.generatePropertyDescriptors();
    }
    return this.generatedPropertyDescriptors;
  }

  static generatePropertyDescriptors() {
    let descriptors = {};
    if ('propertyDescriptors' in Object.getPrototypeOf(this)) {
      Object.values(Object.getPrototypeOf(this).propertyDescriptors).forEach(descriptor => {
        descriptors[descriptor.name] = descriptor;
      });
    }
    if (this.hasOwnProperty('newPropertyDescriptors')) {
      this.newPropertyDescriptors.forEach(descriptor => {
        descriptors[descriptor.name] = descriptor;
      });
    }
    this.generatedPropertyDescriptors = descriptors;
  }

  static create(properties) {
    return (new this()).withProperties(properties);
  }

  constructor() {
    this.ctx = this.constructor.o.ctx;
    this.isComponent = true;
  }

  withProperties(properties) {
    this.setProperties(properties, true);
    return this;
  }

  setProperties(properties, useDefault) {
    Object.values(this.constructor.propertyDescriptors).forEach(descriptor => {
      if (descriptor.name in properties) {
        this.setProperty(descriptor.name, properties[descriptor.name]);
      } else if (useDefault && 'defaultValue' in descriptor) {
        this.setProperty(descriptor.name, descriptor.defaultValue);
      }
    });
  }

  getProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('getter' in descriptor) {
      return this[descriptor.getter]();
    } else {
      return this.genericGetter(propertyName);
    }
  }

  genericGetter(propertyName) {
    return this[propertyName];
  }

  setProperty(propertyName, value) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('setter' in descriptor) {
      this[descriptor.setter](value);
    } else {
      this.cleanupProperty(propertyName);
      this.genericSetter(propertyName, value);
    }
  }

  genericSetter(propertyName, value) {
    this[propertyName] = value;
  }

  cleanupProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('cleaner' in descriptor) {
      this[descriptor.cleaner];
    } else {
      this.genericCleaner(propertyName);
    }
  }

  genericCleaner(propertyName) {
    if (this[propertyName] != null && typeof this[propertyName] === 'object' && this[propertyName].isComponent) {
      this[propertyName].cleanup();
    }
    this[propertyName] = null;
  }

  cleanup() {
    Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => this.cleanupProperty(propertyName));
  }
}

export default Component;