import Action from './Action.js';

class FunctionAction extends Action {
  constructor() {
    super();
    this.executeFunction = null;
    this.executeArguments = null;
  }

  execute() {
    let executeFunction = this.getProperty('executeFunction');
    if (typeof executeFunction === 'function') {
      executeFunction.apply(null, this.getProperty('executeArguments'));
    }
  }
}

FunctionAction.newProperties = [
  {
    name: 'executeFunction'
  },
  {
    name: 'executeArguments',
    default: undefined
  }
];
FunctionAction.setupProperties();

export default FunctionAction;