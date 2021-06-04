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

  const sineOscillatorTestTime = 0;
  const sineOscillator1 = o.SineOscillator.create({frequency: 440/Math.pow(2, 3/4)});
  const sineOscillator2 = o.SineOscillator.create({frequency: 550/Math.pow(2, 3/4)});
  schedule(() => {
    console.log('sineOscillatorTest start');
    o.player.play(sineOscillator1);
    o.player.play(sineOscillator2);
  }, sineOscillatorTestTime);
  schedule(() => {
    console.log('sineOscillatorTest end');
    o.player.stop(sineOscillator1);
    o.player.stop(sineOscillator2);
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