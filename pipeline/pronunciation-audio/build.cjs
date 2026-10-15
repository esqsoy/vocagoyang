'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..');
function loadMedia(){
 const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'catalog.json'),'utf8'));
 const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/pronunciation/manifest.json'),'utf8'));
 assert.equal(catalog.voice,manifest.voice,'Regenerate audio after changing voice');
 const media=new Map(manifest.entries.map(e=>[e.id,e])),map={},ids=new Set();
 for(const entry of catalog.entries){
  assert(!ids.has(entry.id),'Duplicate audio ID '+entry.id);ids.add(entry.id);
  if(entry.status!=='ready')continue;
  assert(/^[a-z0-9-]+$/.test(entry.id),'Unsafe audio ID');
  const clip=media.get(entry.id);assert(clip,'Missing generated audio '+entry.id);
  assert.equal(clip.phonemes,entry.phonemes,'Stale phonemes for '+entry.id);
  assert.equal(clip.src,'assets/pronunciation/'+entry.id+'.mp3','Unexpected audio path');
  assert(Number.isFinite(clip.duration)&&clip.duration>.2&&clip.duration<6,'Invalid audio duration');
  const bytes=fs.readFileSync(path.join(ROOT,clip.src));
  assert.equal(bytes.length,clip.bytes,'Audio length mismatch '+entry.id);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),clip.sha256,'Audio hash mismatch '+entry.id);
  for(const ipa of entry.ipaAliases){
   const key=entry.term+'\t'+ipa;
   const value={src:clip.src+'?v='+clip.sha256.slice(0,12),duration:clip.duration};
   assert(!map[key]||JSON.stringify(map[key])===JSON.stringify(value),'Ambiguous pronunciation '+key);
   map[key]=value;
  }
 }
 for(const id of media.keys())assert(ids.has(id),'Orphan generated audio '+id);
 return map;
}
function runtime(){return fs.readFileSync(path.join(__dirname,'runtime.js'),'utf8');}
if(require.main===module){const map=loadMedia();console.log(JSON.stringify({exactPairs:Object.keys(map).length,files:new Set(Object.values(map).map(e=>e.src)).size}));}
module.exports={loadMedia,runtime};
