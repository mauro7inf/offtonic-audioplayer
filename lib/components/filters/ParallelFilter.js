import Filter from './Filter.js';

class ParallelFilter extends Filter {
  static newPropertyDescriptors = [
    {
      name: 'filter1',
      isAudioComponent: true,
      inputIndex: 0,
      defaultValue: {
        className: 'Filter'
      },
      connector: 'connectFilter1',
      disconnector: 'disconnectFilter1'
    },
    {
      name: 'filter2',
      isAudioComponent: true,
      inputIndex: 0,
      defaultValue: null,
      connector: 'connectFilter2',
      disconnector: 'disconnectFilter2'
    }
  ];

  // Architecture: signal hits firstNode, which is a GainNode with gain 1.  From there, it goes to both filter1 and filter2, and both connect to the FilterProcessor node, which goes to the destination.
  constructor() {
    super();
    this.filter1 = null;
    this.filter2 = null;
    this.firstNode = null;
  }

  createNode() {
    super.createNode();
    this.firstNode = this.ctx.createGain();
    this.firstNode.gain.value = 1;
  }

  getFirstNode() {
    return this.firstNode;
  }

  connectParallelFilter(propertyName) {
    this.genericConnector(propertyName); // connect filter to node
    let value = this.getProperty(propertyName);
    if (value !== null && value.isFilter && value.getFirstNode() !== null && this.firstNode !== null) {
      this.firstNode.connect(value.getFirstNode(), 0); // connect firstNode to filter
    }
  }

  disconnectParallelFilter(propertyName) {
    let value = this.getProperty(propertyName);
    if (value !== null && value.isFilter && value.getFirstNode() !== null && this.firstNode !== null) {
      this.firstNode.disconnect(value.getFirstNode(), 0); // disconnect firstNode from filter
    }
    this.genericDisconnector(propertyName); // disconnect filter from node
  }

  connectFilter1() {
    this.connectParallelFilter('filter1');
  }

  disconnectFilter1() {
    this.disconnectParallelFilter('filter1');
  }

  connectFilter2() {
    this.connectParallelFilter('filter2');
  }

  disconnectFilter2() {
    this.disconnectParallelFilter('filter2');
  }
}

export default ParallelFilter;