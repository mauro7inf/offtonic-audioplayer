import AudioComponent from '../AudioComponent.js';

class FourierGenerator extends AudioComponent {
  static newPropertyDescriptors = [
    {
      name: 'frequency',
      isAudioComponent: true,
      defaultValue: 440,
      connector: 'connectFrequency',
      disconnector: 'disconnectFrequency'
    },
    {
      name: 'fourierComponents',
      defaultValue: [
        {
          a: 1,
          n: 1
        }
      ],
      setter: 'setFourierComponents',
      cleaner: 'cleanFourierComponents',
      connector: 'connectFourierComponents',
      disconnector: 'disconnectFourierComponents'
    }
  ];

  static isNativeNode = true;

  constructor() {
    super();
    this.frequency = null;
    this.fourierComponents = [];
    this.frequencyNode = null;
  }

  createNode() {
    this.node = this.ctx.createGain();
    this.node.gain.value = 1;
    this.frequencyNode = this.ctx.createGain();
    this.frequencyNode.gain.value = 1;
  }

  connectFrequency() {
    if (this.frequencyNode !== null) {
      this.connectComponentOrRefToInputIndex(this.getProperty('frequency', false), this.frequencyNode, 0);
    }
  }

  disconnectFrequency() {
    if (this.frequencyNode !== null) {
      this.disconnectComponentOrRefFromInputIndex(this.getProperty('frequency', false), this.frequencyNode, 0);
    }
  }

  setFourierComponents(value) {
    this.cleanupProperty('fourierComponents');
    this.fourierComponents = [];
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        let componentDef = value[i];
        let component = null;
        if (componentDef !== null && typeof componentDef === 'object' && 'a' in componentDef && 'n' in componentDef && !('className' in componentDef)) {
          let componentToCreate = {
            className: 'FourierComponent',
            coeff: componentDef.a,
            multiple: componentDef.n
          };
          component = this.constructor.o.createComponent(componentToCreate, this.player, this.registry, this.tuning);
        } else if (componentDef !== null && typeof componentDef === 'object' && 'className' in componentDef) {
          component = this.constructor.o.createComponent(componentDef, this.player, this.registry, this.tuning);
        }
        if (component !== null) {
          this.fourierComponents.push(component);
        }
      }
    }
    this.connectProperty('fourierComponents');
  }

  cleanFourierComponents() {
    for (let i = 0; i < this.fourierComponents.length; i++) {
      this.cleanupComponent(this.fourierComponents[i]);
    }
    this.fourierComponents = [];
  }

  connectFourierComponents() {
    for (let i = 0; i < this.fourierComponents.length; i++) {
      this.connectFourierComponent(this.fourierComponents[i]);
    }
  }

  disconnectFourierComponents() {
    for (let i = 0; i < this.fourierComponents.length; i++) {
      this.disconnectFourierComponent(this.fourierComponents[i]);
    }
  }

  connectFourierComponent(component) {
    let resolvedComponent = this.resolveReference(component);
    if (resolvedComponent !== null) {
      if (!('ref' in component)) {
        resolvedComponent.on();
      }
      if (this.node !== null) {
        resolvedComponent.connectTo(this.node, 0);
      }
      if (this.frequencyNode !== null) {
        this.frequencyNode.connect(resolvedComponent.getFirstNode())
      }
    }
  }

  disconnectFourierComponent(component) {
    let resolvedComponent = this.resolveReference(component);
    if (resolvedComponent !== null) {
      if (!('ref' in component)) {
        resolvedComponent.off();
      }
      if (this.frequencyNode !== null) {
        this.frequencyNode.disconnect(resolvedComponent.getFirstNode());
      }
      if (this.node !== null) {
        resolvedComponent.disconnectFrom(this.node, 0);
      }
    }
  }
}

export default FourierGenerator;