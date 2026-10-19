// 사용: node append.js setN.js N  — 마스터 JSON에 새 세트 편입
const fs=require('fs');
const H=require('./'+process.argv[2]); const setno=+process.argv[3];
const db=JSON.parse(fs.readFileSync('hoe_master.json','utf8'));
const exist=new Set(db.cards.map(c=>c.word));
const dup=H.filter(c=>exist.has(c.word)).map(c=>c.word);
if(dup.length){console.error('중복 발견, 중단:',dup);process.exit(1);}
H.forEach(c=>db.cards.push({...c,set:setno,reviewed:false}));
db.cards.sort((a,b)=>a.n-b.n);
db.total=db.cards.length; db.senses=db.cards.reduce((s,c)=>s+c.senses.length,0);
db.updated=new Date().toISOString().slice(0,10);
fs.writeFileSync('hoe_master.json',JSON.stringify(db,null,1));
fs.writeFileSync('/mnt/user-data/outputs/HoE_master.json',JSON.stringify(db,null,1));
console.log('편입 완료:',setno,'세트 | 총',db.total,'표제어 /',db.senses,'뜻');
