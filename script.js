const TOTAL_MS = 25 * 60 * 1000;

const screen = document.querySelector('.screen');
const label = document.querySelector('.label');
const timeEl = document.querySelector('.time');
const mainBtn = document.querySelector('.btn.main');
const resetBtn = document.querySelector('.btn:not(.main)');

let state = 'before'; // before | running | paused
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
  screen.classList.toggle('is-running', state !== 'before');
  label.textContent = { before: 'Ready', running: 'Focus time', paused: 'Paused' }[state];
  mainBtn.textContent = { before: 'Start', running: 'Pause', paused: 'Resume' }[state];
}

function tick() {
  // Uses the real clock, so it stays correct when the tab is in the background
  if (endTime - Date.now() <= 0) {
    clearInterval(timerId);
    timerId = null;
    remainingMs = 0;
    state = 'paused';
    timeEl.textContent = '00:00';
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

resetBtn.addEventListener('click', () => {
  clearInterval(timerId);
  timerId = null;
  remainingMs = TOTAL_MS;
  state = 'before';
  render();
});

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});
