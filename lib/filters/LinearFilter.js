import Filter from './Filter.js';

class LinearFilter extends Filter {
  constructor() {
    super();
    this.feedbackCoeffs = null;
    this.feedforwardCoeffs = null;
    this.recentSamples = [];
    this.recentValues = [];
  }

  _filter(value) {
    let feedback = this.getProperty('feedbackCoeffs');
    let feedforward = this.getProperty('feedforwardCoeffs');

    while (this.recentSamples.length < feedforward.length - 1) {
      this.recentSamples.push(0);
    }
    while (this.recentSamples.length > feedforward.length - 1) {
      this.recentSamples.pop();
    }
    while (this.recentValues.length < feedback.length - 1) {
      this.recentValues.push(0);
    }
    while (this.recentValues.length > feedback.length - 1) {
      this.recentValues.pop();
    }

    let filteredValue = value*feedforward[0];

    for (let i = 1; i < feedforward.length; i++) {
      filteredValue += feedforward[i]*this.recentSamples[i - 1];
    }

    filteredValue /= feedback[0];

    for (let i = 1; i < feedback.length; i++) {
      filteredValue -= feedback[i]*this.recentValues[i - 1];
    }

    if (this.recentSamples.length > 0) {
      this.recentSamples.unshift(value);
      this.recentSamples.pop();
    }
    if (this.recentValues.length > 0) {
      this.recentValues.unshift(filteredValue);
      this.recentValues.pop();
    }

    return filteredValue;
  }
}

LinearFilter.newProperties = [
  {
    name: 'feedbackCoeffs',
    default: [1]
  },
  {
    name: 'feedforwardCoeffs',
    default: [1]
  }
];
LinearFilter.setupProperties();

export default LinearFilter;