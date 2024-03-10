class ShepardGeneratorProcessor extends OfftonicAudioplayer.GeneratorProcessor {
  static newParameterDescriptors = [
    {
      name: 'frequency'
    },
    {
      name: 'ratio'
    }
  ];

  static logC0 = Math.log(440/Math.pow(2, 4.75));
  static logC10 = this.logC0 + 10*Math.log(2);

  constructor(options) {
    super(options);
    this.lastFrequency = NaN;
    this.lastRatio = NaN;
    this.logRatio = NaN;
    this.logBaseFrequency = NaN;
    this.baseFrequency = NaN;
    this.totalWaves = 0;
    this.nudgePhases = 0;
    this.phases = [];
  }

  generate() {
    let f = this.getParameter('frequency', this.frame);
    let r = this.getParameter('ratio', this.frame);
    if (f !== this.lastFrequency || r !== this.lastRatio) {
      this.updateFrequencies(f, r);
    }
    this.updatePhases();
    return this.calculateWave();
  }

  updateFrequencies(f, r) {
    let logF = Math.log(f);
    let logR = Math.log(r);
    let intervalsAboveC0 = Math.floor((logF - this.constructor.logC0)/logR);
    let logNewBaseFrequency = logF - intervalsAboveC0 * logR;
    let newBaseFrequency = Math.exp(logNewBaseFrequency);
    this.totalWaves = Math.ceil((this.constructor.logC10 - logNewBaseFrequency)/logR);

    let changeInterval = (logNewBaseFrequency - this.logBaseFrequency)/logR;
    if (changeInterval > 0.5) {
      this.nudgePhases = -1; // remove first phase
    } else if (changeInterval < -0.5) {
      this.nudgePhases = 1; // insert first phase
    } else {
      this.nudgePhases = 0;
    }

    this.lastFrequency = f;
    this.lastRatio = r;
    this.logRatio = logR;
    this.logBaseFrequency = logNewBaseFrequency;
    this.baseFrequency = newBaseFrequency;
  }

  updatePhases() {
    const twoPi = 2*Math.PI;
    if (this.nudgePhases === -1) {
      this.phases.shift();
    } else if (this.nudgePhases === 1) {
      this.phases.unshift(Math.random()*twoPi);
    }
    this.nudgePhases = 0; // reset it

    while (this.phases.length > this.totalWaves) {
      this.phases.pop();
    }
    while (this.phases.length < this.totalWaves) {
      this.phases.push(Math.random()*twoPi);
    }

    for (let waveNumber = 0, f = this.baseFrequency; waveNumber < this.totalWaves; waveNumber++, f *= this.lastRatio) {
      this.phases[waveNumber] += f * twoPi/sampleRate;
      this.phases[waveNumber] %= twoPi;
      while (this.phases[waveNumber] < 0) {
        this.phases[waveNumber] += twoPi;
      }
    }
  }

  calculateWave() {
    let value = 0;

    for (let waveNumber = 0; waveNumber < this.totalWaves; waveNumber++) {
      let logF = this.logBaseFrequency + waveNumber*this.logRatio;
      let phi = (logF - this.constructor.logC0)/(this.constructor.logC10 - this.constructor.logC0);
      value += this.calculateCoefficient(phi) * Math.sin(this.phases[waveNumber]);
    }

    return value;
  }

  // phi is a number from 0 to 1 indicating how far the frequency is from C0 to C10
  calculateCoefficient(phi) {
    // multiply by 0.25 so that it's not too loud; this could be done dynamically but it would probably be too much work
    return 0.25 * Math.sin(Math.PI * phi);
  }
}

OfftonicAudioplayer.registerProcessor('ShepardGeneratorProcessor', ShepardGeneratorProcessor);