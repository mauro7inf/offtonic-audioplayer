class Player {
  constructor() {
    this.globalContext = Player.globalContext;
    this.items = []; // everything currently going on, like any notes currently being played
    this.globalPlayer = true; // set to false for non-blocking
    this.isPlaying = false;
    this.audioFrame = 0;
    this.registry = null;
    this.orchestra = null;
    this.id = null;
    this.timer = null;
  }

  create(component) {
    return this.globalContext.Component.create(component, this, null);
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
    this.items = [];
    this.isPlaying = true;
    this.registry = new this.globalContext.Registry();
    this.orchestra = new this.globalContext.Orchestra();
    this.id = Math.random();
    this.timer = this.create({
      className: 'Timer',
      name: 'Global Timer'
    });
    this.timer.play();
    this.scriptNode.onaudioprocess = this.createAudioCallback();
  }

  off() {
    if (!this.isPlaying) {
      return; // already off
    }
    if (this !== this.globalContext.player) {
      if (this.globalPlayer) {
        return; // already off
      }
    } else {
      this.globalContext.player = null;
    }
    this.scriptNode.disconnect();
    this.scriptNode.onaudioprocess = null;
    this.scriptNode = null;
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].off();
    }
    this.items = [];
    this.isPlaying = false;
    this.registry = null;
    this.id = null;
    this.timer = null;
  }

  createAudioCallback() {
    let self = this;
    return function (e) {
      let outputData = e.outputBuffer.getChannelData(0);
      for (let sample = 0; sample < e.outputBuffer.length; sample++) {
        self.audioFrame++;
        outputData[sample] = 0;
        for (let i = 0; i < self.items.length; i++) {
          if (self.items[i] && self.items[i].isPlaying) {
            // an event that does not directly result in audio being played should generate a value of 0
            outputData[sample] += self.items[i].generate();
          }
        }
        for (let i = 0; i < self.items.length; i++) {
          if (!(self.items[i].isPlaying)) {
            self.items.splice(i, 1);
            i--;
          }
        }
      }
    };
  }

  add(item) {
    this.items.push(item);
  }

  now() {
    return this.audioFrame;
  }
}

Player.globalContext = null;

export default Player;