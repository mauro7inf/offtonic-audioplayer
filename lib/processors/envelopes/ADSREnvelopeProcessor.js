class ADSREnvelopeProcessor extends OfftonicAudioplayer.EnvelopeProcessor {
  constructor(options) {
    super(options);
    this.attack = options.processorOptions.attack;
    this.attackGain = options.processorOptions.attackGain;
    this.decay = options.processorOptions.decay;
    this.release = options.processorOptions.release;
    this.currentFrame = 0;
    this.attackUntilFrame = (sampleRate/1000)*this.attack;
    this.decayUntilFrame = this.attackUntilFrame + (sampleRate/1000)*this.decay;
    this.releaseStartFrame = null;
    this.releaseUntilFrame = null;
    this.releaseFromValue = null;
    this.value = 0;
  }

  generate() {
    if (this.phase === 'main') {
      if (this.currentFrame <= this.attackUntilFrame) {
        this.value = (this.currentFrame/this.attackUntilFrame)*this.attackGain
      } else if (this.currentFrame <= this.decayUntilFrame) {
        this.value = ((this.currentFrame - this.attackUntilFrame)/(this.decayUntilFrame - this.attackUntilFrame)) *
          (1 - this.attackGain) + this.attackGain;
      } else {
        this.value = 1;
      }
    } else if (this.phase === 'release') {
      if (this.currentFrame <= this.releaseUntilFrame) {
        this.value = (1 - ((this.currentFrame - this.releaseStartFrame)/(this.releaseUntilFrame - this.releaseStartFrame))) *
          this.releaseFromValue;
      } else {
        this.value = 0;
        this.changePhase('stop');
      }
    } else if (this.phase === 'stop') {
      this.value = 0;
    }
    this.currentFrame++;
    return this.value;
  }

  startRelease() {
    this.releaseStartFrame = this.currentFrame;
    this.releaseUntilFrame = this.currentFrame + (sampleRate/1000)*this.release;
    this.releaseFromValue = this.value;
  }
}

OfftonicAudioplayer.registerProcessor('ADSREnvelopeProcessor', ADSREnvelopeProcessor);