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
const artImg = document.querySelector('.art-img');
const nameEl = document.querySelector('.name');
const artistEl = document.querySelector('.artist');
const yearEl = document.querySelector('.year');
const linkEl = document.querySelector('.link');
const popup = document.querySelector('.popup');
const popupText = document.querySelector('.popup-text');

let state = 'before'; // before | running | paused | finished
let totalMs = DEFAULT_MS; // the last valid length
let remainingMs = DEFAULT_MS;
let badLength = false; // true while the boxes hold a length that is not allowed
let lastProblem = ''; // the latest problem message // time left when not running
let endTime = 0; // clock time when the countdown reaches zero
let timerId = null;

function format(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return m + ':' + s;
}

// ---- The painting (from the Met Museum's free public API) ----
const MET_API = 'https://collectionapi.metmuseum.org/public/collection';
const SEARCH_URL = MET_API + '/v1.1/search?hasImages=true&medium=Paintings&departmentId=11';

let painting = null; // the details of the painting on screen, from the same record as its image
let paintingTotal = 0; // how many matching paintings the Met has
let loadId = 0; // lets us ignore an answer that arrives after a newer request

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Met API answered ' + response.status);
  return response.json();
}

function qualifies(o) {
  return (
    o &&
    o.isPublicDomain === true &&
    typeof o.classification === 'string' && o.classification.includes('Painting') &&
    typeof o.primaryImageSmall === 'string' &&
    o.primaryImageSmall.startsWith('https://images.metmuseum.org/') &&
    typeof o.objectURL === 'string' &&
    o.objectURL.startsWith('https://www.metmuseum.org/')
  );
}

async function loadPainting() {
  const myId = ++loadId;
  painting = null;
  artImg.hidden = true;
  artImg.removeAttribute('src');

  for (let attempt = 0; attempt < 15; attempt++) {
    if (!paintingTotal) {
      paintingTotal = (await getJson(SEARCH_URL + '&limit=1')).total;
    }
    const offset = Math.floor(Math.random() * paintingTotal);
    const found = await getJson(SEARCH_URL + '&limit=1&offset=' + offset);
    const id = found.objectIDs && found.objectIDs[0];
    if (!id) continue;
    const record = await getJson(MET_API + '/v1/objects/' + id);
    if (myId !== loadId) return; // a newer request replaced this one
    if (!qualifies(record)) continue; // quietly pick another

    painting = {
      title: record.title,
      artist: record.artistDisplayName || 'Unknown',
      year: record.objectDate || 'Unknown',
      url: record.objectURL,
    };
    artImg.src = record.primaryImageSmall;
    artImg.hidden = false;
    if (state === 'finished') fillDetails();
    return;
  }
}

function fillDetails() {
  if (!painting) return;
  nameEl.textContent = painting.title;
  artistEl.textContent = painting.artist;
  yearEl.textContent = painting.year;
  linkEl.href = painting.url;
}

function clearDetails() {
  nameEl.textContent = '';
  artistEl.textContent = '';
  yearEl.textContent = '';
  linkEl.removeAttribute('href');
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function showPopup(text) {
  if (popup.open) return;
  popupText.textContent = text;
  popup.showModal();
}

popup.addEventListener('close', () => {
  // The boxes were already put back to the last valid length
  badLength = false;
  showMessage('');
});

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
    lastProblem = result;
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
    showPopup(lastProblem);
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
  if (finished) fillDetails(); else clearDetails();
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
      fillBoxes();
      showPopup(lastProblem);
      return;
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
restartBtn.addEventListener('click', () => {
  reset();
  loadPainting();
});

document.addEventListener('visibilitychange', () => {
  if (state === 'running') tick();
});

loadPainting();
