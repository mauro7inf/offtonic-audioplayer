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

  static create(properties, player, registry, tuning) {
    properties = registry.orchestra.applyInstruments(properties);
    let constructor = this;
    if ('className' in properties) {
      constructor = this.o.getClass(properties.className);
    }
    let tuningToUse = tuning;
    let hasOwnTuning = false;
    if ('tuning' in properties && properties.tuning !== null && typeof properties.tuning === 'object') {
      if ('className' in properties.tuning) {
        let newTuning = this.o.createComponent(properties.tuning, player, registry, tuning);
        newTuning.play();
        tuningToUse = newTuning;
        hasOwnTuning = true;
      } else if ('ref' in properties.tuning) {
        tuningToUse = registry.get(properties.tuning.ref);
      } else { // assume it's an actual Tuning object
        tuningToUse = properties.tuning;
      }
    }
    return (new constructor()).withPlayer(player).withRegistry(registry).withTuning(tuningToUse, hasOwnTuning).withProperties(properties);
  }

  constructor() {
    this.ctx = this.constructor.o.ctx;
    this.isComponent = true;
    this.player = null;
    this.registry = null;
    this.orchestra = null;
    this.tuning = null;
    this.hasOwnTuning = false;
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
    this.orchestra = registry.orchestra;
  }

  withTuning(tuning, hasOwnTuning) {
    this.setTuning(tuning, hasOwnTuning);
    return this;
  }

  setTuning(tuning, hasOwnTuning) {
    this.tuning = tuning;
    this.hasOwnTuning = hasOwnTuning;
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
      } else if (descriptor.name in properties) {
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

  hasProperty(propertyName) {
    return (propertyName in this.constructor.propertyDescriptors);
  }

  getProperty(propertyName, resolveReference) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    let value = null;
    if ('getter' in descriptor) {
      if (descriptor.getter !== null) {
        value = this[descriptor.getter]();
      } else {
        value = undefined;
      }
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
    value = this.createPropertyValue(descriptor, value);
    if ('setter' in descriptor) {
      if (descriptor.setter !== null) {
        this[descriptor.setter](value);
      }
    } else {
      this.cleanupProperty(propertyName);
      this.genericSetter(propertyName, value);
    }
  }

  createPropertyValue(descriptor, value) {
    if (value !== null && typeof value === 'object' && 'className' in value) {
      return this.createComponent(value);
    } else if (descriptor.isAudioComponent && value !== null && typeof value === 'number') {
      return this.createComponent({
        className: 'ConstantGenerator',
        value: value
      });
    } else if ((descriptor.isAudioComponent || descriptor.isAudioParam) && value !== null && typeof value === 'string') {
      return this.createComponent({
        className: 'Note',
        tuningName: this.tuning.getTuningName(),
        note: value
      });
    } else if (descriptor.isComponentArray && Array.isArray(value)) {
      let createdArray = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== null && typeof value[i] === 'object' && 'className' in value[i]) {
          createdArray.push(this.constructor.o.createComponent(value[i], this.player, this.registry, this.tuning));
        } else if (value[i] !== null && typeof value[i] === 'string') {
          createdArray.push(this.createComponent({
            className: 'Note',
            tuningName: this.tuning.getTuningName(),
            note: value[i]
          }));
        } else {
          createdArray.push(value[i]);
        }
      }
      return createdArray;
    }
    return value;
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
    if (this.hasOwnTuning) {
      this.tuning.stop();
    }
  }

  cleanupProperty(propertyName) {
    let descriptor = this.constructor.propertyDescriptors[propertyName];
    if ('cleaner' in descriptor) {
      if (descriptor.cleaner !== null) {
        this[descriptor.cleaner]();
      }
    } else {
      this.genericCleaner(propertyName);
    }
  }

  genericCleaner(propertyName) {
    this.cleanupComponent(this[propertyName]);
    this[propertyName] = null;
  }

  cleanupComponent(component) {
    if (component != null && typeof component === 'object' && component.isComponent) {
      component.cleanup();
    }
  }

  cleanupName() {
    if (this.name !== null) {
      this.registry.remove(this.name);
    }
    this.name = null;
  }

  createComponent(properties) {
    return this.constructor.o.createComponent(properties, this.player, this.registry, this.tuning);
  }

  identify() {
    console.log(this);
  }
}

export default Component;