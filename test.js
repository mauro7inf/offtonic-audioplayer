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
  let makeTone = function (freq, amplitude) {
    let tone = new o.Tone({
      frequency: freq*0.75,
      duration: 9009,
      amplitude: amplitude,
      generator: {
        className: 'SawtoothGenerator',
        phasor: {
          className: 'GeneratorModPhasor',
          generator: {
            className: 'RedNoiseGenerator',
            timeConstant: 1000
          }
        }
      }
    });
    //console.log(tone);
    tone.play();
  }
  let sequence = new o.Sequence(60, [
    {
      beat: 0,
      action: function () {
        makeTone(440, 0.07);
        //makeTone(550, 0.03);
        //makeTone(660, 0.05);
      }
    },
    {
      beat: 1,
      action: function () {
        //makeTone(440, 0.07);
        //makeTone(440*Math.pow(2, 1/3), 0.03);
        //makeTone(440*Math.pow(2, 7/12), 0.05);
      }
    },
    {
      beat: 2,
      action: function () {
        //makeTone(440, 0.07);
        //makeTone(556.875, 0.03);
        //makeTone(660, 0.05);
      }
    }
  ]);
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