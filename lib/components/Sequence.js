import Playable from './Playable.js';

class Sequence extends Playable {
  static newPropertyDescriptors = [
    {
      name: 'events',
      isArray: true,
      defaultValue: [],
      getter: 'getEvents',
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
    this.componentCreationLeadTime = null;
    this.events = null;
    this.eventCounter = 0;
    this.playing = [];
  }

  getEvents() {
    //
  }

  setEvents(events) {
    this.events = {}; // is this right?
    events.forEach(event => this.addEvent(event));
  }

  addEvent(event) {
    this.events[this.eventCounter] = event;
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
      });
    }
  }

  registerPlayable(playable) {
    this.playing.push(playable);
  }

  handleTriggeredEvent(eventId) {
    super.handleTriggeredEvent(eventId);
    if (eventId in this.events) {
      if ('action' in this.events[eventId]) {
        let action = this.events[eventId].action;
        if (typeof action === 'function') {
          action();
        } else if (action !== null && typeof action === 'object' && action.isAction) {
          action.perform(this);
        } else if (action !== null) {
          this.constructor.o.createComponent(action, this.player, this.registry).perform(this);
        }
      } else if ('create' in this.events[eventId]) {
        let eventIdToCreate = this.events[eventId].create;
        this.events[eventIdToCreate].action =
          this.constructor.o.createComponent(this.events[eventIdToCreate].action, this.player, this.registry);
      }
    }
  }

  createNode() {
    super.createNode();
    Object.keys(this.events).forEach((eventId) => {
      this.registerTimedEvent(this.events[eventId].time, eventId, false);
    });
  }

  release() {
    // no-op -- TODO optionally loop somehow?
  }

  releaseAll() {
    this.playing.forEach(playable => playable.release()); // TODO test releasing of things that are already in the release phase,
    // or releasing things with a duration that's about to expire
  }

  stop() {
    super.stop();
    this.playing.forEach(playable => playable.stop());
  }
}

export default Sequence;