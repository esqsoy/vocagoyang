'use strict';
// Build-time only: the selection page never downloads the game data for counts.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const COURSES = [
  {id: 'fable', file: 'vocagoyangfable.html'},
  {id: 'ksat', file: 'vocagoyangksat2027.html'},
  {id: 'ebs', file: 'vocagoyangebs2027.html'},
];
// 시험 단어장(26.11.17 배포): 수능 길의 누적에 넣지 않고 따로 센다. HTML이 있는 시험만.
const EXAMS = [
  {id: 'toeic', file: 'vocagoyangtoeic.html'},
  {id: 'toefl', file: 'vocagoyangtoefl.html'},
  {id: 'gre', file: 'vocagoyanggre.html'},
];

function headword(card) {
  const term = card.word ?? card.en;
  assert.equal(typeof term, 'string', 'Every card needs a headword');
  const key = term.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase();
  assert(key, 'Empty headword');
  return key;
}

function readData(source, file) {
  const matches = [...source.matchAll(/^const DATA\s*=\s*(\[[^\r\n]*\]);[ \t]*\r?$/gm)];
  assert.equal(matches.length, 1, file + ': expected one JSON DATA assignment');
  return JSON.parse(matches[0][1]);
}

function countCourses(courses) {
  const seen = new Set();
  return courses.map(({id, data}) => {
    // All exercises, including previous exam passages, count towards the course.
    const cards = data.flatMap(lesson => lesson.exercises.flatMap(ex => ex.words));
    assert(cards.length, id + ': empty vocabulary');
    const own = new Set(cards.map(headword));
    let overlap = 0;
    for (const term of own) {
      if (seen.has(term)) overlap++;
      seen.add(term);
    }
    return {id, cards: cards.length, headwords: own.size, overlap,
      added: own.size - overlap, cumulative: seen.size};
  });
}

/* 시험 단어장: 표제어 수와 FABLE에 없는 뜻 카드 수(fable 연결이 없는 카드 = 단추를 켜도 보이는 카드). */
function countExams(exams) {
  return exams.map(({id, data}) => {
    const cards = data.flatMap(lesson => lesson.exercises.flatMap(ex => ex.words));
    assert(cards.length, id + ': empty vocabulary');
    return {id, cards: cards.length, headwords: new Set(cards.map(headword)).size, newSense: cards.filter(w => !w.fable).length};
  });
}
function renderExams(source, stats) {
  const number = value => value.toLocaleString('en-US');
  for (const row of stats) {
    const text = `<b>${number(row.headwords)}단어</b> · FABLE에 없는 뜻 <b>${number(row.newSense)}</b>장`;
    const pattern = new RegExp(`(<!-- VOCAB_STATS:${row.id}:START -->)[\\s\\S]*?(<!-- VOCAB_STATS:${row.id}:END -->)`, 'g');
    let replaced = 0;
    source = source.replace(pattern, (_, start, end) => { replaced++; return start + text + end; });
    assert.equal(replaced, 1, row.id + ': expected one index statistics block');
  }
  return source;
}

function renderIndex(source, stats) {
  for (const [i, row] of stats.entries()) {
    const number = value => value.toLocaleString('en-US');
    const count = i === 0 ? `<b>${number(row.headwords)}단어</b>`
      : `중복 제외 <b>${number(row.added)}단어</b> · 누적 <b>${number(row.cumulative)}</b>`;
    const pattern = new RegExp(`(<!-- VOCAB_STATS:${row.id}:START -->)[\\s\\S]*?(<!-- VOCAB_STATS:${row.id}:END -->)`, 'g');
    let replaced = 0;
    source = source.replace(pattern, (_, start, end) => { replaced++; return start + count + end; });
    assert.equal(replaced, 1, row.id + ': expected one index statistics block');
  }
  return source;
}

function updateIndex({root = ROOT, check = false, dry = false} = {}) {
  const stats = countCourses(COURSES.map(course => ({...course,
    data: readData(fs.readFileSync(path.join(root, course.file), 'utf8'), course.file)})));
  const file = path.join(root, 'index.html');
  const source = fs.readFileSync(file, 'utf8');
  const exams = countExams(EXAMS.filter(e => fs.existsSync(path.join(root, e.file))).map(e => ({...e,
    data: readData(fs.readFileSync(path.join(root, e.file), 'utf8'), e.file)})));
  const output = renderExams(renderIndex(source, stats), exams);
  if (check) assert(output === source, 'Index counts are stale; run node pipeline/index-stats.cjs');
  else if (!dry && output !== source) fs.writeFileSync(file, output);
  console.log(JSON.stringify({file: 'index.html', action: check ? 'verified' : dry ? 'previewed' : 'updated', courses: stats, exams}));
  return stats;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && args.every(arg => ['--check', '--dry-run'].includes(arg)),
    'Usage: node pipeline/index-stats.cjs [--check|--dry-run]');
  updateIndex({check: args.includes('--check'), dry: args.includes('--dry-run')});
}
module.exports = {headword, readData, countCourses, renderIndex, countExams, renderExams, updateIndex};
