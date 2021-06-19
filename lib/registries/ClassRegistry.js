class ClassRegistry {
  constructor () {
    this.o = null;
    this.classes = {};
  }

  register(className, classInstance, overwrite) {
    if (className in this.classes && !overwrite) {
      this.o.error("A class with the same name has already been registered:", classInstance);
    } else {
      this.classes[className] = classInstance;
    }
  }

  get(className) {
    if (!(className in this.classes)) {
      this.o.error("Can't find class with this name:", className);
    } else {
      return this.classes[className];
    }
  }
}

const classRegistry = new ClassRegistry();

export default classRegistry;