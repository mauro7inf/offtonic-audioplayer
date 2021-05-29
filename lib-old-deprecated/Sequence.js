import TimedComponent from './TimedComponent.js';

class Sequence extends TimedComponent {
  constructor() {
    super();
    this.actions = [];
    this.actionIndex = 0;
    this.isRepeating = null;
    this.removeExecutedActions = null;
  }

  _addAction(action) {
    for (let i = this.actions.length; i > 0; i--) {
      if (action.time >= this.actions[i - 1].time) {
        this.actions.splice(i, 0, action);
        return;
      }
    }
    this.actions.unshift(action);
  }

  _removeAction(index) {
    let removed = this.actions.splice(index, 1);
    if (this.constructor.isComponent(removed[0])) {
      removed[0].cleanup();
    }
  }

  _stop() {
    if (this.getProperty('isRepeating')) {
      this.isStopping = false;
      this._setupTimes();
    } else {
      this.off();
    }
  }

  update() {
    super.update();
    while (this.actionIndex < this.actions.length && this._timer.time - this.startTime >= this.actions[this.actionIndex].time) {
      this.actions[this.actionIndex].execute();
      if (this.getProperty('removeExecutedActions')) {
        this._removeAction(this.actionIndex);
      } else {
        this.actionIndex++;
      }
    }
  }
}

Sequence.newProperties = {
  actions: {
    adder: '_addAction',
    remover: '_removeAction',
    removerName: 'removeActions',
    list: true
  },
  isRepeating: {
    default: false
  },
  removeExecutedActions: {
    default: false
  }
};
Sequence.setupProperties();

export default Sequence;