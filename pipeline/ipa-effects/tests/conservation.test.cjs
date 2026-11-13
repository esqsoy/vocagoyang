const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../..');
const baselineFile=path.join(__dirname,'conservation-baseline.json');
// 세 교재와 시험 단어장(pipeline/exam). 시험 단어장은 내용이 계속 들어오므로 DATA는 보지 않고(data:null),
// 저장 키·목소리 고르기·복습 장미만 지킨다. 기준값은 손으로 더했다(--capture는 기존 기준값을 덮지 않는다).
const {ALL:files,isFableEngine,isFableCourse,isExam}=require('../../tests/helpers/courses.cjs');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function slice(html,start,end){const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert(a>=0&&b>a,start);return html.slice(a,b).replace(/\r\n/g,'\n').trim();}
function snapshot(file){
  const html=fs.readFileSync(path.join(root,file),'utf8'),fable=isFableEngine(file);
  const data=html.match(/const DATA\s*=\s*(\[.*?\]);\r?\n/s);assert(data,file+' DATA');
  const storage=Object.fromEntries(['STORAGE','MODEKEY','LASTKEY','UNIKEY'].map(key=>{const m=html.match(new RegExp('const '+key+'="([^"]+)"'));assert(m,key);return [key,m[1]];}));
  const scoring=fable?slice(html,'function voiceScore(','function pickVoice('):slice(html,'function pronunciationVoiceScore(','function pickPronunciationVoice(');
  const picker=fable?slice(html,'function pickVoice(','if(window.speechSynthesis)'):slice(html,'function pickPronunciationVoice(','function stopPronunciation(');
  const roses=slice(html,'function fxHeart(el){','/* ===== misc ===== */');
  // The approved example/synonym review changes only logged content fields.
  // Reverse that delta, retaining the original conservation hash unchanged.
  const parsed=JSON.parse(data[1]);
  const conserved=isFableCourse(file)?require('../../synonym-review-20260929/restore.cjs').restoreSynonymReview(parsed):parsed;
  return {data:isExam(file)?null:hash(JSON.stringify(conserved)),storage,scoring:hash(scoring),picker:hash(picker),reviewRoses:hash(roses)};
}
if(process.argv.includes('--capture')){
  assert(!fs.existsSync(baselineFile),'Baseline already exists; do not overwrite it to bless a regression.');
  fs.writeFileSync(baselineFile,JSON.stringify({description:'Pre-rollout conservation baseline, 2026-09-29. New EBS IPA table intentionally outside DATA.',files:Object.fromEntries(files.map(file=>[file,snapshot(file)]))},null,2)+'\n');
  console.log('Captured pre-rollout DATA, storage, voice selection, and review rose baselines.');
} else {
  const baseline=JSON.parse(fs.readFileSync(baselineFile,'utf8'));
  for(const file of files)assert(baseline.files[file],file+': no conservation baseline. Add its snapshot by hand (exam books: data null), never by --capture.');
  for(const file of files)assert.deepEqual(snapshot(file),baseline.files[file],file+' altered learning content, progress keys, original voice selection, or review roses');
  console.log('PASS: all three courses preserve DATA, progress/resume keys, original voice selection, and review rose effects'+(files.length>3?'; exam books keep their keys, voice selection, and roses.':'.'));
}
