class Orchestra {
  constructor() {
    this.instruments = {};
  }

  add(instrument) {
    if (!('name' in instrument)) {
      console.error("Can't add instrument to the orchestra if it doesn't have a name:", instrument);
      return false;
    } else if (instrument.name in this.instruments) {
      console.error("An instrument with the same name has already been added:", instrument);
      return false;
    } else {
      if ('instrument' in instrument) {
        if (Array.isArray(instrument.instrument)) {
          this._applyInstrument(instrument, instrument.instrument[i]);
        } else {
          this.applyInstrument(instrument, instrument.instrument);
        }
      }
      this.instruments[instrument.name] = instrument;
      return true;
    }
  }

  _applyInstrument(props, instrumentName) {
    let instrument = this.get(instrumentName); // TODO: doesn't work with list properties yet
    for (let prop in instrument) {
      if (!(prop in props) && prop !== 'name') {
        props[prop] = instrument[prop];
      }
    }
  }

  get(name) {
    if (!(name in this.instruments)) {
      console.error("Can't find instrument with this name:", name);
      return {};
    } else {
      return this.instruments[name];
    }
  }

  remove(name) {
    if (!(name in this.instruments)) {
      console.error("instrument with this name has not been added and therefore can't be removed:", name);
    } else {
      delete this.instruments[name];
    }
  }
}

export default Orchestra;