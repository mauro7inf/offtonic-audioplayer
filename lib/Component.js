class Component {
  constructor() {
    this.isComponent = true;
    this.player = null;
    this.parent = null;
    this.name = null;
    this.registered = false;
    this.mspa = this.constructor.globalContext.mspa;
  }

  static create(properties, player, parent) { // properties are an object of uninstantiated property inputs
    if (typeof properties === 'object' && properties !== null && 'className' in properties) {
      let createWithPlayer = player;
      if (player === undefined) {
        createWithPlayer = this.globalContext.player;
      }
      let createWithParent = parent;
      if (parent === undefined) {
        createWithParent = null;
      }
      let classInstance = this.globalContext.classRegistry.get(properties.className);
      let created = (new classInstance()).setPlayer(createWithPlayer).setParent(createWithParent).withProperties(properties);
      created._finalSetup();
      return created;
    } else {
      return properties;
    }
  }

  static _getProperties() { // this static method will be inherited by subclasses and build a list of properties recursively
    let properties = {};
    if (`_getProperties` in Object.getPrototypeOf(this)) {
      let superclassProperties = Object.getPrototypeOf(this)._getProperties();
      for (let property in superclassProperties) {
        properties[property] = superclassProperties[property]; // shallow copy
      }
    }
    if (this.hasOwnProperty('newProperties'))
    {
      for (let property in this.newProperties) {
        properties[property] = this.newProperties[property];
      }
    }
    return properties;
  }

  static setupProperties() { // set up class property definitions
    if (this.hasOwnProperty('newProperties') && Array.isArray(this.newProperties)) {
      console.warn('newProperties is an array: ', this);
    }
    this.properties = this._getProperties();
    for (let propertyName in this.properties) {
      this.properties[propertyName].name = propertyName;
    }
  }

  static isComponent(component) {
    return component !== null && typeof component === 'object' && component.isComponent === true;
  }

  _finalSetup() {
    // do nothing
  }

  getValue(property) { // property is a stored component
    let resolvedProp = property;
    if (property !== null && typeof property === 'object' && 'ref' in property) { // if it has a ref, it's a reference; ignore everything else
      resolvedProp = this.resolveReference(property);
    }

    let propValue = undefined
    if (resolvedProp === null || typeof resolvedProp !== 'object' || !('generate' in resolvedProp) || typeof resolvedProp.generate !== 'function') {
      propValue = resolvedProp;
    } else if ('generate' in resolvedProp) {
      propValue = resolvedProp.generate();
    }

    return propValue;
  }

  getComponentValue(property) { // property is a stored component
    if (property !== null && typeof property === 'object' && 'ref' in property) {
      return this.resolveReference(property);
    } else {
      return property;
    }
  }

  resolveReference(property) { // property is a stored component (that is a reference)
    return this.player.registry.get(property.ref);
  }

  withProperties(properties) { // used at instantiation; properties is an object of property inputs
    this._setProperties(properties, true, undefined);
    return this;
  }

  setProperties(properties, path) { // used to modify properties; properties is an object of property inputs
    this._setProperties(properties, false, path);
    return this;
  }

  getProperty(propertyName, index) {
    if ('getter' in this.constructor.properties[propertyName]) {
      return this[this.constructor.properties[propertyName].getter](index); // custom getter
    }
    return this._getProperty(propertyName, index);
  }

  _getProperty(propertyName, index) {
    if (!(propertyName in this)) {
      return undefined;
    }
    if (index === undefined) {
      if (Array.isArray(this[propertyName])) {
        return this[propertyName].map(e => this.getValue(e));
      } else {
        return this.getValue(this[propertyName]);
      }
    } else {
      return this.getValue(this[propertyName][index]);
    }
  }

  getComponentProperty(propertyName, index) {
    if (index === undefined) {
      return this.getComponentValue(this[propertyName]);
    } else {
      return this.getComponentValue(this[propertyName][index]);
    }
  }

  _setProperties(properties, useDefault, path) { // properties is an object of property inputs
    if (path !== undefined) {
      // this has no error handling whatsoever
      // we're assuming that the property at the given path is the right thing: we assume that it's a Component or an array of Components,
      // and in the array case, we assume that the next path element is an index into that array,
      // and we assume that none of the indices are out of bounds, etc.
      let index = 0;
      let nextProperty = this;
      while (index < path.length) {
        nextProperty = nextProperty[path[index]];
        index++;
      }
      nextProperty._setProperties(properties, useDefault, undefined);
    } else {
      if ('instrument' in properties) {
        if (Array.isArray(properties.instrument)) {
          for (let i = 0; i < properties.instrument.length; i++) {
            this._applyInstrument(properties, properties.instrument[i]); // array of instruments
          }
        } else {
          this._applyInstrument(properties, properties.instrument);
        }
      }

      let propertyDefinitions = this.properties();
      for (let propertyName in propertyDefinitions) {
        let propertyDefinition = propertyDefinitions[propertyName];
        if (propertyDefinition.setter === null) {
          continue;
        }
        if (propertyDefinition.list) {
          if (propertyDefinition.removerName in properties) {
            this._removeFromListProperty(propertyDefinition, properties[propertyDefinition.removerName]);
          }
          if (propertyName in properties) {
            this._setListProperty(propertyDefinition, properties[propertyName]);
          } else if (useDefault && 'default' in propertyDefinition) {
            this._setListProperty(propertyDefinition, propertyDefinition.default);
          }
        } else {
          if (propertyName in properties) {
            this._setValueProperty(propertyDefinition, properties[propertyName]);
          } else if (useDefault && 'default' in propertyDefinition) {
            this._setValueProperty(propertyDefinition, propertyDefinition.default);
          }
        }
      }
    }
  }

  _applyInstrument(properties, instrumentName) { // properties is an object of property inputs
    let instrument = this.player.orchestra.get(instrumentName); // TODO: doesn't work with list properties yet
    for (let property in instrument) {
      if (!(property in properties) && property !== 'name') {
        properties[property] = instrument[property];
      }
    }
  }

  _genericSetter(propertyName, propertyValue) { // propertyValue is a stored property
    this.cleanupProperty(propertyName);
    this[propertyName] = propertyValue;
  }

  _setValueProperty(definition, property) { // property is a property input value
    let arrayProp = property; // we would assume that prop here is an array of component definitions or numbers or whatever,
    // but if it's not, let the subclass handle it
    if (Array.isArray(property)) {
      arrayProp = [];
      for (let i = 0; i < property.length; i++) {
        let propToPush = property[i];
        if (definition.componentProperty !== false) {
          propToPush = this.constructor.create(property[i], this.player, this);
        }
        arrayProp.push(this.constructor.create(propToPush));
      }
    } else if (definition.componentProperty !== false) {
      arrayProp = this.constructor.create(arrayProp, this.player, this);
    }
    if ('setter' in definition) {
      this[definition.setter](arrayProp);
    } else {
      this._genericSetter(definition.name, arrayProp);
    }
  }

  _setListProperty(definition, property) { // property is a property input value that happens to be an array
    for (let i = 0; i < property.length; i++) {
      let propToAdd = property[i];
      if (definition.componentProperty !== false) {
        propToAdd = this.constructor.create(property[i], this.player, this);
      }
      this[definition.adder](propToAdd);
    }
  }

  _removeFromListProperty(definiton, indices) {
    if (typeof indices === 'number') {
      this[definition.remover](indices);
    } else { // assuming array of numbers
      indices.sort((a, b) => {return b - a;});
      for (let i = 0; i < indices.length; i++) {
        if (i === 0 || indices[i] !== indices[i - 1]) { // don't remove duplicates twice
          this[definition.remover](indices[i]);
        }
      }
    }
  }

  _setName(name) {
    if (name !== null) {
      if (name !== this.name && this.registered) {
        this.unregister();
      }
      this.name = name;
      this.register();
    } else {
      this.unregister();
      this.name = null;
    }
  }

  setPlayer(player) {
    if (this.player === null || this.player.id !== player.id) {
      let needsRegistration = false;
      if (this.registered) {
        needsRegistration = true;
        this.unregister();
      }
      this.player = player;
      if (needsRegistration) {
        this.register();
      }
    }
    return this;
  }

  setParent(parent) {
    this.parent = parent;
    return this;
  }

  play() {
    let propertyDefinitions = this.properties();
    for (let propertyName in propertyDefinitions) {
      let propertyDefinition = propertyDefinitions[propertyName];
      let storedProperty = this[propertyName];
      if (this.constructor.isComponent(storedProperty)) {
        storedProperty.play();
      }
      if (propertyDefinition.list) {
        for (let j = 0; j < storedProperty.length; j++) {
          if (this.constructor.isComponent(storedProperty[j])) {
            storedProperty[j].play();
          }
        }
      }
    }
  }

  off() {
    let propertyDefinitions = this.properties();
    for (let propertyName in propertyDefinitions) {
      let propertyDefinition = propertyDefinitions[propertyName];
      let storedProperty = this[propertyName];
      if (this.constructor.isComponent(storedProperty)) {
        storedProperty.off();
      }
      if (propertyDefinition.list) {
        for (let j = 0; j < storedProperty.length; j++) {
          if (this.constructor.isComponent(storedProperty[j])) {
            storedProperty[j].off();
          }
        }
      }
    }
  }

  register() {
    if (this.name !== null && !this.registered) {
      this.registered = this.player.registry.add(this);
    }
  }

  unregister() {
    if (this.registered) {
      this.player.registry.remove(this.name);
      this.registered = false;
    }
  }

  cleanup() {
    this.unregister();
    let propertyDefinitions = this.properties();
    for (let propertyName in propertyDefinitions) {
      this.cleanupProperty(propertyName);
    }
  }

  cleanupProperty(propertyName) {
    let storedProperty = this[propertyName];
    if (this.constructor.isComponent(storedProperty)) {
      storedProperty.cleanup();
    } else if (Array.isArray(storedProperty)) {
      for (let i = 0; i < storedProperty.length; i++) {
        if (this.constructor.isComponent(storedProperty[i])) {
          storedProperty[i].cleanup();
        }
      }
    }
  }

  properties() {
    return this.constructor.properties;
  }
}

Component.newProperties = {
  name: {
    setter: "_setName"
  }
};
// All subclasses should contain a line like the one below if they have any new properties: <Subclass>.setupProperties();
// This line allows property lookup to happen at loading time just once rather than every time when instantiating a new component.
// This is especially useful when modifying properties at the audio rate.
Component.setupProperties();

Component.globalContext = null; // this is populated when the Component class is loaded by the global context

export default Component;