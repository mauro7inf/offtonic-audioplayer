import o from './offtonic-audioplayer.js';
let player;

document.addEventListener("DOMContentLoaded", function (e) {
  load();
});

function load() {
  document.getElementById('start').addEventListener("click", function (e) {
    start();
  });
  player = new o.Player();
}

function start() {
  console.log('Start!');
  player.on();
  let makeTone = function (freq, amplitude) {
    let tone = new o.Tone(freq, 900, amplitude);
    //let coeffs = [];
    //let multiples = [];
    //let stretch = 1.005;
    //for (let i = 1; i <= 10; i++) {
      //coeffs[i - 1] = 1/i;
      //multiples[i - 1] = i*Math.pow(stretch, Math.log(i)/Math.log(2));
    //}
    tone.setGenerator(new o.InharmonicShepardGenerator(5/4));
    //tone.generator.setPhasor(new o.RandomModPhasor(0.2));
    //tone.setEnvelope(new o.LinearEnvelope(1, 0));
    //tone.addFilter(new o.DelayFilter(0.6, 0.8));
    tone.play();
  }
  let sequence = new o.Sequence([
    {
      time: 0,
      action: function () {
        makeTone(440, 0.07);
        makeTone(550, 0.03);
        makeTone(660, 0.05);
      }
    },
    {
      time: 1000,
      action: function () {
        makeTone(440, 0.07);
        makeTone(440*Math.pow(2, 1/3), 0.03);
        makeTone(440*Math.pow(2, 7/12), 0.05);
      }
    },
    {
      time: 2000,
      action: function () {
        makeTone(440, 0.07);
        makeTone(556.875, 0.03);
        makeTone(660, 0.05);
      }
    }
  ]);
  sequence.play();
  /*let sweep = new o.Playable();
  let tone = new o.Tone(110, 4000, 0.1);
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