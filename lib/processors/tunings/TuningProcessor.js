OfftonicAudioplayer.tunings = {};

OfftonicAudioplayer.getTuning = function (tuningName) {
  return OfftonicAudioplayer.tunings[tuningName];
}

OfftonicAudioplayer.addTuning = function (tuningName, tuning) {
  if (!(tuningName in OfftonicAudioplayer.tunings)) {
    OfftonicAudioplayer.tunings[tuningName] = tuning;
    return true;
  } else if (OfftonicAudioplayer.tunings[tuningName] === tunings) {
    return true;
  } else {
    return false;
  }
}

OfftonicAudioplayer.removeTuning = function (tuningName) {
  if (tuningName in OfftonicAudioplayer.tunings) {
    delete OfftonicAudioplayer.tunings[tuningName];
  }
}

class TuningProcessor extends OfftonicAudioplayer.AudioComponentProcessor {
  constructor(options) {
    super(options);
    this.tuningName = options.processorOptions.tuningName;
    OfftonicAudioplayer.addTuning(this.tuningName, this);
  }

  // subclasses should call super._process(outputs)
  _process(outputs) {
    let done = this.isDone();
    if (done && OfftonicAudioplayer.tunings[this.tuningName] === this)
    {
      OfftonicAudioplayer.removeTuning(this.tuningName);
    }
    return !done;
  }

  parseNote(note, frame) {
    return 0;
  }
}

OfftonicAudioplayer.registerProcessor('TuningProcessor', TuningProcessor);