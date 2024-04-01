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
      name: 'beforeEvents',
      defaultValue: []
    },
    {
      name: 'afterEvents', // TODO separate afterEvents track
      defaultValue: [],
      cleaner: null
    },
    {
      name: 'events',
      defaultValue: [],
      setter: 'setEvents'
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
    this.necessaryEvents = [];
    this.lastEventTime = 0;
    this.eventCounter = 0;
    this.playing = [];
    this.created = [];
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

  getAllAfterEvents() {
    if (this.afterEvents === null) {
      return this.necessaryEvents;
    } else {
      return this.necessaryEvents.concat(this.afterEvents);
    }
  }

  setEvents(events) {
    this.events = {}; // is this right?
    events.forEach(event => this.addEvent(event, true));
  }

  addEvent(event, recordTime) {
    this.events[this.eventCounter] = event;
    if ('afterEvents' in event) {
      if (event.afterEvents === true) {
        event.afterEvents = [];
      } else if (typeof event.afterEvents === 'string') {
        event.afterEvents = [event.afterEvents];
      }
      if (Array.isArray(event.afterEvents)) {
        this.necessaryEvents.push(event);
      }
    }
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
    playable.registerCallback(() => this.removeFromPlaying(playable, false));
  }

  registerCreated(component) {
    this.created.push(component);
  }

  handleTriggeredEvent(eventIndex) {
    super.handleTriggeredEvent(eventIndex);
    if (this.events !== null && eventIndex in this.events) {
      this.executeEvent(this.events[eventIndex]);
    }
  }

  executeEvent(event) {
    if (!event.isDone && (!('afterEvents' in event) || event.afterEvents.length === 0)) {
      if ('action' in event) {
        let action = event.action;
        if (typeof action === 'function') {
          action();
        } else if (action !== null && typeof action === 'object' && action.isAction) {
          action.perform(this);
        } else if (action !== null) {
          this.createComponent(action).perform(this);
        }
      } else if ('create' in event) {
        let eventIndexToCreate = event.create;
        this.events[eventIndexToCreate].action =
          this.createComponent(this.events[eventIndexToCreate].action);
      }
      event.isDone = true;
      if ('id' in event) {
        this.getAllAfterEvents().filter(afterEvent => 'afterEvents' in afterEvent).forEach(afterEvent => {
          let index = afterEvent.afterEvents.indexOf(event.id);
          if (index !== -1) {
            afterEvent.afterEvents.splice(index, 1);
          }
        });
      }
    }
  }

  createNode() {
    super.createNode();
    Object.keys(this.events).forEach((eventIndex) => {
      this.registerTimedEvent(this.events[eventIndex].time, eventIndex, false);
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

  removeFromCreated(component) {
    if (component.isAudioComponent) {
      component.off();
    }
    component.cleanup();
    if (this.created.indexOf(component) >= 0) {
      this.created.splice(this.created.indexOf(component), 1);
    }
  }

  release(callback) {
    this.registerCallback(callback);
    if (this.playing.length > 0) {
      this.playing.forEach(playable => playable.release(() => this.removeFromPlaying(playable, true)));
    } else {
      this.stop();
    }
  }

  releasePlaying() {
    this.playing.forEach(playable => playable.release(() => this.removeFromPlaying(playable, false)));
  }

  stop() {
    this.playing.forEach(playable => playable.stop());
    this.playing = [];
    this.created.forEach(component => this.removeFromCreated(component));
    this.created = [];
    super.stop();
    this.getAllAfterEvents().forEach(event => {
      this.executeEvent(event);
      if ('action' in event && typeof event.action === 'object' && event.action.isComponent) {
        event.action.cleanup(); // in case the event doesn't execute, like, for example, when a condition for a necessaryEvent is not met
      }
    });
    this.afterEvents = null;
  }
}

export default Sequence;