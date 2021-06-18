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
});
o.orchestra.add({
    name: 'refInstrument',
    className: 'Tone',
    generator: {
      className: 'SineOscillator',
      pulseWidth: {
        ref: 'mod'
      }
    },
    gain: {
      ref: 'cresc'
    }
  });

let timeouts = [];
let finallyActions = {};

window.addEventListener("load", function (e) {
  load();
});

function load() {
  console.log('Loaded!');
  console.log('You will see logged here the specifics of each test and nothing else.  ' +
    'It should say "Loaded!" when you load the test page, "Start!" when you start the test, and "Done!" when the test ends, ' +
    'as well as "Stop!" if you hit the Stop button.  Any other logs, warnings, or errors should be considered test failures.');
  document.getElementById('start').addEventListener("click", function (e) {
    start();
  });
  document.getElementById('stop').addEventListener("click", function (e) {
    stop();
  });
}

function start() {
  console.log('Start!');
  o.player.on();
  gainAdjustedPlayer.on();

  const refTestTime = 0;
  schedule(refTest, refTestTime);

  const noiseTestTime = refTestTime + 2500;
  schedule(noiseTest, noiseTestTime);

  const replaceValueTestTime = noiseTestTime + 5000;
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
    o.player.off();
    gainAdjustedPlayer.off();
    console.log('Done!');
  }, doneTime);
}

function stop() {
  console.log('Stop!');
  timeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
  timeouts = [];
  o.player.stopAll();
  gainAdjustedPlayer.stopAll();
  Object.values(finallyActions).forEach(action => action());
  o.player.off();
  gainAdjustedPlayer.off();
}

function schedule(action, time) {
  timeouts.push(setTimeout(action, time));
}

function scheduleFinally(action, time, key) { // this will still happen even if we stop the tests
  finallyActions[key] = action;
  timeouts.push(setTimeout(() => {
    delete finallyActions[key];
    action();
  }, time));
}

function refTest() {
  console.log('You should hear five notes with vibrato in a continuous crescendo.');
  /*if (o.player.registry.contains('cresc')) {
    o.player.registry.get('cresc').cleanup();
  }
  if (o.player.registry.contains('mod')) {
    o.player.registry.get('mod').cleanup();
  }*/
  const cresc = o.createComponent({
    name: 'cresc',
    className: 'LinearGenerator',
    startValue: 0.005,
    endValue: 0.25,
    startTime: 0,
    endTime: 1000
  });
  const mod = o.createComponent({
    name: 'mod',
    className: 'SineOscillator',
    frequency: 10,
    scaling: 0.1,
    offset: 0.35
  });

  const testRef = {
    name: 'testRef',
    className: 'Component'
  };
  o.createComponent(testRef);
  o.player.registry.get('testRef').cleanup();
  o.createComponent(testRef);
  o.player.registry.get('testRef').cleanup();

  const refTone1 = o.createComponent({
    instrument: 'refInstrument',
    frequency: 400,
    duration: 200
  });
  const refTone2 = o.createComponent({
    instrument: 'refInstrument',
    frequency: 450,
    duration: 200
  });
  const refTone3 = o.createComponent({
    instrument: 'refInstrument',
    frequency: 500,
    duration: 200
  });
  const refTone4 = o.createComponent({
    instrument: 'refInstrument',
    frequency: 400*(4/3),
    duration: 200
  });
  const refTone5 = o.createComponent({
    instrument: 'refInstrument',
    frequency: 600,
    duration: 800
  });

  schedule(() => {
    console.log('refTest start');
    cresc.on();
    mod.on();
    refTone1.play();
  }, 0);
  schedule(() => {
    refTone2.play();
  }, 250);
  schedule(() => {
    refTone3.play();
  }, 500);
  schedule(() => {
    refTone4.play();
  }, 750);
  schedule(() => {
    refTone5.play();
  }, 1000);
  scheduleFinally(() => {
    cresc.cleanup();
    mod.cleanup();
    console.log('refTest end');
  }, 2000);
}

function noiseTest() {
  console.log('You should hear some white noise getting louder, some red noise getting higher, ' +
      'and an insect-like buzz going about randomly.');
  const noise1 = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'WhiteNoiseGenerator'
    },
    duration: 500,
    gain: {
      className: 'LinearGenerator',
      startValue: 0.01,
      endValue: 0.2,
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

  const noise3 = o.createComponent({
    className: 'Tone',
    duration: 2000,
    generator: {
      className: 'TriangleOscillator',
      pulseWidth: {
        className: 'RedNoiseGenerator',
        frequency: 1,
        scaling: 0.1,
        offset: 0.4
      }
    },
    gain: {
      className: 'RedNoiseGenerator',
      frequency: 1.5,
      scaling: 0.1,
      offset: 0.15
    },
    frequency: {
      className: 'RedNoiseGenerator',
      frequency: 0.5,
      scaling: 40,
      offset: 440
    }
  });
  schedule(() => {
    noise3.play();
  }, 2500);
  schedule(() => {
    console.log('noiseTest end');
  }, 4500);
}

function replaceValueTest() {
  console.log('You should hear one continuous tone.');
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
  console.log('You should hear a tone that slides up a fifth then up to the octave.');
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
  console.log('You should hear four slow tones, ascending, with different timbres, the first three of which start clear and get brassy.');
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
  console.log('You should hear an articulated tone that goes up an octave and ends with a long release.');
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
  console.log('You should hear a three-note chord that starts and stops with clicks rather than smoothly.');
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
  console.log('You should hear some white noise briefly.');
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