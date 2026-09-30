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
  const output = renderIndex(source, stats);
  if (check) assert(output === source, 'Index counts are stale; run node pipeline/index-stats.cjs');
  else if (!dry && output !== source) fs.writeFileSync(file, output);
  console.log(JSON.stringify({file: 'index.html', action: check ? 'verified' : dry ? 'previewed' : 'updated', courses: stats}));
  return stats;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && args.every(arg => ['--check', '--dry-run'].includes(arg)),
    'Usage: node pipeline/index-stats.cjs [--check|--dry-run]');
  updateIndex({check: args.includes('--check'), dry: args.includes('--dry-run')});
}
module.exports = {headword, readData, countCourses, renderIndex, updateIndex};
