import o from '../offtonic-audioplayer.js';

window.o = o; // for console debugging
o.debug = true;

import PrototypeNote from './PrototypeNote.js';
PrototypeNote.o = o;
o.addModule('test/PrototypeProcessor.js');

let testSequence = null;
let done = false;

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
  if (testSequence !== null) { // can't have multiple instances of the test running at the same time
    testSequence.stop();
    testSequence = null;
  }
  testSequence = o.createComponent({
    className: 'Sequence',
    beforeEvents: [
      {
        action: beforeTests
      }
    ],
    events: [
      {
        after: 0,
        action: {
          className: 'PlayAction',
          playable: shelfFilterSequence()
        }
      },
      {
        after: 4750,
        action: {
          className: 'PlayAction',
          playable: quadraticFilterSequence()
        }
      },
      {
        after: 4750,
        action: {
          className: 'PlayAction',
          playable: parallelFilterSequence()
        }
      },
      {
        after: 1500,
        action: {
          className: 'PlayAction',
          playable: biquadSequence()
        }
      },
      {
        after: 5000,
        action: {
          className: 'PlayAction',
          playable: fourierSawtoothSequence()
        }
      },
      {
        after: 10500,
        action: {
          className: 'PlayAction',
          playable: fourierTestSequence()
        }
      },
      {
        after: 4500,
        action: {
          className: 'PlayAction',
          playable: exponentialSineSequence()
        }
      },
      {
        after: 9000,
        action: {
          className: 'PlayAction',
          playable: shepardOctaveSequence()
        }
      },
      {
        after: 9000,
        action: {
          className: 'PlayAction',
          playable: shepardSequence()
        }
      },
      {
        after: 16500,
        action: {
          className: 'PlayAction',
          playable: exponentialGeneratorSequence()
        }
      },
      {
        after: 6500,
        action: {
          className: 'PlayAction',
          playable: dynamicTuningTestSequence()
        }
      },
      {
        after: 6000,
        action: {
          className: 'PlayAction',
          playable: tuningTestSequence()
        }
      },
      {
        after: 4500,
        action: {
          className: 'PlayAction',
          playable: releaseTestSequence()
        }
      },
      {
        after: 2000,
        action: {
          className: 'PlayAction',
          playable: methodActionTestSequence()
        }
      },
      {
        after: 500,
        action: {
          className: 'PlayAction',
          playable: sequenceTestSequence()
        }
      },
      {
        after: 1500,
        action: {
          className: 'PlayAction',
          playable: nullDurationTestSequence()
        }
      },
      {
        after: 1000,
        action: {
          className: 'PlayAction',
          playable: filterTestSequence()
        }
      },
      {
        after: 7500,
        action: {
          className: 'PlayAction',
          playable: refTestSequence()
        }
      },
      {
        after: 2500,
        action: {
          className: 'PlayAction',
          playable: noiseTestSequence()
        }
      },
      {
        after: 5000,
        action: {
          className: 'PlayAction',
          playable: replaceValueTestSequence()
        }
      },
      {
        after: 2000,
        action: {
          className: 'PlayAction',
          playable: arithmeticTestSequence()
        }
      },
      {
        after: 1500,
        action: {
          className: 'PlayAction',
          playable: waveTestSequence()
        }
      },
      {
        after: 8500,
        action: {
          className: 'PlayAction',
          playable: toneTestSequence()
        }
      },
      {
        after: 1500,
        action: {
          className: 'PlayAction',
          playable: sineOscillatorTestSequence()
        }
      },
      {
        after: 1000,
        action: {
          className: 'PlayAction',
          playable: prototypeTestSequence()
        }
      },
      {
        after: 1000,
        action: () => done = true
      },
      {
        after: 0,
        action: {
          className: 'SequenceAction',
          method: 'release'
        }
      }
    ],
    afterEvents: [
      {
        action: afterTests
      }
    ]
  });
  testSequence.play();
}

function stop() {
  console.log('Stop!');
  if (testSequence !== null) {
    testSequence.stop();
    testSequence = null;
  }
}

function beforeTests() {
  done = false;
  console.log('Start!');
  o.player.on();
}

function afterTests() {
  o.player.off();
  if (done) {
    console.log('Done!');
  }
}

function shelfFilterSequence() {
  return {
    className: 'Sequence',
    duration: 4500,
    beforeEvents: [
      {
        action: () => console.log('You should hear noise with a rising spectrum, then noise with a falling spectrum.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('shelfFilterTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 2000,
            gain: 0.4,
            frequency: 'C3',
            generator: {
              className: 'WhiteNoiseGenerator',
              filter: {
                className: 'LowShelfFilter',
                boost: 0.1,
                frequency: {
                  className: 'ExponentialGenerator',
                  startTime: 0,
                  endTime: 1750,
                  startValue: 1,
                  endValue: 22000
                }
              }
            }
          }
        }
      },
      {
        time: 2250,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 2000,
            gain: 0.4,
            frequency: 'C3',
            generator: {
              className: 'WhiteNoiseGenerator',
              filter: {
                className: 'HighShelfFilter',
                boost: 0.1,
                frequency: {
                  className: 'ExponentialGenerator',
                  startTime: 0,
                  endTime: 1750,
                  startValue: 22000,
                  endValue: 1
                }
              }
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('shelfFilterTest stop')
      }
    ]
  };
}

function quadraticFilterSequence() {
  return {
    className: 'Sequence',
    duration: 4500,
    beforeEvents: [
      {
        action: () => console.log('You should hear noise with a rising spectrum that shakes six times, then noise with a falling spectrum that shakes six times.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('quadraticFilterTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 2000,
            gain: 0.05,
            frequency: 'C1',
            generator: {
              className: 'WhiteNoiseGenerator',
              filter: {
                className: 'TwoPoleFilter',
                radius: {
                  className: 'SineOscillator',
                  frequency: 3,
                  initialPhase: Math.PI/2,
                  offset: 0.85,
                  scaling: 0.03
                },
                frequency: {
                  className: 'ExponentialGenerator',
                  startTime: 100,
                  endTime: 1900,
                  startValue: 'C0',
                  endValue: 'C10'
                }
              }
            }
          }
        }
      },
      {
        time: 2250,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 2000,
            gain: 0.067,
            frequency: 'C1',
            generator: {
              className: 'WhiteNoiseGenerator',
              filter: {
                className: 'TwoZeroFilter',
                radius: {
                  className: 'SineOscillator',
                  frequency: 3,
                  initialPhase: Math.PI/2,
                  offset: 1,
                  scaling: 0.25
                },
                frequency: {
                  className: 'ExponentialGenerator',
                  startTime: 100,
                  endTime: 1900,
                  startValue: 'C0',
                  endValue: 'C10'
                }
              }
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('quadraticFilterTest stop')
      }
    ]
  }
}

function parallelFilterSequence() {
  return {
    className: 'Sequence',
    duration: 1250,
    beforeEvents: [
      {
        action: () => console.log('You should hear six rising tones.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('parallelFilterTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 1000,
            gain: 0.1,
            frequency: {
              className: 'ExponentialGenerator',
              startValue: 'F2',
              startTime: 100,
              endValue: 'G3',
              endTime: 900,
              filter: {
                className: 'ParallelFilter',
                filter1: {
                  className: 'StepFilter',
                  lowCutoff: 'F2',
                  highCutoff: 'G3',
                  steps: 5
                },
                filter2: {
                  className: 'StepFilter',
                  lowCutoff: 'F2',
                  highCutoff: 'G3',
                  steps: 2
                }
              }
            },
            generator: {
              className: 'SquareOscillator',
              pulseWidth: 0.4
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('parallelFilterTest stop')
      }
    ]
  }
}

function biquadSequence() {
  return {
    className: 'Sequence',
    duration: 4500,
    beforeEvents: [
      {
        action: () => console.log('You should hear a tone changing four times.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('biquadTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4500,
            gain: 0.1,
            frequency: 'C2',
            generator: {
              className: 'SawtoothOscillator'
            },
            filter: {
              className: 'BiquadFilter',
              a0: 1,
              b0: 1,
              a1: {
                className: 'LinearGenerator',
                startTime: 500,
                startValue: -1,
                endTime: 1000,
                endValue: -5/3
              },
              b1: {
                className: 'LinearGenerator',
                startTime: 1500,
                startValue: -1/2,
                endTime: 2000,
                endValue: 0
              },
              a2: {
                className: 'LinearGenerator',
                startTime: 2500,
                startValue: 3/4,
                endTime: 3000,
                endValue: 17/18
              },
              b2: {
                className: 'LinearGenerator',
                startTime: 3500,
                startValue: -1/4,
                endTime: 4000,
                endValue: 1/4
              }
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('biquadTest stop')
      }
    ]
  }
}

function fourierSawtoothSequence() {
  function fullNoteAction(n, duration) {
    return {
      className: 'PlayAction',
      playable: {
        className: 'Tone',
        duration: duration,
        gain: 0.1,
        frequency: 'E3',
        envelope: {
          className: 'ADSREnvelope',
          attackGain: 1
        },
        generator: {
          className: 'FourierSawtooth',
          highestMultiple: n
        }
      }
    };
  }

  function oddNoteAction(n, duration) {
    return {
      className: 'PlayAction',
      playable: {
        className: 'Tone',
        duration: duration,
        gain: 0.1,
        frequency: 'Ft3',
        envelope: {
          className: 'ADSREnvelope',
          attackGain: 1
        },
        generator: {
          className: 'FourierSawtooth',
          highestMultiple: n,
          includeEven: false
        }
      }
    };
  }

  function evenNoteAction(n, duration) {
    return {
      className: 'PlayAction',
      playable: {
        className: 'Tone',
        duration: duration,
        gain: 0.1,
        frequency: 'G3',
        envelope: {
          className: 'ADSREnvelope',
          attackGain: 1
        },
        generator: {
          className: 'FourierSawtooth',
          highestMultiple: n,
          includeOdd: false
        }
      }
    };
  }

  return {
    className: 'Sequence',
    duration: 10000,
    beforeEvents: [
      {
        action: () => console.log('You should hear three bunches of tones, each bunch growing in complexity.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('fourierSawtoothTest start')
      },
      {
        time: 0,
        action: fullNoteAction(1, 250)
      },
      {
        time: 250,
        action: fullNoteAction(2, 250)
      },
      {
        time: 500,
        action: fullNoteAction(3, 250)
      },
      {
        time: 750,
        action: fullNoteAction(4, 250)
      },
      {
        time: 1000,
        action: fullNoteAction(5, 250)
      },
      {
        time: 1250,
        action: fullNoteAction(6, 250)
      },
      {
        time: 1500,
        action: fullNoteAction(7, 250)
      },
      {
        time: 1750,
        action: fullNoteAction(8, 250)
      },
      {
        time: 2000,
        action: fullNoteAction(9, 250)
      },
      {
        time: 2250,
        action: fullNoteAction(20, 1000)
      },
      {
        time: 3500,
        action: oddNoteAction(1, 250)
      },
      {
        time: 3750,
        action: oddNoteAction(3, 250)
      },
      {
        time: 4000,
        action: oddNoteAction(5, 250)
      },
      {
        time: 4250,
        action: oddNoteAction(7, 250)
      },
      {
        time: 4500,
        action: oddNoteAction(9, 250)
      },
      {
        time: 4750,
        action: oddNoteAction(11, 250)
      },
      {
        time: 5000,
        action: oddNoteAction(13, 250)
      },
      {
        time: 5250,
        action: oddNoteAction(17, 250)
      },
      {
        time: 5500,
        action: oddNoteAction(19, 1000)
      },
      {
        time: 6750,
        action: evenNoteAction(2, 250)
      },
      {
        time: 7000,
        action: evenNoteAction(4, 250)
      },
      {
        time: 7250,
        action: evenNoteAction(6, 250)
      },
      {
        time: 7500,
        action: evenNoteAction(8, 250)
      },
      {
        time: 7750,
        action: evenNoteAction(10, 250)
      },
      {
        time: 8000,
        action: evenNoteAction(12, 250)
      },
      {
        time: 8250,
        action: evenNoteAction(14, 250)
      },
      {
        time: 8500,
        action: evenNoteAction(16, 250)
      },
      {
        time: 8750,
        action: evenNoteAction(18, 250)
      },
      {
        time: 9000,
        action: evenNoteAction(20, 1000)
      }
    ],
    afterEvents: [
      {
        action: () => console.log('fourierSawtoothTest stop')
      }
    ]
  }
}

function fourierTestSequence() {
  return {
    className: 'Sequence',
    duration: 4000,
    beforeEvents: [
      {
        action: () => console.log('You should hear a slowly-rising pulsatingly complex tone.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('fourierTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4000,
            gain: 0.1,
            frequency: {
              className: 'ExponentialSineOscillator',
              frequency: 0.125,
              minValue: 'Bb3',
              maxValue: 'C4'
            },
            generator: {
              className: 'FourierGenerator',
              fourierComponents: [
                {
                  a: 1,
                  n: 1
                },
                {
                  a: 1/2,
                  n: 3
                },
                {
                  a: 1/3,
                  n: {
                    className: 'ExponentialSineOscillator',
                    frequency: 2,
                    minValue: 5,
                    maxValue: 81/16
                  }
                },
                {
                  a: 1/4,
                  n: {
                    className: 'ExponentialSineOscillator',
                    frequency: 2,
                    minValue: 7,
                    maxValue: 36/5
                  }
                },
                {
                  a: 1/5,
                  n: {
                    className: 'ExponentialSineOscillator',
                    frequency: 2,
                    minValue: 9,
                    maxValue: 80/9
                  }
                },
                {
                  a: 1/6,
                  n: {
                    className: 'ExponentialSineOscillator',
                    frequency: 2,
                    minValue: 11,
                    maxValue: 45/4
                  }
                }
              ]
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('fourierTest stop')
      }
    ]
  }
}

function exponentialSineSequence() {
  return {
    className: 'Sequence',
    duration: 8500,
    beforeEvents: [
      {
        action: () => console.log('You should hear two tones going low-high-low-high-low, the first fairly evenly and the second spending more time at the top.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('exponentialSineTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4000,
            gain: 0.1,
            generator: {
              className: 'SquareOscillator',
              pulseWidth: 0.45
            },
            frequency: {
              className: 'ExponentialSineOscillator',
              frequency: 0.5,
              minValue: 'G3',
              maxValue: 'G4'
            }
          }
        }
      },
      {
        time: 4500,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4000,
            gain: 0.1,
            generator: {
              className: 'SquareOscillator',
              pulseWidth: 0.45
            },
            frequency: {
              className: 'ExponentialSineOscillator',
              frequency: 0.5,
              baseline: 'Gt4',
              minValue: 'G3',
              maxValue: 'G4'
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('exponentialSineTest stop')
      }
    ]
  }
}

function shepardOctaveSequence() {
  return {
    className: 'Sequence',
    duration: 8500,
    beforeEvents: [
      {
        action: () => console.log('You should hear two modulating Shepard-type tones.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('shepardOctaveTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4000,
            frequency: 'C4',
            gain: 0.15,
            generator: {
              className: 'ShepardOctaveGenerator',
              peakFrequency: {
                className: 'ExponentialGenerator',
                startValue: 440/Math.pow(2, 3.75),
                startTime: 250,
                endValue: 440*Math.pow(2, 4.25),
                endTime: 3750
              }
            }
          }
        }
      },
      {
        time: 4500,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 4000,
            frequency: {
              className: 'ExponentialGenerator',
              startValue: 440/Math.pow(2, 0.75),
              startTime: 250,
              endValue: 440*Math.pow(2, 1.25),
              endTime: 3750
            },
            gain: 0.15,
            generator: {
              className: 'ShepardOctaveGenerator',
              peakFrequency: {
                className: 'ExponentialGenerator',
                startValue: 440*Math.pow(2, 4.25),
                startTime: 250,
                endValue: 440/Math.pow(2, 3.75),
                endTime: 3750
              }
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('shepardOctaveTest stop')
      }
    ]
  }
}

function shepardSequence() {
  return {
    className: 'Sequence',
    duration: 16000,
    instruments: [
      {
        name: 'ShepardSequenceInstrument',
        className: 'Tone',
        duration: 750,
        envelope: {
          className: 'ADSREnvelope',
          attack: 10,
          attackGain: 3,
          release: 100
        },
        gain: 0.15
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear four Shepard tones, a rising tone, a falling tone, and a narrowing tone.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('shepardTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            frequency: 'C4',
            generator: {
              className: 'ShepardGenerator',
              ratio: 2
            }
          }
        }
      },
      {
        time: 1000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            frequency: 'F#4',
            generator: {
              className: 'ShepardGenerator',
              ratio: 2
            }
          }
        }
      },
      {
        time: 2000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            frequency: 'C6',
            generator: {
              className: 'ShepardGenerator',
              ratio: 2
            }
          }
        }
      },
      {
        time: 3000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            frequency: 'C4',
            generator: {
              className: 'ShepardGenerator',
              ratio: 6/5
            }
          }
        }
      },
      {
        time: 4000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            duration: 3750,
            frequency: {
              className: 'ExponentialGenerator',
              startValue: 440*Math.pow(2, -3/4),
              startTime: 0,
              endValue: 440*Math.pow(2, 5/4),
              endTime: 3500
            },
            generator: {
              className: 'ShepardGenerator',
              ratio: 2
            }
          }
        }
      },
      {
        time: 8000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            duration: 3750,
            frequency: {
              className: 'ExponentialGenerator',
              startValue: 440*Math.pow(2, -3/4),
              startTime: 0,
              endValue: 440*Math.pow(2, -11/4),
              endTime: 3500
            },
            generator: {
              className: 'ShepardGenerator',
              ratio: 2
            }
          }
        }
      },
      {
        time: 12000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'ShepardSequenceInstrument',
            duration: 3750,
            frequency: 'C4',
            generator: {
              className: 'ShepardGenerator',
              ratio: {
                className: 'ExponentialGenerator',
                startValue: 4,
                startTime: 0,
                endValue: Math.pow(2, 1/6),
                endTime: 3500
              }
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('shepardTest stop')
      }
    ]
  }
}

function exponentialGeneratorSequence() {
  return {
    className: 'Sequence',
    duration: 6000,
    beforeEvents: [
      {
        action: () => console.log('You should hear a smoothly-rising tone.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('exponentialGeneratorTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            className: 'Tone',
            duration: 6000,
            generator: {
              className: 'SawtoothOscillator'
            },
            frequency: {
              className: 'ExponentialGenerator',
              startTime: 0,
              endTime: 6000,
              startValue: 256,
              endValue: 512
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('exponentialGeneratorTest stop')
      }
    ]
  }
}

function dynamicTuningTestSequence() {
  return {
    className: 'Sequence',
    duration: 5500,
    tuning: {
      className: 'MeantoneTuning',
      tuningName: 'dynamicTuningTestTuning',
      octave: 1200,
      fifth: {
        className: 'GeneratorSequence',
        pieces: [
          {
            time: 0,
            generator: {
              className: 'LinearGenerator',
              startValue: 1200.0*4/7,
              endValue: 700,
              startTime: 500,
              endTime: 2000
            },
          },
          {
            after: 2000,
            generator: {
              className: 'LinearGenerator',
              startValue: 700,
              endValue: 720,
              startTime: 500,
              endTime: 2500
            }
          }
        ]
      }
    },
    instruments: [
      {
        name: 'dynamicTuningInstrument',
        className: 'Tone',
        duration: 5000,
        generator: {
          className: 'TriangleOscillator',
          pulseWidth: 0.4
        },
        envelope: {
          className: 'ADSREnvelope',
          release: 50
        },
        gain: 0.15
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear a chord with changing tuning.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('dynamicTuningTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'dynamicTuningInstrument',
            frequency: 'C4'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'dynamicTuningInstrument',
            frequency: 'E4'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'dynamicTuningInstrument',
            frequency: 'G4'
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('dynamicTuningTest stop')
      }
    ]
  };
}

function tuningTestSequence() {
  function arpNoteEvent(note) {
    return {
      after: 100,
      action: {
        className: 'PlayAction',
        playable: {
          instrument: 'arpInstrument',
          frequency: note,
          duration: 90
        }
      }
    };
  }

  function chordNoteEvents(notes) {
    let events = [];
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i];
      let event = {
        after: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'chordInstrument',
            frequency: note,
            duration: 300
          }
        }
      }
      if (i === 0) {
        event.after = 400;
      }
      events.push(event);
    }
    return events;
  }

  function longChordNoteEvents(notes) {
    let events = [];
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i];
      let event = {
        after: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'chordInstrument',
            frequency: note,
            duration: 1300
          }
        }
      }
      if (i === 0) {
        event.after = 400;
      }
      events.push(event);
    }
    return events;
  }

  return {
    className: 'Sequence',
    duration: 4000,
    instruments: [
      {
        name: 'arpInstrument',
        className: 'Tone',
        generator: {
          className: 'SawtoothOscillator',
          pulseWidth: 0.4
        },
        envelope: {
          className: 'ADSREnvelope',
          release: 20
        },
        gain: 0.1
      },
      {
        name: 'chordInstrument',
        className: 'Tone',
        generator: {
          className: 'SawtoothOscillator',
          pulseWidth: 0.37
        },
        envelope: {
          className: 'ADSREnvelope',
          release: 40
        },
        gain: 0.15
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear a bunch of random-ish notes and four chords.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('tuningTest start')
      },
      arpNoteEvent('C2'), arpNoteEvent('G3'), arpNoteEvent('Ed4'), arpNoteEvent('Bd5'),
      arpNoteEvent('F1'), arpNoteEvent('A6'), arpNoteEvent('Dt8'), arpNoteEvent('Gx#-1'),
      arpNoteEvent('B3'), arpNoteEvent('Bd3'), arpNoteEvent('Bdd3'), arpNoteEvent('Bddd3'),
      arpNoteEvent('E5'), arpNoteEvent('EE5'), arpNoteEvent('EEE5'), arpNoteEvent('Cbbbbbbbbbbbb5'),
      arpNoteEvent('G2'),
      ...chordNoteEvents(['C4', 'E4', 'G4', 'C5']),
      ...chordNoteEvents(['F3', 'C4', 'F4', 'A4', 'C5', 'D5', 'F5']),
      ...chordNoteEvents(['G2', 'D3', 'G3', 'B3', 'D4', 'F4', 'A4', 'B4', 'D5', 'G5']),
      ...longChordNoteEvents(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])
    ],
    afterEvents: [
      {
        action: () => console.log('tuningTest stop')
      }
    ]
  };
}

function releaseTestSequence() {
  return {
    className: 'Sequence',
    duration: 1000,
    beforeEvents: [
      {
        action: () => console.log('You should hear two tones stopping at different times, but they should stop completely ' +
          'before the next test starts.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('releaseTest start')
      },
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
    ],
    afterEvents: [
      {
        action: () => console.log('releaseTest stop')
      }
    ]
  };
}

function methodActionTestSequence() {
  return {
    className: 'Sequence',
    duration: 400,
    componentCreationLeadTime: 100,
    beforeEvents: [
      {
        action: () => console.log('You should see a "default:" counter, "Welcome", "to this", and a log of an array containing "test".')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('methodActionTest start')
      },
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
    ],
    afterEvents: [
      {
        action: () => console.log('methodActionTest stop')
      }
    ]
  };
}

function sequenceTestSequence() {
  return {
    className: 'Sequence',
    componentCreationLeadTime: 100,
    beforeEvents: [
      {
        action: () => console.log('You should hear two notes that overlap, with a final cutoff with an audio click, and see a log message.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('sequenceTest start')
      },
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
      },
      {
        time: 1000,
        action: {
          className: 'SequenceAction',
          method: 'stop'
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('sequenceTest stop')
      }
    ]
  };
}

function nullDurationTestSequence() {
  const nullDurationTone = o.createComponent({
    className: 'Tone'
  });
  return {
    className: 'Sequence',
    duration: 600,
    beforeEvents: [
      {
        action: () => console.log('You should hear a short tone that stops with an audio click.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('nullDurationTest start')
      },
      {
        time: 0,
        id: 'play',
        action: {
          className: 'MethodAction',
          target: nullDurationTone,
          method: 'play'
        }
      },
      {
        time: 500,
        afterEvents: 'play',
        action: {
          className: 'MethodAction',
          target: nullDurationTone,
          method: 'stop'
        }
      },
      {
        time: 500,
        afterEvents: 'play',
        action: {
          className: 'MethodAction',
          target: nullDurationTone,
          method: 'stop' // make sure this second stop() doesn't break things
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('nullDurationTest end')
      }
    ]
  };
}

function filterTestSequence() {
  return {
    className: 'Sequence',
    duration: 7100,
    beforeEvents: [
      {
        action: () => console.log('You should hear a slowly waving sawtooth, then a wavy tone that goes up and down, ' +
          'then a downward scale (to the same note) that starts relatively smooth and gets lots of overtones.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('filterTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      },
      {
        time: 2500,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      },
      {
        time: 5000,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('filterTest end')
      }
    ]
  };
}

function refTestSequence() {
  return {
    className: 'Sequence',
    duration: 2000,
    instruments: [
      {
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
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear five notes with vibrato in a continuous crescendo.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('refTest start')
      },
      {
        time: 0,
        action: {
          className: 'CreateAction',
          component: {
            name: 'testRef',
            className: 'Component'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'CleanupAction', // no need to specify afterEvents since it gets cleaned up anyway
          component: {
            ref: 'testRef'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'CreateAction',
          component: {
            name: 'testRef',
            className: 'Component'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'CleanupAction',
          component: {
            ref: 'testRef'
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'CreateAction',
          component: {
            name: 'cresc',
            className: 'LinearGenerator',
            startValue: 0.005,
            endValue: 0.25,
            startTime: 0,
            endTime: 1000
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'CreateAction',
          component: {
            name: 'mod',
            className: 'SineOscillator',
            frequency: 10,
            scaling: 0.1,
            offset: 0.35
          }
        }
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'refInstrument',
            frequency: 400,
            duration: 200
          }
        }
      },
      {
        time: 250,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'refInstrument',
            frequency: 450,
            duration: 200
          }
        }
      },
      {
        time: 500,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'refInstrument',
            frequency: 500,
            duration: 200
          }
        }
      },
      {
        time: 750,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'refInstrument',
            frequency: 400*(4/3),
            duration: 200
          }
        }
      },
      {
        time: 1000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'refInstrument',
            frequency: 600,
            duration: 800
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('refTest end')
      }
    ]
  };
}

function noiseTestSequence() {
  return {
    className: 'Sequence',
    duration: 4500,
    beforeEvents: [
      {
        action: () => console.log('You should hear some white noise getting louder, some red noise getting higher, ' +
          'and an insect-like buzz going about randomly.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('noiseTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      },
      {
        time: 1000,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      },
      {
        time: 2500,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('noiseTest end')
      }
    ]
  };
}

function replaceValueTestSequence() {
  return {
    className: 'Sequence',
    duration: 1500,
    beforeEvents: [
      {
        action: () => console.log('You should hear one continuous tone.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('replaceValueTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            name: 'replaceValueTestTone',
            className: 'Tone',
            generator: {
              className: 'TriangleOscillator',
              pulseWidth: 0.4
            },
            gain: 0.2,
            duration: 1500,
            frequency: 600
          }
        }
      },
      {
        time: 500,
        action: {
          className: 'PropertyAction',
          component: {
            ref: 'replaceValueTestTone'
          },
          properties: {
            frequency: {
              className: 'ConstantGenerator',
              value: 600
            }
          }
        }
      },
      {
        time: 1000,
        action: {
          className: 'PropertyAction',
          component: {
            ref: 'replaceValueTestTone'
          },
          properties: {
            frequency: 600
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('replaceValueTest end')
      }
    ]
  };
}

function arithmeticTestSequence() {
  return {
    className: 'Sequence',
    duration: 1100,
    beforeEvents: [
      {
        action: () => console.log('You should hear a tone that slides up a fifth then up to the octave.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('arithmeticTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
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
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('arithmeticTest end')
      }
    ]
  };
}

function waveTestSequence() {
  return {
    className: 'Sequence',
    duration: 8000,
    instruments: [
      {
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
      },
      {
        name: 'waveTestGenerator',
        pulseWidth: {
          className: 'LinearGenerator',
          startTime: 500,
          endTime: 1300,
          startValue: 0.5,
          endValue: 1
        }
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear four slow tones, ascending, with different timbres, the first three of which ' +
          'start clear and get brassy.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('waveTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'waveTestTone',
            frequency: 300,
            generator: {
              className: 'SineOscillator',
              instrument: 'waveTestGenerator'
            }
          }
        }
      },
      {
        time: 2000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'waveTestTone',
            frequency: 320,
            generator: {
              className: 'TriangleOscillator',
              instrument: 'waveTestGenerator'
            }
          }
        }
      },
      {
        time: 4000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'waveTestTone',
            frequency: 340,
            generator: {
              className: 'SquareOscillator',
              instrument: 'waveTestGenerator'
            }
          }
        }
      },
      {
        time: 6000,
        action: {
          className: 'PlayAction',
          playable: {
            instrument: 'waveTestTone',
            frequency: 360,
            generator: {
              className: 'SawtoothOscillator',
              instrument: 'waveTestGenerator'
            }
          }
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('waveTest end')
      }
    ]
  };
}

function toneTestSequence() {
  return {
    className: 'Sequence',
    duration: 1000,
    instruments: [
      {
        name: 'test1',
        className: 'Tone',
        gain: 0.2,
        envelope: {
          instrument: ['test2', 'test3']
        }
      },
      {
        name: 'test2',
        release: 250
      },
      {
        name: 'test3',
        className: 'ADSREnvelope',
        attackGain: 3,
        release: 20
      }
    ],
    beforeEvents: [
      {
        action: () => console.log('You should hear an articulated tone that goes up an octave and ends with a long release.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => console.log('toneTest start')
      },
      {
        time: 0,
        action: {
          className: 'PlayAction',
          playable: {
            name: 'toneTestTone',
            instrument: 'test1',
            frequency: 256,
            duration: 1000
          }
        }
      },
      {
        time: 500,
        action: {
          className: 'PropertyAction',
          component: {
            ref: 'toneTestTone'
          },
          properties: {
            frequency: 512
          }
        }
      },
      {
        time: 500,
        action: {
          className: 'PropertyAction',
          component: {
            ref: 'toneTestTone'
          },
          properties: {
            pulseWidth: 0.3
          },
          path: 'generator'
        }
      }
    ],
    afterEvents: [
      {
        action: () => console.log('toneTest end')
      }
    ]
  };
}

function sineOscillatorTestSequence() {
  let gainAdjustedPlayer = new o.Player();
  gainAdjustedPlayer.on();
  const sineOscillator1 = o.createComponent({
    className: 'SineOscillator',
    frequency: {
      className: 'ConstantGenerator',
      value: 450/Math.pow(2, 7/4)
    }
  }, gainAdjustedPlayer, gainAdjustedPlayer.regsistry, gainAdjustedPlayer.tuning);
  const sineOscillator2 = o.createComponent({
    className: 'SineOscillator',
    frequency: 550/Math.pow(2, 7/4)
  }, gainAdjustedPlayer, gainAdjustedPlayer.regsistry, gainAdjustedPlayer.tuning);
  const sineOscillator3 = o.createComponent({
    className: 'SineOscillator',
    frequency: 675/Math.pow(2, 7/4)
  }, gainAdjustedPlayer, gainAdjustedPlayer.regsistry, gainAdjustedPlayer.tuning);
  return {
    className: 'Sequence',
    duration: 550,
    beforeEvents: [
      {
        action: () => {
          console.log('You should hear a three-note chord that starts and stops with clicks rather than smoothly.');
          gainAdjustedPlayer.setGain(0.1);
        }
      }
    ],
    events: [
      {
        time: 0,
        id: 'play',
        action: () => {
          console.log('sineOscillatorTest start');
          gainAdjustedPlayer.play(sineOscillator1);
          gainAdjustedPlayer.play(sineOscillator2);
          gainAdjustedPlayer.play(sineOscillator3);
        }
      },
      {
        time: 500,
        afterEvents: 'play',
        action: () => {
          gainAdjustedPlayer.stop(sineOscillator1);
          gainAdjustedPlayer.stop(sineOscillator2);
          gainAdjustedPlayer.stop(sineOscillator3);
        }
      }
    ],
    afterEvents: [
      {
        action: () => {
          sineOscillator1.cleanup();
          sineOscillator2.cleanup();
          sineOscillator3.cleanup();
          gainAdjustedPlayer.off();
          console.log('sineOscillatorTest end');
        }
      }
    ]
  };
}

function prototypeTestSequence() {
  const prototypeNote = new PrototypeNote();
  return {
    className: 'Sequence',
    duration: 500,
    beforeEvents: [
      {
        action: () => console.log('You should hear some white noise briefly.')
      }
    ],
    events: [
      {
        time: 0,
        action: () => {
          console.log('prototypeTest start');
          prototypeNote.play();
        }
      }
    ],
    afterEvents: [
      {
        action: () => {
          prototypeNote.stop();
          console.log('prototypeTest end');
        }
      }
    ]
  };
}