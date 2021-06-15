import o from '../offtonic-audioplayer.js';

window.o = o; // for console debugging

let gainAdjustedPlayer = new o.Player();
gainAdjustedPlayer.setGain(0.1);

import PrototypeNote from './PrototypeNote.js';
PrototypeNote.o = o;
o.addModule('test/PrototypeProcessor.js');

o.orchestra.add({
  name: 'test1',
  className: 'Tone',
  gain: 0.2,
  envelope: {
    instrument: ['test2', 'test3']
  }
});
o.orchestra.add({
  name: 'test2',
  release: 250
});
o.orchestra.add({
  name: 'test3',
  className: 'ADSREnvelope',
  attackGain: 3,
  release: 20
});

o.orchestra.add({
  name: 'waveTestTone',
  className: 'Tone',
  gain: 0.15,
  duration: 1800,
  envelope: {
    className: 'ADSREnvelope',
    attack: 15,
    attackGain: 1.5,
    decay: 85,
    release: 50
  }
});
o.orchestra.add({
  name: 'waveTestGenerator',
  pulseWidth: {
    className: 'LinearGenerator',
    startTime: 500,
    endTime: 1300,
    startValue: 0.5,
    endValue: 1
  }
})

let timeouts = [];

window.addEventListener("load", function (e) {
  load();
});

function load() {
  console.log('Loaded!');
  document.getElementById('start').addEventListener("click", function (e) {
    start();
  });
  document.getElementById('stop').addEventListener("click", function (e) {
    stop();
  });
}

function start() {
  console.log('Start!');

  const noiseTestTime = 0;
  schedule(noiseTest, noiseTestTime);

  const replaceValueTestTime = noiseTestTime + 3000;
  schedule(replaceValueTest, replaceValueTestTime);

  const arithmeticTestTime = replaceValueTestTime + 2000;
  schedule(arithmeticTest, arithmeticTestTime);

  const waveTestTime = arithmeticTestTime + 1500;
  schedule(waveTest, waveTestTime);

  const toneTestTime = waveTestTime + 8500;
  schedule(toneTest, toneTestTime);

  const sineOscillatorTestTime = toneTestTime + 1500;
  schedule(sineOscillatorTest, sineOscillatorTestTime);

  const prototypeTestTime = sineOscillatorTestTime + 1000;
  schedule(prototypeTest, prototypeTestTime);

  const doneTime = prototypeTestTime + 1000;
  schedule(() => {
    console.log('Done!');
  }, doneTime);
}

function stop() {
  console.log('Stop!');
  o.player.stopAll();
  gainAdjustedPlayer.stopAll();
  timeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
}

function schedule(action, time) {
  timeouts.push(setTimeout(action, time));
}

function noiseTest() {
  const noise1 = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'WhiteNoiseGenerator'
    },
    duration: 500,
    gain: {
      className: 'LinearGenerator',
      startValue: 0.1,
      endValue: 0.9,
      startTime: 0,
      endTime: 500
    }
  });
  schedule(() => {
    console.log('noiseTest start');
    noise1.play();
  }, 0);

  const noise2 = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'RedNoiseGenerator'
    },
    duration: 1500,
    gain: 0.15,
    envelope: 1,
    frequency: {
      className: 'LinearGenerator',
      startValue: 100,
      endValue: 10000,
      startTime: 0,
      endTime: 1500
    }
  });
  schedule(() => {
    noise2.play();
  }, 1000);
  schedule(() => {
    console.log('noiseTest end');
  }, 2500);
}

function replaceValueTest() {
  const replaceValueTone = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'TriangleOscillator',
      pulseWidth: 0.4
    },
    gain: 0.2,
    duration: 1500,
    frequency: 600
  });
  schedule(() => {
    console.log('replaceValueTest start');
    replaceValueTone.play();
  }, 0);
  schedule(() => {
    replaceValueTone.setProperties({
      frequency: {
        className: 'ConstantGenerator',
        value: 600
      }
    });
  }, 500);
  schedule(() => {
    replaceValueTone.setProperties({
      frequency: 600
    });
  }, 1000);
  schedule(() => {
    console.log('replaceValueTest end')
  }, 1500);
}

function arithmeticTest() {
  const arithmeticTone = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'SineOscillator',
      pulseWidth: 0.33
    },
    gain: 0.15,
    duration: 1000,
    envelope: {
      className: 'ADSREnvelope',
      attack: 20,
      attackGain: 2,
      decay: 50,
      release: 100
    },
    frequency: {
      className: 'Multiplier',
      term1: 100,
      term2: {
        className: 'Adder',
        term1: {
          className: 'LinearGenerator',
          startTime: 100,
          endTime: 400,
          startValue: 1,
          endValue: 2
        },
        term2: {
          className: 'Adder',
          term1: {
            className: 'LinearGenerator',
            startTime: 600,
            endTime: 900,
            startValue: 0.5,
            endValue: 1
          },
          term2: {
            className: 'LinearGenerator',
            startTime: 600,
            endTime: 900,
            startValue: 0.5,
            endValue: 1
          }
        }
      }
    }
  });
  schedule(() => {
    console.log('arithmeticTest start');
    arithmeticTone.play();
  }, 0);
  schedule(() => {
    console.log('arithmeticTest end');
  }, 1100);
}

function waveTest() {
  const wave1 = o.createComponent({
    instrument: 'waveTestTone',
    frequency: 300,
    generator: {
      className: 'SineOscillator',
      instrument: 'waveTestGenerator'
    }
  });
  const wave2 = o.createComponent({
    instrument: 'waveTestTone',
    frequency: 320,
    generator: {
      className: 'TriangleOscillator',
      instrument: 'waveTestGenerator'
    }
  });
  const wave3 = o.createComponent({
    instrument: 'waveTestTone',
    frequency: 340,
    generator: {
      className: 'SquareOscillator',
      instrument: 'waveTestGenerator'
    }
  });
  const wave4 = o.createComponent({
    instrument: 'waveTestTone',
    frequency: 360,
    generator: {
      className: 'SawtoothOscillator',
      instrument: 'waveTestGenerator'
    }
  });
  schedule(() => {
    console.log('waveTest start');
    wave1.play();
  }, 0);
  schedule(() => {
    wave2.play();
  }, 2000);
  schedule(() => {
    wave3.play();
  }, 4000);
  schedule(() => {
    wave4.play();
  }, 6000);
  schedule(() => {
    console.log('waveTest end');
  }, 8000);
}

function toneTest() {
  const tone1 = o.createComponent({
    instrument: 'test1',
    frequency: 256,
    duration: 1000
  });
  schedule(() => {
    console.log('toneTest start');
    tone1.play();
  }, 0);
  schedule(() => {
    tone1.setProperties({
      frequency: 512
    });
    tone1.getProperty('generator').setProperties({
      pulseWidth: 0.3
    })
  }, 500);
  schedule(() => {
    console.log('toneTest end');
  }, 1000);
}

function sineOscillatorTest() {
  const sineOscillator1 = o.createComponent({
    className: 'SineOscillator',
    frequency: {
      className: 'ConstantGenerator',
      value: 450/Math.pow(2, 7/4)
    }
  });
  const sineOscillator2 = o.createComponent({
    className: 'SineOscillator',
    frequency: 550/Math.pow(2, 7/4)
  });
  const sineOscillator3 = o.createComponent({
    className: 'SineOscillator',
    frequency: 675/Math.pow(2, 7/4)
  });
  schedule(() => {
    console.log('sineOscillatorTest start');
    gainAdjustedPlayer.play(sineOscillator1);
    gainAdjustedPlayer.play(sineOscillator2);
    gainAdjustedPlayer.play(sineOscillator3);
  }, 0);
  schedule(() => {
    console.log('sineOscillatorTest end');
    gainAdjustedPlayer.stop(sineOscillator1);
    gainAdjustedPlayer.stop(sineOscillator2);
    gainAdjustedPlayer.stop(sineOscillator3);
  }, 500);
}

function prototypeTest() {
  const prototypeNote = new PrototypeNote();
  schedule(() => {
    console.log('prototypeTest start');
    prototypeNote.play();
  }, 0)
  schedule(() => {
    console.log('prototypeTest end');
    prototypeNote.stop();
  }, 500);
}