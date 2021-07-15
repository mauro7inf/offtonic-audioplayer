import Playable from './Playable.js';

class Sequence extends Playable {
  static newPropertyDescriptors = [
    {
      name: 'instruments',
      defaultValue: [],
      setter: 'setInstruments',
      cleaner: 'cleanupInstruments'
    },
    {
      name: 'events',
      defaultValue: [],
      setter: 'setEvents'
    },
    {
      name: 'beforeEvents',
      defaultValue: []
    },
    {
      name: 'afterEvents',
      defaultValue: [],
      cleaner: null
    },
    {
      name: 'componentCreationLeadTime',
      defaultValue: null
    }
  ];

  static processorName = 'AudioComponentProcessor';

  constructor() {
    super();
    this.instruments = null;
    this.componentCreationLeadTime = null;
    this.events = null;
    this.beforeEvents = null;
    this.afterEvents = null;
    this.lastEventTime = 0;
    this.eventCounter = 0;
    this.playing = [];
  }

  setInstruments(instruments) {
    this.cleanupInstruments();
    this.instruments = [];
    if (instruments !== null) {
      instruments.forEach(instrument => this.addInstrument(instrument));
    }
  }

  addInstrument(instrument) {
    if (Array.isArray(instrument)) {
      instrument.forEach(individualInstrument => this.addInstrument(individualInstrument));
    } else {
      this.constructor.o.orchestra.add(instrument);
      this.instruments.push(instrument);
    }
  }

  cleanupInstruments() {
    if (this.instruments !== null) {
      this.instruments.forEach(instrument => {
        if ('name' in instrument) {
          this.constructor.o.orchestra.remove(instrument.name);
        }
      });
      this.instruments = null;
    }
  }

  setEvents(events) {
    this.events = {}; // is this right?
    events.forEach(event => this.addEvent(event, true));
  }

  addEvent(event, recordTime) {
    this.events[this.eventCounter] = event;
    if (!('time' in event)) {
      event.time = this.lastEventTime + event.after;
    }
    if (recordTime) {
      this.lastEventTime = event.time;
    }
    if (this.node !== null) {
      this.registerTimedEvent(event.time, this.eventCounter, false);
    }
    this.eventCounter++;
    // TODO references?
    if (this.getProperty('componentCreationLeadTime') !== null &&
        event.action !== null && typeof event.action === 'object' && !event.action.isComponent) {
      this.addEvent({
        time: event.time - this.getProperty('componentCreationLeadTime'),
        create: this.eventCounter - 1 // the event we just added
      }, false);
    }
  }

  registerPlayable(playable) {
    this.playing.push(playable);
  }

  handleTriggeredEvent(eventId) {
    super.handleTriggeredEvent(eventId);
    if (eventId in this.events) {
      this.executeEvent(this.events[eventId]);
    }
  }

  executeEvent(event) {
    if ('action' in event) {
      let action = event.action;
      if (typeof action === 'function') {
        action();
      } else if (action !== null && typeof action === 'object' && action.isAction) {
        action.perform(this);
      } else if (action !== null) {
        this.constructor.o.createComponent(action, this.player, this.registry).perform(this);
      }
    } else if ('create' in event) {
      let eventIdToCreate = event.create;
      this.events[eventIdToCreate].action =
        this.constructor.o.createComponent(this.events[eventIdToCreate].action, this.player, this.registry);
    }
  }

  createNode() {
    super.createNode();
    Object.keys(this.events).forEach((eventId) => {
      this.registerTimedEvent(this.events[eventId].time, eventId, false);
    });
  }

  play() {
    this.getProperty('beforeEvents').forEach(event => this.executeEvent(event));
    super.play();
  }

  removeFromPlaying(playable, stop) {
    if (this.playing.indexOf(playable) >= 0) {
      this.playing.splice(this.playing.indexOf(playable), 1);
    }
    if (stop && this.playing.length === 0) {
      this.stop();
    }
  }

  release(callback) {
    this.registerCallback(callback);
    if (this.playing.length > 0) {
      this.playing.forEach(playable => playable.release(playable => this.removeFromPlaying(playable, true)));
    } else {
      this.stop();
    }
  }

  releasePlaying() {
    this.playing.forEach(playable => playable.release(playable => this.removeFromPlaying(playable, false)));
  }

  stop() {
    this.playing.forEach(playable => playable.stop());
    super.stop();
    this.getProperty('afterEvents').forEach(event => this.executeEvent(event));
    this.afterEvents = null;
  }
}

export default Sequence;