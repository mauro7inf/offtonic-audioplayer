class Component {
  static o;

  static newPropertyDescriptors = [
    {
      name: 'name',
      defaultValue: null,
      setter: 'setName',
      cleaner: 'cleanupName'
    }
  ];

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

  static create(properties, player, registry) {
    properties = this.o.orchestra.applyInstruments(properties);
    let constructor = this;
    if ('className' in properties) {
      constructor = this.o.getClass(properties.className);
    }
    return (new constructor()).withPlayer(player).withRegistry(registry).withProperties(properties);
  }

  constructor() {
    this.ctx = this.constructor.o.ctx;
    this.isComponent = true;
    this.player = null;
    this.registry = null;
    this.name = null;
  }

  withPlayer(player) {
    this.setPlayer(player);
    return this;
  }

  setPlayer(player) {
    this.player = player;
  }

  withRegistry(registry) {
    this.setRegistry(registry);
    return this;
  }

  setRegistry(registry) {
    this.registry = registry;
  }

  withProperties(properties) {
    this.setProperties(properties, true);
    return this;
  }

  setProperties(properties, useDefault) {
    Object.values(this.constructor.propertyDescriptors).forEach(descriptor => {
      if ('value' in descriptor) {
        if (useDefault) {
          this.setProperty(descriptor.name, descriptor.value);
        }
      } if (descriptor.name in properties) {
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

  getProperty(propertyName, resolveReference) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    let value = null;
    if ('getter' in descriptor) {
      value =this[descriptor.getter]();
    } else {
      value = this.genericGetter(propertyName);
    }
    if (resolveReference === false) {
      return value;
    } else {
      return this.resolveReference(value);
    }
  }

  resolveReference(reference) {
    if (reference !== null && typeof reference === 'object' && 'ref' in reference) {
      return this.registry.get(reference.ref);
    } else {
      return reference;
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
      value = this.constructor.o.createComponent(value, this.player, this.registry);
    } else if (descriptor.isAudioComponent && value !== null && typeof value === 'number') {
      value = this.constructor.o.createComponent({
        className: 'ConstantGenerator',
        value: value
      }, this.player, this.registry);
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

  setName(name) {
    this.cleanupProperty('name');
    this.name = name;
    if (this.name !== null) {
      this.registry.add(this);
    }
  }

  cleanup() {
    Object.keys(this.constructor.propertyDescriptors).forEach(propertyName => this.cleanupProperty(propertyName));
  }

  cleanupProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('cleaner' in descriptor) {
      this[descriptor.cleaner]();
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

  cleanupName() {
    if (this.name !== null) {
      this.registry.remove(this.name);
    }
    this.name = null;
  }
}

export default Component;