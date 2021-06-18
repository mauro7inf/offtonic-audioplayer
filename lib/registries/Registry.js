class Registry {
  constructor () {
    this.components = {};
  }

  add(component) {
    if (!('name' in component)) {
      console.error("Can't add component to the registry if it doesn't have a name:", component);
      return false;
    } else if (component.name in this.components) {
      console.error("A component with the same name has already been registered:", component);
      return false;
    } else {
      this.components[component.name] = component;
      return true;
    }
  }

  get(name) {
    if (!(name in this.components)) {
      console.error("Can't find component with this name:", name);
      return null;
    } else {
      return this.components[name];
    }
  }

  remove(name) {
    if (!(name in this.components)) {
      console.error("Component with this name has not been registered and therefore can't be removed:", name);
    } else {
      delete this.components[name];
    }
  }

  contains(name) {
    return name in this.components;
  }
}

export default Registry;