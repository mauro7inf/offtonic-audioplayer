import o from '../offtonic-audioplayer.js';

window.o = o; // for console debugging
o.debug = true;

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

  const releaseTestTime = 0;
  schedule(releaseTest, releaseTestTime);

  const methodActionTestTime = releaseTestTime + 2000;
  schedule(methodActionTest, methodActionTestTime);

  const sequenceTestTime = methodActionTestTime + 500;
  schedule(sequenceTest, sequenceTestTime);

  const nullDurationTestTime = sequenceTestTime + 1500;
  schedule(nullDurationTest, nullDurationTestTime);

  const filterTestTime = nullDurationTestTime + 1000;
  schedule(filterTest, filterTestTime);

  const refTestTime = filterTestTime + 7500;
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
  o.player.off();
  gainAdjustedPlayer.off();
  Object.values(finallyActions).forEach(action => action());
  finallyActions = {};
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

function releaseTest() {
  console.log('You should hear two tones stopping at different times, but they should stop completely before the next test starts.');

  const sequence = o.createComponent({
    className: 'Sequence',
    events: [
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            frequency: 500,
            gain: 0.1,
            duration: 250,
            generator: {
              className: 'TriangleOscillator',
              pulseWidth: 0.4
            },
            envelope: {
              className: 'ADSREnvelope',
              release: 1000
            }
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            frequency: 625,
            gain: 0.1,
            duration: 1750,
            generator: {
              className: 'TriangleOscillator',
              pulseWidth: 0.45
            },
            envelope: {
              className: 'ADSREnvelope',
              release: 1000
            }
          }
        }
      }
    ]
  });

  schedule(() => {
    console.log('releaseTest start');
    sequence.play();
  }, 0);
  schedule(() => {
    sequence.releaseAll();
    console.log('releaseTest stop');
  }, 1000);
}

function methodActionTest() {
  console.log('You should see a "default:" counter, "Welcome", "to this", and a log of an array containing "test".');

  const sequence = o.createComponent({
    className: 'Sequence',
    componentCreationLeadTime: 100,
    events: [
      {
        time: 0,
        action: {
          className: 'MethodAction',
          target: console,
          method: 'count'
        }
      },
      {
        after: 100,
        action: {
          className: 'MethodAction',
          target: console,
          method: 'log',
          arguments: 'Welcome'
        }
      },
      {
        after: 100,
        action: {
          className: 'MethodAction',
          target: console,
          method: 'log',
          arguments: ['to', 'this']
        }
      },
      {
        after: 100,
        action: {
          className: 'MethodAction',
          target: console,
          method: 'log',
          arguments: [['test']]
        }
      }
    ]
  });

  schedule(() => {
    console.log('methodActionTest start');
    sequence.play();
  }, 0);
  schedule(() => {
    sequence.stop();
    console.log('methodActionTest stop');
  }, 400);
}

function sequenceTest() {
  console.log('You should hear two notes that overlap, with a final cutoff with an audio click, and see a log message.');

  const sequence = o.createComponent({
    className: 'Sequence',
    componentCreationLeadTime: 100,
    events: [
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 750,
            frequency: 800
          }
        }
      },
      {
        time: 500,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 750,
            frequency: 900
          }
        }
      },
      {
        after: 250,
        action: () => console.log('This log message is supposed to be here.')
      }
    ]
  });

  schedule(() => {
    console.log('sequenceTest start');
    sequence.play();
  }, 0);
  schedule(() => {
    sequence.stop();
    console.log('sequenceTest stop');
  }, 1000);
}

function nullDurationTest() {
  console.log('You should hear a short tone that stops with an audio click.');

  const nullDurationTone = o.createComponent({
    className: 'Tone'
  });
  schedule(() => {
    console.log('nullDurationTest start');
    nullDurationTone.play();
  }, 0);
  schedule(() => {
    nullDurationTone.stop();
    nullDurationTone.stop(); // make sure this second stop() doesn't break things
    console.log('nullDurationTest end');
  }, 500);
}

function filterTest() {
  console.log('You should hear a slowly waving sawtooth, then a wavy tone that goes up and down, ' +
    'then a downward scale (to the same note) that starts relatively smooth and gets lots of overtones.');

  const filterTone1 = o.createComponent({
    className: 'Tone',
    generator: {
      className: 'SawtoothOscillator'
    },
    frequency: 333,
    duration: 2000,
    gain: 0.1,
    filter: {
      className: 'FirstOrderFilter',
      a0: 2,
      b0: {
        className: 'SineOscillator',
        frequency: 1,
        initialPhase: 0,
        scaling: 0.5,
        offset: 1
      },
      a1: {
        className: 'SineOscillator',
        frequency: 1,
        initialPhase: 0,
        scaling: -0.5,
        offset: 1
      }
    }
  });
  schedule(() => {
    console.log('filterTest start');
    filterTone1.play();
  }, 0);

  const filterTone2 = o.createComponent({
    className: 'Tone',
    duration: 2000,
    generator: {
      className: 'SineOscillator'
    },
    frequency: {
      className: 'SineOscillator',
      frequency: 2,
      scaling: 30,
      offset: 330,
      filter: {
        className: 'CutoffFilter',
        highCutoff: 333,
        lowCutoff: 300,
        isNormalized: false
      }
    },
    gain: 0.1,
    filter: {
      className: 'CutoffFilter',
      isNormalized: true,
      highCutoff: {
        className: 'TriangleOscillator',
        frequency: 1.5,
        scaling: 0.49,
        offset: 0.5
      },
      lowCutoff: {
        className: 'TriangleOscillator',
        frequency: 1.25,
        scaling: 0.49,
        offset: -0.5
      }
    }
  });
  schedule(() => {
    filterTone2.play();
  }, 2500);

  const filterTone3 = o.createComponent({
    className: 'Tone',
    duration: 2000,
    generator: {
      className: 'SineOscillator'
    },
    frequency: {
      className: 'LinearGenerator',
      startValue: 1,
      endValue: 0,
      startTime: 0,
      endTime: 2000,
      filter: {
        className: 'StepFilter',
        steps: 13,
        highCutoff: 1,
        lowCutoff: 0,
        scaling: 333,
        offset: 333
      }
    },
    gain: 0.15,
    filter: {
      className: 'StepFilter',
      steps: {
        className: 'LinearGenerator',
        startValue: 10,
        endValue: 1,
        startTime: 0,
        endTime: 2000
      }
    }
  });
  schedule(() => {
    filterTone3.play();
  }, 5000);
  schedule(() => {
    console.log('filterTest end');
  }, 7100);
}

function refTest() {
  console.log('You should hear five notes with vibrato in a continuous crescendo.');
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
    console.log('If the player has previously stopped, there may be a warning here.');
    cresc.cleanup();
    mod.cleanup();
  }, 2000);
  schedule(() => {
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