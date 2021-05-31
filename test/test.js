import o from '../offtonic-audioplayer.js';

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
  const prototypeNote = new PrototypeNote();
  prototypeNote.play();
  timeouts.push(setTimeout(() => {
    prototypeNote.stop();
  }, 500));
}

function stop() {
  console.log('Stop!');
  o.player.stop();
  timeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
}