import utils from './utils.js';

// some important utility functions for dealing with modular components
class Component {
  constructor() {}

  _setOptions(options) {
    if (options !== undefined) {
      this.setOptions(options);
    }
  }

  setOptions() {}

  // initializes component to default value if necessary
  // options are main class options
  _initComponent(componentName, options, defaultOptions) {
    if (componentName in options) {
      this._setComponent(componentName, options[componentName]);
    } else if (this[componentName] === null && defaultOptions !== undefined) {
      this._setComponent(componentName, defaultOptions);
    }
  }

  // sets a component
  // options are sub-component options
  _setComponent(componentName, options) {
    let component = utils.buildComponent(options);
    if (component !== undefined) {
      this[componentName] = component;
    } else if (this[componentName] !== null) {
      this[componentName].setOptions(options);
    } else {
      console.error('Can\'t create ' + componentName + ' with no className.');
    }
  }

  // initializes property to default value if necessary
  // options are main class options
  _initProperty(propertyName, options, defaultValue) {
    if (propertyName in options) {
      this._setProperty(propertyName, options[propertyName]);
    } else if (this[propertyName] === null && defaultValue !== undefined) {
      this._setProperty(propertyName, defaultValue);
    }
  }

  // sets a property; should be overridden if setting that property has side effects
  _setProperty(propertyName, value) {
    if (value !== undefined) {
      this[propertyName] = value;
    }
  }
}

export default Component;