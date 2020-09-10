import utils from './utils.js';

// some important utility functions for dealing with modular components
class Component {
  constructor() {}

  _setOptions(options) {
    if (options !== undefined) {
      this.setOptions(options);
    }
  }

  setOptions() {
    this.changed = {}; // track changes in this round of setting options
  }

  _initFields(constructor, options) {
    for (let i = 0; 'components' in constructor && i < constructor.components.length; i++) {
      if ('defaultOptions' in constructor && constructor.components[i] in constructor.defaultOptions) {
        this._initComponent(constructor.components[i], options, constructor.defaultOptions[constructor.components[i]]);
      } else {
        this._initComponent(constructor.components[i], options);
      }
    }
    for (let i = 0; 'properties' in constructor && i < constructor.properties.length; i++) {
      if ('defaultOptions' in constructor && constructor.properties[i] in constructor.defaultOptions) {
        this._initProperty(constructor.properties[i], options, constructor.defaultOptions[constructor.properties[i]]);
      } else {
        this._initProperty(constructor.properties[i], options);
      }
    }
  }

  // initializes component to default value if necessary
  // options are main class options
  _initComponent(componentName, options, defaultOptions) {
    if (componentName in options) {
      this._setComponent(componentName, options[componentName], false);
    } else if ((this[componentName] === null || this.changed[componentName] === 'default') && defaultOptions !== undefined) {
      this._setComponent(componentName, defaultOptions, true);
    }
  }

  // sets a component
  // options are sub-component options
  _setComponent(componentName, options, isDefault) {
    let component = utils.buildComponent(options);
    if (component !== undefined) {
      this[componentName] = component;
      this.changed[componentName] = isDefault ? 'default' : 'set';
    } else if (this[componentName] !== null) {
      this[componentName].setOptions(options);
      this.changed[componentName] = 'changed';
    } else {
      console.error('Can\'t create ' + componentName + ' with no className.');
    }
  }

  // initializes property to default value if necessary
  // options are main class options
  _initProperty(propertyName, options, defaultValue) {
    if (propertyName in options) {
      this._setProperty(propertyName, options[propertyName], false);
    } else if ((this[propertyName] === null || this.changed[propertyName] === 'default') && defaultValue !== undefined) {
      this._setProperty(propertyName, defaultValue, true);
    }
  }

  // sets a property; should be overridden if setting that property has side effects
  _setProperty(propertyName, value, isDefault) {
    if (value !== undefined && this[propertyName] !== value) {
      this[propertyName] = value;
      this.changed[propertyName] = isDefault ? 'default' : 'set';
    }
  }
}

export default Component;