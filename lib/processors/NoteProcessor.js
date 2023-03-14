class NoteProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  constructor(options) {
    super(options);
    this.tuningName = options.processorOptions.tuningName;
    this.note = options.processorOptions.note;
  }

  generate() {
    return OfftonicAudioplayer.getTuning(this.tuningName).parseNote(this.note, this.frame);
  }
}

OfftonicAudioplayer.registerProcessor('NoteProcessor', NoteProcessor);