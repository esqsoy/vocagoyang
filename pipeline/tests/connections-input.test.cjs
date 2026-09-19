const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

const html = fs.readFileSync(path.resolve(__dirname, '../../vocagoyangfable.html'), 'utf8');
const connectionMatch = html.match(/^const CONNECTIONS = ([^\r\n]+);\r?$/m);
assert(connectionMatch, 'The app must contain the integrated CONNECTIONS constant');
const entries = JSON.parse(connectionMatch[1]).entries;
assert.equal(entries.length, 192, 'Review coverage when the connection curriculum changes');
assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length);

function between(start, end) {
  const first = html.indexOf(start);
  const last = html.indexOf(end, first + start.length);
  assert(first >= 0 && last > first, 'Missing app function boundary: ' + start);
  return html.slice(first, last);
}

const elements = new Map();
function $(selector) {
  if (!elements.has(selector)) elements.set(selector, {
    value: '', innerHTML: '', textContent: '', disabled: false,
    classList: {add() {}, remove() {}},
  });
  return elements.get(selector);
}
const state = {composing: false, session: null};
let decision = null;
const noop = () => {};
const ctx = vm.createContext({
  state, $, Date, Set, ALT: {}, CAT: {},
  LINES: {correct: ['correct'], correctStreak: ['correct'], wrong: ['wrong'], timeout: ['timeout']},
  esc: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;'),
  pick: lines => lines[0],
  applyCorrect(word) { decision = true; word.passed = true; },
  applyWrong() { decision = false; },
  isSynonymMiss: () => false,
  fx: noop, beep: noop, setCat: noop, showReveal: noop,
  startCopy: noop, armReveal: noop, updateStats: noop,
});

// Use the actual input and grading functions. Only visual/audio effects are stubbed.
vm.runInContext([
  between('function normalize(', 'function shuffle('),
  between('function variantKey(', 'const ALT='),
  between('function isAliasHit(', 'const SYNLINES='),
  between('function hasHangul(', 'function composingKey('),
  between('function mirrorTyped()', 'function slots('),
  between('function submit(', 'function applyCorrect('),
].join('\n'), ctx);

const realSubmit = ctx.submit;
let submissions = [];
ctx.submit = options => {
  const typed = $('#ainput').value;
  realSubmit(options);
  submissions.push({typed, correct: decision});
};

const letters = value => value.toLowerCase().replace(/[^a-z]/g, '');
let paths = 0;
let canonicalPaths = 0;
let alternativePaths = 0;
let automaticPaths = 0;
let manualAlternativePaths = 0;
let acceptedAnswers = 0;

function checkPath(entry, intended, omitSpaces, canonical) {
  const card = entry.card;
  const text = omitSpaces ? intended.replace(/\s/g, '') : intended;
  const label = `${entry.id}: ${JSON.stringify(text)} (${omitSpaces ? 'compact' : 'spaced'})`;
  const word = {
    term: card.en, meaning: card.ko, constructionId: entry.id,
    acceptedAnswers: card.acceptedAnswers || [], si: 1, id: 0,
    attempts: 0, corrects: 0, errors: 0, passed: false,
  };
  state.session = {
    currentId: 0, words: [word], answered: false, copyMode: false,
    round: 1, cardStart: Date.now() - 1000, hintLevel: 0,
    attempts: 0, errors: 0, firstSeen: 0, firstCorrect: 0,
    streak: 0, seenSet: new Set(),
  };
  state.composing = false;
  submissions = [];
  decision = null;
  $('#ainput').value = '';
  const expectedLetters = letters(card.en).length;

  for (const character of text) {
    $('#ainput').value += character;
    ctx.mirrorTyped();
    if (submissions.length) {
      // An already-valid shorter prefix is still premature: its following space
      // could activate the reveal screen's next-card shortcut.
      assert.equal(submissions.length, 1, label + ': multiple submissions');
      assert(ctx.isCorrect(submissions[0].typed, intended),
        label + ': submitted a prefix before the intended answer was complete: ' + submissions[0].typed);
      assert.equal(submissions[0].correct, true, label + ': the actual submit function rejected a valid answer');
    }
    if (canonical && letters($('#ainput').value).length >= expectedLetters) {
      assert.equal(submissions.length, 1, label + ': canonical alphabet threshold no longer auto-submits');
    }
  }

  if (!submissions.length) {
    assert(!canonical, label + ': canonical answer needs manual submission');
    // Existing Enter handling calls submit(). Short alternatives (or complete
    // alternatives that are prefixes of longer alternatives) may need Enter.
    const pendingLonger = word.acceptedAnswers.some(answer =>
      letters(answer).length > letters(text).length && letters(answer).startsWith(letters(text)));
    assert(letters(text).length < expectedLetters || pendingLonger,
      label + ': a complete non-prefix answer failed to auto-submit');
    ctx.submit();
    assert.equal(submissions.length, 1, label + ': Enter did not submit exactly once');
    assert.equal(submissions[0].correct, true, label + ': Enter rejected a valid alternative');
    manualAlternativePaths++;
  } else {
    automaticPaths++;
  }
  assert.equal(state.session.answered, true, label + ': grading did not finish the card');
  assert.equal(word.corrects, 1, label + ': correct answer was not counted');
  assert.equal(word.errors, 0, label + ': valid answer was recorded as an error');
  paths++;
  if (canonical) canonicalPaths++; else alternativePaths++;
}

for (const entry of entries) {
  const card = entry.card;
  assert(card && typeof card.en === 'string' && letters(card.en).length, entry.id + ': missing canonical answer');
  assert(Array.isArray(card.acceptedAnswers), entry.id + ': acceptedAnswers must be explicit');
  const canonicalLetters = letters(card.en);
  const seen = new Set();
  for (const answer of card.acceptedAnswers) {
    assert(typeof answer === 'string' && answer.trim() === answer && letters(answer).length,
      entry.id + ': malformed alternative');
    assert(!ctx.isCorrect(answer, card.en), entry.id + ': redundant canonical alternative');
    assert(!seen.has(ctx.normalize(answer).replace(/\s/g, '')), entry.id + ': duplicate alternative');
    seen.add(ctx.normalize(answer).replace(/\s/g, ''));
    const alternativeLetters = letters(answer);
    assert(!(alternativeLetters.length > canonicalLetters.length && alternativeLetters.startsWith(canonicalLetters)),
      entry.id + ': canonical answer prefixes a longer alternative; revise the card instead of changing auto-submit');
    acceptedAnswers++;
  }
  for (const omitSpaces of [false, true]) checkPath(entry, card.en, omitSpaces, true);
  for (const answer of card.acceptedAnswers) {
    for (const omitSpaces of [false, true]) checkPath(entry, answer, omitSpaces, false);
  }
}

assert.equal(canonicalPaths, entries.length * 2);
assert.equal(alternativePaths, acceptedAnswers * 2);
console.log(JSON.stringify({
  cards: entries.length, acceptedAnswers, typingPaths: paths,
  canonicalPaths, alternativePaths, automaticPaths, manualAlternativePaths,
  spacedAndCompactInput: 'passed',
  actualMirrorAndSubmit: 'passed',
  prematureSubmission: 'none',
  canonicalPrefixCollisions: 'none',
  canonicalAlphabetThreshold: 'unchanged',
  correctAnswersRejected: 0,
}));
