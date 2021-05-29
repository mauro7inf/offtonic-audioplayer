import Action from './Action.js';

class CreateAction extends Action {
  constructor() {
    super();
    this.component = null;
  }

  execute() {
    let component = this.component;
    if (Array.isArray(component)) {
      for (let i = 0; i < component.length; i++) {
        this.component[i] = this.constructor.create(component[i], this.player, null); // don't make the action the parent object
      }
    } else if (component !== null) {
      this.component = this.constructor.create(component, this.player, null);
    }
  }
}

CreateAction.newProperties = {
  component: {
    componentProperty: false
  }
};
CreateAction.setupProperties();

export default CreateAction;