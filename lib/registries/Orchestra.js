class Orchestra {
  constructor() {
    this.instruments = {};
  }

  applyInstruments(properties) {
    if (properties !== null && typeof properties === 'object' && ('className' in properties || 'instrument' in properties)) {
      let newProperties = {};
      Object.keys(properties).forEach(property => {
        if (property !== 'instrument') {
          newProperties[property] = this.applyInstruments(properties[property]); // recursive
        }
      });
      if ('instrument' in properties) { // actually apply the instrument here
        let instruments = [properties.instrument]; // create an array of the instruments listed, which might be just one
        if (Array.isArray(properties.instrument)) {
          instruments = properties.instrument;
        }
        instruments.forEach(instrumentName => { // instruments listed first have priority
          let instrument = this.get(instrumentName);
          Object.keys(instrument).forEach(property => {
            if (property !== 'name') {
              if (!(property in newProperties)) {
                newProperties[property] = this.applyInstruments(instrument[property]); // recursive here too
              }
            }
          });
        });
      }
      return newProperties;
    } else {
      return properties;
    }
  }
  
  add(instrument) {
    if (!('name' in instrument)) {
      return false;
    } else if (instrument.name in this.instruments) {
      return false;
    } else {
      this.instruments[instrument.name] = instrument;
      return true;
    }
  }

  get(name) {
    if (!(name in this.instruments)) {
      return {};
    } else {
      return this.instruments[name];
    }
  }

  remove(name) {
    if (name in this.instruments) {
      delete this.instruments[name];
    }
  }
}

export default Orchestra;