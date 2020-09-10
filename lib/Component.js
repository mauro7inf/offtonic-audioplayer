// Private class needed to provide a base case to the recursive _getProperties()
class BaseComponent {
  constructor() {}

  static _getProperties() {
    return [];
  }
}

class Component extends BaseComponent {
  constructor() {
    super();
    this.isComponent = true;
    this.player = null;
    this.parent = null;
    this.name = null;
    this.registered = false;
    this.mspa = this.constructor.globalContext.mspa;
  }

  static create(prop, player, parent) {
    if (typeof prop === 'object' && prop !== null && 'className' in prop) {
      let createWithPlayer = player;
      if (player === undefined) {
        createWithPlayer = this.globalContext.player;
      }
      let createWithParent = parent;
      if (parent === undefined) {
        createWithParent = null;
      }
      let classInstance = this.globalContext.classRegistry.get(prop.className);
      let created = (new classInstance()).setPlayer(createWithPlayer).setParent(createWithParent).withProperties(prop);
      created._finalSetup();
      return created;
    } else {
      return prop;
    }
  }

  static _getProperties() { // this static method will be inherited by subclasses and build a list of properties recursively
    let properties = Object.getPrototypeOf(this)._getProperties().concat(); // shallow copy
    if (this.hasOwnProperty('newProperties'))
    {
      for (let i = 0; i < this.newProperties.length; i++) {
        let replaced = false;
        for (let j = 0; j < properties.length; j++) {
          if (properties[j].name === this.newProperties[i].name) {
            properties[j] = this.newProperties[i];
            replaced = true;
          }
        }
        if (!replaced) {
          properties.push(this.newProperties[i]);
        }
      }
    }
    return properties;
  }

  static setupProperties() {
    this.properties = this._getProperties(); // TODO: make this an object instead of an array -- big refactor
    this.getters = {};
    for (let i = 0; i < this.properties.length; i++) {
      if ('getter' in this.properties[i]) {
        this.getters[this.properties[i].name] = this.properties[i].getter;
      }
    }
  }

  static isComponent(component) {
    return component !== null && typeof component === 'object' && component.isComponent === true;
  }

  _finalSetup() {
    // do nothing
  }

  getValue(prop) {
    let resolvedProp = prop;
    if (prop !== null && typeof prop === 'object' && 'ref' in prop) { // if it has a ref, it's a reference; ignore everything else
      resolvedProp = this.resolveReference(prop);
    }

    if (resolvedProp === null || typeof resolvedProp !== 'object' || !('generate' in resolvedProp) || typeof resolvedProp.generate !== 'function') {
      return resolvedProp;
    } else if ('generate' in resolvedProp) {
      return resolvedProp.generate();
    }
  }

  getComponentValue(prop) {
    if (prop !== null && typeof prop === 'object' && 'ref' in prop) {
      return this.resolveReference(prop);
    } else {
      return prop;
    }
  }

  resolveReference(prop) {
    return this.player.registry.get(prop.ref);
  }

  withProperties(props) { // used at instantiation
    this._setProperties(props, true, undefined);
    return this;
  }

  setProperties(props, path) { // used to modify properties
    this._setProperties(props, false, path);
    return this;
  }

  getProperty(propName, index) {
    if (propName in this.constructor.getters) {
      return this[this.constructor.getters[propName]](index); // custom getter
    }
    return this._getProperty(propName, index);
  }

  _getProperty(propName, index) {
    if (index === undefined) {
      if (Array.isArray(this[propName])) {
        return this[propName].map(e => this.getValue(e));
      } else {
        return this.getValue(this[propName]);
      }
    } else {
      return this.getValue(this[propName][index]);
    }
  }

  getComponentProperty(propName, index) {
    if (index === undefined) {
      return this.getComponentValue(this[propName]);
    } else {
      return this.getComponentValue(this[propName][index]);
    }
  }

  _setProperties(props, useDefault, path) {
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
      nextProperty._setProperties(props, useDefault, undefined);
    } else {
      if ('instrument' in props) {
        if (Array.isArray(props.instrument)) {
          for (let i = 0; i < props.instrument.length; i++) {
            this._applyInstrument(props, props.instrument[i]);
          }
        } else {
          this._applyInstrument(props, props.instrument);
        }
      }
      let propsList = this.properties();
      for (let i = 0; i < propsList.length; i++) {
        if (propsList[i].setter === null) {
          continue;
        }
        let propName = propsList[i].name;
        if (propsList[i].list) {
          if (propsList[i].removerName in props) {
            this._removeFromListProperty(propsList[i], props[propsList[i].removerName]);
          }
          if (propName in props) {
            this._setListProperty(propsList[i], props[propName]);
          } else if (useDefault && 'default' in propsList[i]) {
            this._setListProperty(propsList[i], propsList[i].default);
          }
        } else {
          if (propName in props) {
            this._setValueProperty(propsList[i], props[propName]);
          } else if (useDefault && 'default' in propsList[i]) {
            this._setValueProperty(propsList[i], propsList[i].default);
          }
        }
      }
    }
  }

  _applyInstrument(props, instrumentName) {
    let instrument = this.player.orchestra.get(instrumentName); // TODO: doesn't work with list properties yet
    for (let prop in instrument) {
      if (!(prop in props) && prop !== 'name') {
        props[prop] = instrument[prop];
      }
    }
  }

  _genericSetter(propName, propValue) {
    this.cleanupProperty(propName);
    this[propName] = propValue;
  }

  _setValueProperty(definition, prop) {
    let arrayProp = prop; // we would assume that prop here is an array of component definitions or numbers or whatever,
    // but if it's not, let the subclass handle it
    if (Array.isArray(prop)) {
      arrayProp = [];
      for (let i = 0; i < prop.length; i++) {
        let propToPush = prop[i];
        if (definition.componentProperty !== false) {
          propToPush = this.constructor.create(prop[i], this.player, this);
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

  _setListProperty(definition, prop) {
    for (let i = 0; i < prop.length; i++) {
      let propToAdd = prop[i];
      if (definition.componentProperty !== false) {
        propToAdd = this.constructor.create(prop[i], this.player, this);
      }
      this[definition.adder](propToAdd);
    }
  }

  _removeFromListProperty(definiton, prop) {
    if (typeof prop === 'number') {
      this[definition.remover](prop);
    } else { // assuming array of numbers
      prop.sort((a, b) => {return b - a;});
      for (let i = 0; i < prop.length; i++) {
        if (i === 0 || prop[i] !== prop[i - 1]) { // don't remove duplicates twice
          this[definition.remover](prop[i]);
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
    let propsList = this.properties();
    for (let i = 0; i < propsList.length; i++) {
      let prop = this[propsList[i].name];
      if (this.constructor.isComponent(prop)) {
        prop.play();
      }
      if (propsList[i].list) {
        for (let j = 0; j < prop.length; j++) {
          if (this.constructor.isComponent(prop[j])) {
            prop[j].play();
          }
        }
      }
    }
  }

  off() {
    let propsList = this.properties();
    for (let i = 0; i < propsList.length; i++) {
      let prop = this[propsList[i].name];
      if (this.constructor.isComponent(prop)) {
        prop.off();
      }
      if (propsList[i].list) {
        for (let j = 0; j < prop.length; j++) {
          if (this.constructor.isComponent(prop[j])) {
            prop[j].off();
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
    let propsList = this.properties();
    for (let i = 0; i < propsList.length; i++) {
      this.cleanupProperty(propsList[i].name);
    }
  }

  cleanupProperty(propName) {
    let prop = this[propName];
    if (this.constructor.isComponent(prop)) {
      prop.cleanup();
    } else if (Array.isArray(prop)) {
      for (let i = 0; i < prop.length; i++) {
        if (this.constructor.isComponent(prop[i])) {
          prop[i].cleanup();
        }
      }
    }
  }

  properties() {
    return this.constructor.properties;
  }
}

Component.newProperties = [
  {
    name: "name",
    setter: "_setName"
  }
];
// All subclasses should contain a line like the one below if they have any new properties: <Subclass>.setupProperties();
// This line allows property lookup to happen at loading time just once rather than every time when instantiating a new component.
// This is especially useful when modifying properties at the audio rate.
Component.setupProperties();

Component.globalContext = null; // this is populated when the Component class is loaded by the global context

export default Component;