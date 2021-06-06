import o from '../offtonic-audioplayer.js';

window.o = o; // for console debugging

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
    gain: 1
  });
  schedule(() => {
    o.player.play(tone1);
  }, toneTestTime);
  schedule(() => {
    o.player.stop(tone1);
  }, toneTestTime + 500);

  const sineOscillatorTestTime = 1000;
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
    o.player.play(sineOscillator1);
    o.player.play(sineOscillator2);
    o.player.play(sineOscillator3);
  }, sineOscillatorTestTime);
  schedule(() => {
    console.log('sineOscillatorTest end');
    o.player.stop(sineOscillator1);
    o.player.stop(sineOscillator2);
    o.player.stop(sineOscillator3);
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
  timeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
}

function schedule(action, time) {
  timeouts.push(setTimeout(action, time));
}