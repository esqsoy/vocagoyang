/* Build-time spelling/IPA alignment. This is NOT a pronunciation generator.
 * Every accepted path consumes the supplied spelling and IPA completely.
 * Unrecognised or ambiguous input is rendered as one intact IPA string.
 * Ranges count ASCII letter slots, excluding punctuation and word spaces.
 * beat is an approximate syllable cue, never a measured audio timestamp.
 */
'use strict';

const VOWEL=/[aeiouæɑɒɔəɛɪʊʌɚɝɜ]/;
const STRESS=/[ˈˌ]/;
const PHONE=/^(?:tʃ|dʒ|eɪ|aɪ|ɔɪ|oʊ|əʊ|aʊ|ɪə|eə|ʊə|[a-zæɑɒɔəɛɪʊʌɚɝɜɡɹʃʒθðŋɾʔ])(?:ː|ˑ|̩)?/u;

const SINGLE={
 a:['æ','eɪ','ə','ɑ','ɑː','ɔ','ɔː','ɛ','ɪ'],
 e:['ɛ','e','i','iː','ə','ɪ'], i:['ɪ','aɪ','i','iː','ə'],
 o:['ɑ','ɑː','ɒ','oʊ','əʊ','ɔ','ɔː','ʌ','ə','u','uː','ʊ'],
 u:['ʌ','u','uː','ʊ','ə','ju','juː','ɪ'], y:['j','i','iː','ɪ','aɪ','ə'],
 b:['b'], c:['k','s'], d:['d'], f:['f'], g:['g','dʒ'], h:['h'], j:['dʒ'],
 k:['k'], l:['l'], m:['m'], n:['n'], p:['p'], q:['k'], r:['r'],
 s:['s','z'], t:['t','ɾ'], v:['v'], w:['w'], x:['ks','gz'], z:['z']
};
const MULTI={
 ai:['eɪ','ɛ','ə'], ay:['eɪ'], au:['ɔ','ɔː','ɑ','ɑː'], aw:['ɔ','ɔː','ɑ'],
 ea:['i','iː','ɛ','eɪ'], ee:['i','iː'], ei:['eɪ','i','iː','ɪ','aɪ'], ey:['eɪ','i','iː','ɪ'],
 ie:['i','iː','aɪ'], oa:['oʊ','əʊ'], oe:['oʊ','əʊ','u'], oi:['ɔɪ'], oy:['ɔɪ'],
 oo:['u','uː','ʊ','ʌ'], ou:['aʊ','oʊ','əʊ','ʌ','u','uː','ʊ'], ow:['aʊ','oʊ','əʊ'],
 ue:['u','uː','ju','juː'], ui:['u','uː','ɪ'], ew:['u','uː','ju','juː'],
 ar:['ɑr','ɑːr','ɚ','ɝ','ɔr'], er:['ɚ','ɝ','ɜːr'], ir:['ɚ','ɝ','ɜːr'],
 or:['ɚ','ɝ','ɔr','ɔːr'], ur:['ɚ','ɝ','ɜːr'], yr:['ɝ'],
 air:['ɛr','eər'], are:['ɛr','eər'], ear:['ɪr','ɛr','ɝ','ɚ'],
 eer:['ɪr'], ere:['ɪr','ɛr'], oar:['ɔr'], our:['ɔr','aʊr','ɚ','ʊr'],
 ch:['tʃ','k','ʃ'], sh:['ʃ'], th:['θ','ð'], ph:['f'], ck:['k'],
 ng:['ŋ'], nk:['ŋk'], qu:['kw'], wh:['w','h'], gh:['f','g'],
 tch:['tʃ'], dge:['dʒ'], igh:['aɪ'], eigh:['eɪ'],
 tion:['ʃən'], sion:['ʒən','ʃən'], cian:['ʃən'],
 cious:['ʃəs'], tious:['ʃəs'], cial:['ʃəl'], tial:['ʃəl'],
 sure:['ʒɚ','ʃɚ'], ture:['tʃɚ'],
 gue:['g'], que:['k'], le:['əl','l̩']
};
for(const c of 'bcdfgklmnprstvz')MULTI[c+c]=SINGLE[c];
const RULES=Object.entries(MULTI).sort((a,b)=>b[0].length-a[0].length);
const ONSETS=new Set(['','p','b','t','d','k','g','f','v','θ','ð','s','z','ʃ','ʒ','h','m','n','l','r','w','j','tʃ','dʒ',
 'pl','bl','kl','gl','fl','sl','pr','br','tr','dr','kr','gr','fr','θr','ʃr','tw','dw','kw','gw','sw','sk','sp','st','sm','sn','sf',
 'spr','str','skr','spl','skw','skl','pj','bj','tj','dj','kj','gj','fj','vj','mj','nj','hj','sj','stj']);

function tokenize(ipa){
 const tokens=[];let cursor=0,pending='',boundary=false;
 while(cursor<ipa.length){
  const c=ipa[cursor];
  if(STRESS.test(c)){pending+=c;cursor++;continue;}
  if(c==='.'){boundary=true;cursor++;continue;}
  const match=ipa.slice(cursor).match(PHONE);if(!match)return null;
  const raw=match[0];tokens.push({raw,prefix:pending,boundary,phon:raw.replace(/ɡ/g,'g').replace(/ɹ/g,'r'),vowel:VOWEL.test(raw)});
  cursor+=raw.length;pending='';boundary=false;
 }
 return pending?null:tokens;
}
function phonetics(value){return value.replace(/ɡ/g,'g').replace(/ɹ/g,'r');}
function matchPhones(tokens,index,value){
 let sum='';for(let i=index;i<tokens.length;i++){
  sum+=tokens[i].phon;
  if(sum===value)return i+1;
  if(!value.startsWith(sum))break;
 }
 return null;
}
function silentAllowed(word,pos,letters){
 const rest=word.slice(pos),before=word.slice(0,pos);
 if(letters==='e')return pos===word.length-1||/^(?:s|d|ly|ness|ful|less|ment|r|st)$/.test(word.slice(pos+1));
 if(letters==='k')return pos===0&&rest.startsWith('kn');
 if(letters==='w')return pos===0&&rest.startsWith('wr');
 if(letters==='b')return (pos===word.length-1&&before.endsWith('m'))||/^d(?:ou|e)bt/.test(word)&&rest.startsWith('bt');
 if(letters==='p')return pos===0&&/^(?:pn|ps|pt)/.test(rest)||/^receipt/.test(word)&&rest.startsWith('pt');
 if(letters==='h')return pos===0&&/^(?:honest|honor|honour|hour|heir)/.test(word);
 if(letters==='gh')return /[aeiouy]$/.test(before);
 if(letters==='l')return /^(?:could|would|should|calm|palm|salmon|half|calf|walk|talk|chalk|stalk|folk|yolk)/.test(word);
 if(letters==='t')return /^(?:listen|fasten|soften|often|castle|whistle|wrestle|Christmas)/i.test(word);
 return false;
}
function candidates(word,pos,tokens,pi){
 const out=[];
 const offer=(letters,values,cost)=>{
  if(!word.startsWith(letters,pos))return;
  for(const value of values){const end=matchPhones(tokens,pi,phonetics(value));if(end!==null)out.push({letters,end,cost});}
 };
 for(const [letters,values] of RULES)offer(letters,values,.86);
 offer(word[pos],SINGLE[word[pos]]||[],1);
 // Restricted contextual allophones, rather than blanket extra readings.
 if(word[pos]==='n'&&/[kg]/.test(word[pos+1]||''))offer('n',['ŋ'],1);
 if(word[pos]==='s'&&/^(?:ure|ion|ia)/.test(word.slice(pos+1)))offer('s',['ʃ','ʒ'],1.1);
 if(word[pos]==='t'&&/^(?:ure|ua)/.test(word.slice(pos+1)))offer('t',['tʃ'],1.1);
 if(word[pos]==='d'&&/^(?:ure|ua)/.test(word.slice(pos+1)))offer('d',['dʒ'],1.1);
 if(word[pos]==='x'&&pos===0)offer('x',['z'],1.1);
 for(const letters of ['e','k','w','b','p','h','gh','l','t']){
  if(word.startsWith(letters,pos)&&silentAllowed(word,pos,letters))out.push({letters,end:pi,cost:1.3});
 }
 return out;
}
function paths(word,tokens){
 const memo=new Map();
 function visit(pos,pi){
  if(pos===word.length)return pi===tokens.length?[{cost:0,units:[]}]:[];
  const key=pos+','+pi;if(memo.has(key))return memo.get(key);
  const found=[];
  for(const option of candidates(word,pos,tokens,pi)){
   for(const tail of visit(pos+option.letters.length,option.end)){
    const unit={start:pos,end:pos+option.letters.length,from:pi,to:option.end};
    found.push({cost:option.cost+tail.cost,units:[unit,...tail.units]});
   }
  }
  found.sort((a,b)=>a.cost-b.cost);const best=found.slice(0,3);memo.set(key,best);return best;
 }
 return visit(0,0);
}
function groupUnits(units,tokens){
 const vowels=[];
 // x can span /k/ + /s/ with an explicit syllable/stress boundary between
 // them (experience). One letter slot cannot represent that split faithfully.
 for(const unit of units){if(tokens.slice(unit.from+1,unit.to).some(t=>t.boundary||STRESS.test(t.prefix)))return null;}
 for(let i=0;i<units.length;i++)if(tokens.slice(units[i].from,units[i].to).some(t=>t.vowel))vowels.push(i);
 if(!vowels.length)return null;
 // A multi-letter rule may describe exactly one syllable, not hide two vowels.
 for(const unit of units){if(tokens.slice(unit.from,unit.to).filter(t=>t.vowel).length>1)return null;}
 const boundaries=[0];
 for(let vi=1;vi<vowels.length;vi++){
  const prev=vowels[vi-1],next=vowels[vi];let boundary=next;
  const explicit=[];
  for(let u=prev+1;u<=next;u++)if(tokens.slice(units[u].from,units[u].to).some(t=>t.boundary||STRESS.test(t.prefix)))explicit.push(u);
  if(explicit.length)boundary=explicit[0];
  else{
   const nucleus=units[next].from+tokens.slice(units[next].from,units[next].to).findIndex(t=>t.vowel);
   for(let u=next-1;u>prev;u--){
    // A syllabic rule (e.g. tion=/ʃən/) already contains an onset. Include
    // it when deciding whether a previous consonant can join that onset.
    const onset=tokens.slice(units[u].from,nucleus).map(t=>t.phon).join('');
    if(ONSETS.has(onset))boundary=u;
   }
  }
  boundaries.push(boundary);
 }
 boundaries.push(units.length);
 const parts=[];
 for(let beat=0;beat<boundaries.length-1;beat++){
  const group=units.slice(boundaries[beat],boundaries[beat+1]);
  const source=tokens.slice(group[0].from,group[group.length-1].to);
  const raw=source.map(t=>t.prefix+t.raw).join('');
  parts.push({start:group[0].start,end:group[group.length-1].end,ipa:raw,
   stress:raw.includes('ˈ'),secondary:raw.includes('ˌ'),silent:false,beat,weight:raw.includes('ˈ')?1.5:1});
 }
 return parts;
}

const REVIEWED={
 'official|əˈfɪʃəl':[[0,1,'ə',0],[1,4,'ˈfɪ',1],[4,8,'ʃəl',2]],
 'photographic|ˌfoʊtəˈɡræfɪk':[[0,3,'ˌfoʊ',0],[3,5,'tə',1],[5,10,'ˈɡræf',2],[10,12,'ɪk',3]],
 'list|lɪst':[[0,1,'l',0],[1,2,'ɪ',0],[2,3,'s',0],[3,4,'t',0]],
 'doubt|daʊt':[[0,1,'d',0],[1,3,'aʊ',0],[3,4,'',0],[4,5,'t',0]],
 'knot|nɑt':[[0,1,'',0],[1,2,'n',0],[2,3,'ɑ',0],[3,4,'t',0]],
 'receipt|rɪˈsit':[[0,2,'rɪ',0],[2,5,'ˈsi',1],[5,6,'',1],[6,7,'t',1]]
};
function reviewedParts(rows){return rows.map(([start,end,ipa,beat])=>({start,end,ipa,stress:ipa.includes('ˈ'),secondary:ipa.includes('ˌ'),silent:!ipa,beat,weight:!ipa?0:ipa.includes('ˈ')?1.5:1}));}
function whole(term,ipa,reason){
 const n=(String(term).match(/[a-z]/gi)||[]).length;
 return {mode:'whole',reason,parts:n&&ipa?[{start:0,end:n,ipa,stress:ipa.includes('ˈ'),secondary:ipa.includes('ˌ'),silent:false,beat:0,weight:1}]:[]};
}
function alignWord(word,ipa){
 const reviewed=REVIEWED[word.toLowerCase()+'|'+ipa];if(reviewed)return {mode:'aligned',parts:reviewedParts(reviewed),basis:'reviewed'};
 const tokens=tokenize(ipa);if(!tokens)return whole(word,ipa,'unsupported IPA notation');
 const all=paths(word.toLowerCase(),tokens);
 if(!all.length)return whole(word,ipa,'no complete rule match');
 if(all[1]&&Math.abs(all[0].cost-all[1].cost)<.08){
  const key=units=>units.filter(u=>tokens.slice(u.from,u.to).some(t=>t.vowel)).map(u=>u.start+':'+u.end+':'+u.from+':'+u.to).join('|');
  if(key(all[0].units)!==key(all[1].units))return whole(word,ipa,'ambiguous vowel alignment');
 }
 const parts=groupUnits(all[0].units,tokens);if(!parts)return whole(word,ipa,'unresolved syllable group');
 return {mode:'aligned',parts,basis:'complete grapheme match'};
}
function align(term,ipa){
 term=String(term||'').trim();ipa=String(ipa||'').trim();
 if(!term||!ipa)return whole(term,ipa,'missing spelling or IPA');
 if(/^[a-z]+$/i.test(term))return alignWord(term,ipa);
 // Spaced citation forms are safe only with matching explicit word boundaries.
 if(/^[a-z]+(?: [a-z]+)+$/i.test(term)){
  const words=term.split(' '),sounds=ipa.split(/\s+/);
  if(words.length!==sounds.length)return whole(term,ipa,'different phrase boundaries');
  let offset=0,beatOffset=0;const parts=[];
  for(let i=0;i<words.length;i++){
   const item=alignWord(words[i],sounds[i]);if(item.mode!=='aligned')return whole(term,ipa,'unresolved phrase component');
   parts.push(...item.parts.map(p=>({...p,start:p.start+offset,end:p.end+offset,beat:p.beat+beatOffset})));
   offset+=words[i].length;beatOffset+=Math.max(...item.parts.map(p=>p.beat))+1;
  }
  return {mode:'aligned',parts,basis:'explicit component boundaries'};
 }
 return whole(term,ipa,'punctuation or non-ASCII spelling');
}
module.exports={align,tokenize,REVIEWED};
