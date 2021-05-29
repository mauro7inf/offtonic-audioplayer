class Player {
  constructor() {
    this.globalContext = Player.globalContext;
    this.events = []; // everything currently going on, like any notes currently being played
    this.timers = {}; // named timers that get updated each frame
    this.globalPlayer = true; // set to false for non-blocking
    this.isPlaying = false;
  }

  on() {
    if (this.isPlaying) {
      return; // already on
    }
    if (this.globalPlayer) {
      if (this === this.globalContext.player) {
        return; // already on
      }
      if (this.globalContext.player !== null) {
        this.globalContext.player.off();
      }
      this.globalContext.player = this;
    }
    this.scriptNode = this.globalContext.audioCtx.createScriptProcessor(1024, 0, 1); // enable this to change?
    this.scriptNode.connect(this.globalContext.audioCtx.destination);
    this.scriptNode.onaudioprocess = this.createAudioCallback();
    this.events = [];
    this.isPlaying = true;
  }

  off() {
    if (!this.isPlaying) {
      return; // already off
    }
    if (this.globalPlayer) {
      if (this !== this.globalContext.player) {
        return; // already off
      }
      this.globalContext.player = null;
    }
    this.scriptNode.disconnect();
    this.scriptNode.onaudioprocess = null;
    this.scriptNode = null;
    this.events = [];
    this.isPlaying = false;
  }

  createAudioCallback() {
    let self = this;
    return function (e) {
      let outputData = e.outputBuffer.getChannelData(0);
      for (let sample = 0; sample < e.outputBuffer.length; sample++) {
        outputData[sample] = 0;
        for (let i = 0; i < self.events.length; i++) {
          if (self.events[i] && self.events[i].isPlaying) {
            // an event that does not directly result in audio being played should generate a value of 0
            outputData[sample] += self.events[i]._generate();
          }
        }
        for (let i = 0; i < self.events.length; i++) {
          if (!(self.events[i].isPlaying)) {
            self.events.splice(i, 1);
            i--;
          }
        }
        let timerNames = Object.keys(self.timers);
        for (let i = 0; i < timerNames.length; i++) {
          let name = timerNames[i];
          if (self.timers[name].isPlaying) {
            self.timers[name].update();
          } else {
            self.removeTimer(name);
          }
        }
      }
    };
  }

  addTimer(timer) {
    this.timers[timer.name] = timer;
  }

  removeTimer(name) {
    delete this.timers[name];
  }

  getTimer(name) {
    return this.timers[name];
  }
}

Player.globalContext = null;

export default Player;