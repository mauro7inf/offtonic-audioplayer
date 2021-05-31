import o from '../offtonic-audioplayer.js';

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
  const prototypeNote = new o.PrototypeNote();
  prototypeNote.play();
}

function stop() {
  console.log('Stop!');
  o.player.stop();
}