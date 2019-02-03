import Envelope from '../Envelope.js'

class ADSREnvelope extends Envelope {
  constructor(attack, decay, release, attackGain, duration) {
    super(duration);
    this.attack = attack;
    this.decay = decay;
    this.release = release;
    this.attackGain = attackGain;
    this.setup();
  }

  setup() {
    this.decayFrame = this.attack/Envelope.mspa;
    this.sustainFrame = (this.attack + this.decay)/Envelope.mspa;
    if (this.duration !== null) {
      this.releaseFrame = this.duration/Envelope.mspa;
      this.endFrame = (this.duration + this.release)/Envelope.mspa;
    } else {
      this.releaseFrame = Infinity;
      this.endFrame = Infinity;
    }
  }

  setDuration(duration) {
    if (duration !== this.duration) {
      this.duration = duration;
      this.setup();
    }
  }

  setAttack(attack) {
    if (attack !== this.attack) {
      this.attack = attack;
      this.setup();
    }
  }

  setDecay(decay) {
    if (decay !== this.decay) {
      this.decay = decay;
      this.setup();
    }
  }

  setRelease(release) {
    if (release !== this.release) {
      this.release = release;
      this.setup();
    }
  }

  setAttackGain(attackGain) {
    if (attackGain !== this.attackGain) {
      this.attackGain = attackGain;
      this.setup();
    }
  }

  stop() {
    this.releaseFrame = this.frame;
    this.endFrame = this.frame + (this.release/Envelope.mspa);
  }

  generate() {
    let envelope = 0.0;
    if (this.frame > this.endFrame) {
      this.isPlaying = false;
    } else if (this.frame > this.releaseFrame) {
      envelope = 1.0 - (this.frame - this.releaseFrame)/(this.endFrame - this.releaseFrame);
    } else if (this.frame > this.sustainFrame) {
      envelope = 1.0;
    } else if (this.frame > this.decayFrame) {
      envelope = ((this.frame - this.decayFrame)/(this.sustainFrame - this.decayFrame))*(1.0 - this.attackGain) + this.attackGain;
    } else {
      envelope = (this.frame/this.decayFrame)*this.attackGain;
    }
    super.update();
    return envelope;
  }
}

export default ADSREnvelope;