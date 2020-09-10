import o from './offtonic-audioplayer.js';
let player;

window.addEventListener("load", function (e) {
  load();
});

function load() {
  console.log('Loaded!');
  document.getElementById('start').addEventListener("click", function (e) {
    start();
  });
  player = new o.Player();
}

function start() {
  console.log('Start!');
  player.on();
  let sequence = player.create({
    className: "Sequence",
    removeExecutedActions: true,
    actions: [
      {
        className: "PlayableAction",
        time: 0,
        playable: {
          className: "Tone",
          generator: {
            className: "ShepardOctaveGenerator",
            ratio: Math.pow(2, 0.5),
            octaveParameter: {
              className: "LinearEnvelope",
              startValue: 7,
              endValue: 3,
              duration: 1500
            }
          },
          envelope: {
            /*className: "SineOscillator",
            frequency: 2/3,
            phase: 3*Math.PI/2,
            coeff: 0.5,
            offset: 0.5*/
            className: "ADSREnvelope",
            attack: 20,
            attackGain: 2,
            decay: 100,
            release: 20,
            name: 'adsr'
          },
          frequency: {
            className: "ExponentialEnvelope",
            startValue: 128,
            endValue: 256,
            duration: 1500
          },
          //frequency: 432,
          duration: 1500,
          filter: {
            className: 'LinearFilter',
            feedforwardCoeffs: [0.8, 0.6, 0.4],
            feedbackCoeffs: [1, 0.5, -0.5]
          }
        }
      },
      {
        className: "PlayableAction",
        time: 1300,
        playable: {
          className: "Tone",
          generator: {
            className: "SineOscillator"
          },
          envelope: {
            className: "ADSREnvelope",
            attack: 20,
            attackGain: 2,
            decay: 20,
            release: 20
          },
          frequency: 1024,
          duration: 200,
          gain: 0.5
        }
      },
      {
        className: "FunctionAction",
        time: 2000,
        executeFunction: ((a, b) => {
          player.off();
          console.log('Stop!');
          console.log(a);
          console.log(b);
        }),
        executeArguments: ['hello', 'goodbye']
      }
    ]
  });
  sequence.play();
  // let playable = player.create({
  //   className: "Tone",
  //   generator: {
  //     className: "ShepardOctaveGenerator",
  //     ratio: Math.pow(2, 0.5),
  //     octaveParameter: {
  //       className: "LinearEnvelope",
  //       startValue: 7,
  //       endValue: 3,
  //       duration: 1500
  //     }
  //   },
  //   envelope: {
  //     /*className: "SineOscillator",
  //     frequency: 2/3,
  //     phase: 3*Math.PI/2,
  //     coeff: 0.5,
  //     offset: 0.5*/
  //     className: "ADSREnvelope",
  //     attack: 20,
  //     attackGain: 2,
  //     decay: 100,
  //     release: 20,
  //     name: 'adsr'
  //   },
  //   frequency: {
  //     className: "ExponentialEnvelope",
  //     startValue: 128,
  //     endValue: 256,
  //     duration: 1500
  //   },
  //   //frequency: 432,
  //   duration: 1500,
  //   filter: {
  //     className: 'LinearFilter',
  //     feedforwardCoeffs: [0.8, 0.6, 0.4],
  //     feedbackCoeffs: [1, 0.5, -0.5]
  //   }
  // });
  // let playable2 = player.create({
  //   className: "Tone",
  //   generator: {
  //     className: "PitchSpaceSineOscillator",
  //     bottomFrequency: 100,
  //     topFrequency: 101,
  //     isNormalized: true,
  //     /*phaseMod: {
  //       ref: 'RNGsus'
  //     },
  //     isFrequencyMod: true*/
  //   },
  //   envelope: {
  //     className: "ADSREnvelope",
  //     attack: 20,
  //     attackGain: 6,
  //     decay: 100,
  //     release: 20
  //   },
  //   frequency: {
  //     className: "PitchSpaceSineOscillator",
  //     frequency: 2/3,
  //     phase: Math.PI/2,
  //     bottomFrequency: 250,
  //     topFrequency: 750
  //   },
  //   duration: 1500
  // });
  // playable.setProperties({
  //   name: "named component"
  // });
  //playable.play();
  //playable2.play();
  // setTimeout(() => {
  //   player.off();
  //   console.log('Stop!');
  // }, 2000);






  /*let makeTone = function (freq, amplitude) {
    let tone = new o.Tone({
      frequency: freq*0.75,
      timerName: 'sequenceTimer',
      timerDuration: 0.9,
      //duration: 900,
      amplitude: amplitude,
      generator: {
        className: 'SawtoothGenerator',
        phasor: {
          className: 'GeneratorModPhasor',
          generator: {
            className: 'RedNoiseGenerator',
            timeConstant: 100
          },
          amplitude: 0.007
        }
      }
    });
    //console.log(tone);
    tone.play();
  }
  let sequence = new o.Sequence({
    tempo: 40,
    timer: {
      className: 'Metronome',
      name: 'sequenceTimer'
    },
    actions: [
      {
        time: 0,
        action: function () {
          makeTone(440, 0.07);
          makeTone(550, 0.03);
          makeTone(660, 0.05);
        }
      },
      {
        time: 1,
        action: function () {
          makeTone(440, 0.07);
          makeTone(440*Math.pow(2, 1/3), 0.03);
          makeTone(440*Math.pow(2, 7/12), 0.05);
        }
      },
      {
        time: 2,
        action: function () {
          makeTone(440, 0.07);
          makeTone(556.875, 0.03);
          makeTone(660, 0.05);
        }
      },
      {
        time: 3,
        action: function () {
          player.getTimer('sequenceTimer').stop();
        }
      }
    ]
  });
  sequence.play();
  /*let sweep = new o.Playable();
  let tone = new o.Tone({frequency: 110, duration: 4000, amplitude: 0.1});
  tone.setGenerator(new o.InharmonicShepardGenerator(9/4));
  tone.setEnvelope(new o.ADSREnvelope(10, 10, 100, 2));
  sweep.sweeper = new o.LinearEnvelope(0, 4, 4000);
  //sweep.sweeper2 = new o.LinearEnvelope(10, 0, 4000);
  sweep.update = function () {
    tone.setFrequency(110*Math.pow(2, this.sweeper.generate()));
    //tone.generator.setOctave(this.sweeper2.generate());
  }
  sweep.generate = function () {
    this.update();
    return 0;
  }
  tone.play();
  sweep.play();*/
}