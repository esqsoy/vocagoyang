'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const {headword, readData, countCourses, renderIndex, updateIndex} = require('../index-stats.cjs');
const course = (id, words) => ({id, data: [{exercises: [{words}]}]});
assert.equal(headword({word:' Other ', en:'others'}), 'other');
assert.equal(headword({en:'  TAKE\tcare  of '}), 'take care of');
assert.notEqual(headword({en:'backup'}), headword({en:'back up'}));
assert.notEqual(headword({en:'act'}), headword({en:'action'}));
assert.notEqual(headword({en:'colour'}), headword({en:'color'}));
assert.throws(() => headword({en:'   '}), /Empty headword/);
assert.throws(() => headword({}), /needs a headword/);
const courses = [
  course('fable', [{word:'Other',en:'others'}, {en:'other'}, {en:'take care of'}]),
  course('ksat', [{en:'OTHER'}, {en:'act'}, {en:'act'}]),
  course('ebs', [{en:'TAKE  care of'}, {en:'act'}, {en:'action'}]),
];
courses[1].data[0].exercises.push({scope:'prev', words:[{en:'past'}]});
const stats = countCourses(courses);
assert.deepEqual(stats, [
  {id:'fable',cards:3,headwords:2,overlap:0,added:2,cumulative:2},
  {id:'ksat',cards:4,headwords:3,overlap:1,added:2,cumulative:4},
  {id:'ebs',cards:3,headwords:3,overlap:2,added:1,cumulative:5},
]);
const template = '<p>' + stats.map(s => `<!-- VOCAB_STATS:${s.id}:START -->old<!-- VOCAB_STATS:${s.id}:END -->`).join('</p>\r\n<p>') + '</p>';
const rendered = renderIndex(template, stats);
assert(rendered.includes('중복 제외 <b>2단어</b> · 누적 <b>4</b>'));
assert(rendered.includes('중복 제외 <b>1단어</b> · 누적 <b>5</b>'));
assert.equal(renderIndex(rendered, stats), rendered);
const surrounding = text => text.replace(/(<!-- VOCAB_STATS:[^>]+:START -->)[\s\S]*?(<!-- VOCAB_STATS:[^>]+:END -->)/g, '$1$2');
assert.equal(surrounding(rendered), surrounding(template));
assert.throws(() => renderIndex(template + template, stats), /expected one/);
assert.throws(() => renderIndex('', stats), /expected one/);
assert.deepEqual(readData('const DATA = [];\r\n', 'fixture'), []);
assert.throws(() => readData('const DATA = [];\nconst DATA = [];\n', 'fixture'), /expected one/);
assert.throws(() => readData('const DATA = runCode();\n', 'fixture'), /expected one/);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vocagoyang-index-stats-'));
const files = ['vocagoyangfable.html', 'vocagoyangksat2027.html', 'vocagoyangebs2027.html', 'index.html'];
try {
  courses.forEach((c, i) => fs.writeFileSync(path.join(root, files[i]), 'const DATA = '+JSON.stringify(c.data)+';\n'));
  const index = path.join(root, 'index.html');
  fs.writeFileSync(index, template);
  assert.throws(() => updateIndex({root,check:true}), /counts are stale/);
  updateIndex({root,dry:true});
  assert.equal(fs.readFileSync(index,'utf8'), template, 'Dry run must not write');
  updateIndex({root});
  assert.equal(fs.readFileSync(index,'utf8'), rendered);
  updateIndex({root,check:true});
} finally {
  // Only remove the four known fixture files, then the empty fixture directory.
  for (const file of files) if (fs.existsSync(path.join(root,file))) fs.unlinkSync(path.join(root,file));
  fs.rmdirSync(root);
}
updateIndex({check:true});
console.log('PASS index statistics: headwords, overlaps, all scopes, idempotence, current generated index');
