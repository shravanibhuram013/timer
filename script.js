const TOTAL_MS = 20 * 1000; // TEMPORARY test length (normal: 25 * 60 * 1000)

const screen = document.querySelector('.screen');
const label = document.querySelector('.label');
const timeEl = document.querySelector('.time');
const mainBtn = document.querySelector('.btn.main');
const resetBtn = document.querySelector('.btn.reset');
const restartBtn = document.querySelector('.btn.restart');
const details = document.querySelector('.details');

let state = 'before'; // before | running | paused | finished
let remainingMs = TOTAL_MS; // time left when not running
let endTime = 0; // clock time when the countdown reaches zero
let timerId = null;

function format(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return m + ':' + s;
}

function render() {
  const ms = state === 'running' ? Math.max(0, endTime - Date.now()) : remainingMs;
  timeEl.textContent = format(ms);
  const finished = state === 'finished';
  screen.classList.toggle('is-running', state === 'running' || state === 'paused');
  screen.classList.toggle('is-finished', finished);
  label.textContent = { before: 'Ready', running: 'Focus time', paused: 'Paused', finished: 'Finished' }[state];
  mainBtn.textContent = { before: 'Start', running: 'Pause', paused: 'Resume' }[state] || '';
  mainBtn.hidden = finished;
  resetBtn.hidden = finished;
  restartBtn.hidden = !finished;
  details.hidden = !finished;
}

function tick() {
  // Uses the real clock, so it stays correct when the tab is in the background
  if (endTime - Date.now() <= 0) {
    clearInterval(timerId);
    timerId = null;
    remainingMs = 0;
    state = 'finished';
    render();
    return;
  }
  render();
}

function startCounting() {
  endTime = Date.now() + remainingMs;
  state = 'running';
  clearInterval(timerId);
  timerId = setInterval(tick, 250);
  render();
}

mainBtn.addEventListener('click', () => {
  if (state === 'running') {
    remainingMs = Math.max(0, endTime - Date.now());
    clearInterval(timerId);
    timerId = null;
    state = 'paused';
    render();
  } else {
    startCounting();
  }
});

function reset() {
  clearInterval(timerId);
  timerId = null;
  remainingMs = TOTAL_MS;
  state = 'before';
  render();
}

resetBtn.addEventListener('click', reset);
restartBtn.addEventListener('click', reset);

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});
