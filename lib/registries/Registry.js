class Registry {
  constructor () {
    this.components = {};
    this.orchestra = new Registry.o.Orchestra();
  }

  add(component) {
    if (!('name' in component)) {
      return false;
    } else if (component.name in this.components) {
      return false;
    } else {
      this.components[component.name] = component;
      return true;
    }
  }

  get(name) {
    if (!(name in this.components)) {
      return null;
    } else {
      return this.components[name];
    }
  }

  remove(name) {
    if (name in this.components) {
      delete this.components[name];
    }
  }

  contains(name) {
    return name in this.components;
  }
}

export default Registry;