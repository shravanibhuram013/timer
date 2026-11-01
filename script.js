const DEFAULT_MS = 25 * 60 * 1000;
const MIN_MS = 30 * 1000; // 00:30
const MAX_MS = 120 * 60 * 1000; // 120:00

const screen = document.querySelector('.screen');
const label = document.querySelector('.label');
const timeEl = document.querySelector('.time');
const mainBtn = document.querySelector('.btn.main');
const resetBtn = document.querySelector('.btn.reset');
const restartBtn = document.querySelector('.btn.restart');
const details = document.querySelector('.details');
const setter = document.querySelector('.setter');
const minsInput = document.querySelector('.mins');
const secsInput = document.querySelector('.secs');
const message = document.querySelector('.message');

let state = 'before'; // before | running | paused | finished
let totalMs = DEFAULT_MS; // the last valid length
let remainingMs = DEFAULT_MS;
let badLength = false; // true while the boxes hold a length that is not allowed // time left when not running
let endTime = 0; // clock time when the countdown reaches zero
let timerId = null;

function format(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return m + ':' + s;
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function fillBoxes() {
  const totalSeconds = totalMs / 1000;
  minsInput.value = String(Math.floor(totalSeconds / 60));
  secsInput.value = String(totalSeconds % 60).padStart(2, '0');
}

// Reads the two boxes. Returns a problem message, or '' if the length is fine.
function readLength() {
  const m = minsInput.value.trim();
  const s = secsInput.value.trim();
  if (!/^\d+$/.test(m) || !/^\d+$/.test(s)) {
    return 'Please type whole numbers only, like 10 and 00.';
  }
  if (Number(s) > 59) {
    return 'Seconds must be between 0 and 59.';
  }
  const ms = (Number(m) * 60 + Number(s)) * 1000;
  if (ms < MIN_MS || ms > MAX_MS) {
    return 'Please pick a time from 00:30 to 120:00.';
  }
  return { ms };
}

function onLengthTyped() {
  if (state !== 'before') return;
  const result = readLength();
  if (typeof result === 'string') {
    badLength = true;
    showMessage(result); // keep the last valid length
    return;
  }
  badLength = false;
  showMessage('');
  totalMs = result.ms;
  remainingMs = totalMs;
  render();
}

function onLengthDone(event) {
  // Only when leaving BOTH boxes: put the last valid length back if the typing was not valid
  if (state !== 'before') return;
  if (setter.contains(event.relatedTarget)) return;
  if (typeof readLength() === 'string') {
    fillBoxes();
    // the message stays visible so the person knows why the boxes changed
  }
}

[minsInput, secsInput].forEach((box) => {
  box.addEventListener('input', onLengthTyped);
});
setter.addEventListener('focusout', onLengthDone);

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
  setter.hidden = state !== 'before'; // length can only be changed before starting
  if (state !== 'before') showMessage('');
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
    if (state === 'before' && badLength) {
      // Do not start with a length different from what the boxes say
      badLength = false;
      fillBoxes();
      return; // the message stays on screen
    }
    startCounting();
  }
});

function reset() {
  clearInterval(timerId);
  timerId = null;
  totalMs = DEFAULT_MS;
  remainingMs = DEFAULT_MS;
  state = 'before';
  badLength = false;
  fillBoxes();
  showMessage('');
  render();
}

resetBtn.addEventListener('click', reset);
restartBtn.addEventListener('click', reset);

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});
