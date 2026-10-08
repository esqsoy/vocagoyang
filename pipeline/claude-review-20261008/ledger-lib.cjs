'use strict';
// 두 JSON 값의 경로 단위 차이를 기록하고 되돌린다. 원장 생성과 복원이 같은 규칙을 쓴다.
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const isObj=v=>v&&typeof v==='object';
function diff(a,b,path=[],out=[]){
  if(Array.isArray(a)&&Array.isArray(b)){
    const n=Math.min(a.length,b.length);
    for(let i=0;i<n;i++)diff(a[i],b[i],[...path,i],out);
    for(let i=n;i<b.length;i++)out.push({path:[...path,i],oldExists:false,newExists:true,new:b[i]});
    for(let i=n;i<a.length;i++)out.push({path:[...path,i],oldExists:true,newExists:false,old:a[i]});
    return out;
  }
  if(isObj(a)&&isObj(b)&&!Array.isArray(a)&&!Array.isArray(b)){
    for(const k of new Set([...Object.keys(a),...Object.keys(b)])){
      const ha=Object.hasOwn(a,k),hb=Object.hasOwn(b,k);
      if(ha&&hb)diff(a[k],b[k],[...path,k],out);
      else if(hb)out.push({path:[...path,k],oldExists:false,newExists:true,new:b[k]});
      else out.push({path:[...path,k],oldExists:true,newExists:false,old:a[k]});
    }
    return out;
  }
  if(JSON.stringify(a)!==JSON.stringify(b))out.push({path,oldExists:true,newExists:true,old:a,new:b});
  return out;
}
// 키 순서까지 원래대로 돌리기 위해 객체는 원래 키 순서를 보존해 재구성한다.
function reverse(value,changes,keyOrders){
  const v=structuredClone(value);
  for(const ch of [...changes].reverse()){
    const p=ch.path,key=p.at(-1),parent=p.slice(0,-1).reduce((x,k)=>x[k],v);
    if(ch.newExists){assert.deepEqual(parent[key],ch.new,'current value differs at '+JSON.stringify(p));}
    if(!ch.oldExists){ if(Array.isArray(parent))parent.splice(key,1); else delete parent[key]; }
    else if(!ch.newExists&&Array.isArray(parent))parent.splice(key,0,structuredClone(ch.old));
    else parent[key]=structuredClone(ch.old);
  }
  for(const {path,keys} of keyOrders||[]){
    const o=path.reduce((x,k)=>x[k],v),copy={...o};for(const k of Object.keys(o))delete o[k];
    for(const k of keys)if(Object.hasOwn(copy,k))o[k]=copy[k];
    for(const k of Object.keys(copy))if(!Object.hasOwn(o,k))o[k]=copy[k];
  }
  return v;
}
// 지운 키가 있으면 그 객체의 원래 키 순서를 남긴다(복원 해시가 키 순서까지 맞도록).
function keyOrders(before,changes){
  const seen=new Set(),out=[];
  for(const ch of changes)if(ch.oldExists&&!ch.newExists){
    const pp=ch.path.slice(0,-1),id=JSON.stringify(pp);if(seen.has(id))continue;seen.add(id);
    const o=pp.reduce((x,k)=>x[k],before);if(o&&!Array.isArray(o))out.push({path:pp,keys:Object.keys(o)});
  }
  return out;
}
module.exports={hash,diff,reverse,keyOrders};
