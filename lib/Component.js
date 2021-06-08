class Component {
  static o;

  static newPropertyDescriptors = [];

  // Object where each key is the name of a property, and its value is its descriptor
  static get propertyDescriptors() {
    if (!this.hasOwnProperty('generatedPropertyDescriptors')) {
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

  static create(properties, player) {
    let constructor = this;
    if ('className' in properties) {
      constructor = this.o.getClass(properties.className);
    }
    return (new constructor()).withPlayer(player).withProperties(properties);
  }

  constructor() {
    this.ctx = this.constructor.o.ctx;
    this.isComponent = true;
    this.player = null;
  }

  withPlayer(player) {
    this.setPlayer(player);
    return this;
  }

  setPlayer(player) {
    this.player = player;
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
    this.finishSetup();
  }

  finishSetup() {
    // no-op
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
    if (!(propertyName in this.constructor.propertyDescriptors)) {
      return;
    }
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if (value !== null && typeof value === 'object' && 'className' in value) {
      value = this.constructor.o.createComponent(value, this.player);
    } else if (descriptor.isAudioComponent && value !== null && typeof value === 'number') {
      value = this.constructor.o.createComponent({
        className: 'ConstantGenerator',
        value: value
      }, this.player);
    } else if (value !== null && typeof value === 'object' && 'ref' in value) {
      // TODO references
    }
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

  cleanup() {
    Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => this.cleanupProperty(propertyName));
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
}

export default Component;