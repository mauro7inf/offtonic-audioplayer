import o from '../offtonic-audioplayer.js';

window.o = o; // for console debugging

let gainAdjustedPlayer = new o.Player();
gainAdjustedPlayer.setGain(0.1);

import PrototypeNote from './PrototypeNote.js';
PrototypeNote.o = o;
o.addModule('test/PrototypeProcessor.js');

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

  const toneTestTime = 0;
  const tone1 = o.createComponent({
    className: 'Tone',
    gain: 0.2,
    frequency: 256,
    envelope: {
      className: 'ADSREnvelope',
      attackGain: 3,
      release: 250
    }
  });
  schedule(() => {
    console.log('toneTest start');
    tone1.play();
  }, toneTestTime);
  schedule(() => {
    tone1.setProperties({
      frequency: 512
    });
  }, toneTestTime + 500);
  schedule(() => {
    console.log('toneTest end');
    tone1.release();
  }, toneTestTime + 1000);

  const sineOscillatorTestTime = 1500;
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
  }, sineOscillatorTestTime);
  schedule(() => {
    console.log('sineOscillatorTest end');
    gainAdjustedPlayer.stop(sineOscillator1);
    gainAdjustedPlayer.stop(sineOscillator2);
    gainAdjustedPlayer.stop(sineOscillator3);
  }, sineOscillatorTestTime + 500);

  const prototypeTestTime = sineOscillatorTestTime + 1000;
  const prototypeNote = new PrototypeNote();
  schedule(() => {
    console.log('prototypeTest start');
    prototypeNote.play();
  }, prototypeTestTime)
  schedule(() => {
    console.log('prototypeTest end');
    prototypeNote.stop();
  }, prototypeTestTime + 500);
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