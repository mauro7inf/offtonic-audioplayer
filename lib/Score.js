import Component from './Component';

class Score extends Component {
  constructor() {
    super();
    this.instruments = null; // the instruments are never actually accessed, so this will stay null since the Component infrastructure
    // expects the field to exist
    this.mainSequence = null;
  }

  _setInstruments(instruments) {
    for (let i = 0; i < instruments.length; i++) {
      this.player.orchestra.add(instruments[i]);
    }
  }

  stop() {
    let mainSequence = this.getProperty('mainSequence');
    if (mainSequence !== null && mainSequence !== undefined) {
      mainSequence.stop();
    }
  }
}

Score.newProperties = [
  {
    name: 'instruments',
    setter: '_setInstruments',
    default: []
  },
  {
    name: 'mainSequence'
  }
];
Score.setupProperties();

export default Score;