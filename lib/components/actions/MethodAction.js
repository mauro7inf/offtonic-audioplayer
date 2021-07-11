import Action from './Action.js';

class MethodAction extends Action {
  static newPropertyDescriptors = [
    {
      name: 'target',
      defaultValue: null
    },
    {
      name: 'method',
      defaultValue: null
    },
    {
      name: 'arguments', // if it's an array, it gets spread
      defaultValue: null
    }
  ];

  constructor() {
    super();
    this.target = null;
    this.method = null;
    this.arguments = null;
  }

  perform(sequence) {
    let target = this.getProperty('target');
    let method = this.getProperty('method');
    let args = this.getProperty('arguments');
    if (target !== null && (target instanceof Object) &&
        method !== null && typeof target[method] === 'function') {
      if (args === null) {
        target[method]();
      } else if (Array.isArray(args)) {
        target[method](...args);
      } else {
        target[method](args);
      }
    }
  }
}

export default MethodAction;