// 사용: node render.js merge|student|set N   — hoe_master.json에서 렌더
const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,AlignmentType,HeadingLevel,BorderStyle,PageBreak}=require('docx');
const db=JSON.parse(fs.readFileSync('hoe_master.json','utf8'));
const mode=process.argv[2]||'merge', arg=process.argv[3];
const student=(mode==='student');
let cards=db.cards; let title,out;
if(mode==='set'){ cards=cards.filter(c=>c.set==+arg); title=`${arg}세트 (빈도 ${(arg-1)*20+1}~${arg*20}위)`; out=`/mnt/user-data/outputs/HoE_Set${arg}.docx`; }
else if(mode==='block'){ cards=cards.filter(c=>c.block==+arg); title=`${arg}블록 (빈도 ${(arg-1)*100+1}~${arg*100}위)`; out=`/mnt/user-data/outputs/HoE_Block${arg}.docx`; }
else { const mx=Math.max(...cards.map(c=>c.n));
  title=`빈도 1~${mx}위 합본`;
  out=student?`/mnt/user-data/outputs/Heart_of_English_Student_Sets1-${mx}.docx`:`/mnt/user-data/outputs/Heart_of_English_Stage1_Sets1-${mx}.docx`; }
const ACC="1F6F5C",BLUE="2E5C8A",GREY="666666",WARN="C0552B",POSC="8A5C2E";
const P=(ch,o={})=>new Paragraph({children:ch,spacing:{after:60},...o});
const lab=(t,c)=>new TextRun({text:t+"  ",bold:true,color:c,font:"Arial",size:18});
const bod=(t,o={})=>new TextRun({text:t,font:"Arial",size:20,...o});

// IPA: 강세 음절(ˈ/ˌ 포함)만 볼드 처리한 TextRun 배열
function ipaRuns(ipa){
  const runs=[new TextRun({text:"  /",size:18,color:GREY,font:"Arial"})];
  ipa.split('.').forEach(syl=>{
    const stressed=syl.includes('ˈ')||syl.includes('ˌ');
    runs.push(new TextRun({text:syl,size:18,color:GREY,font:"Arial",bold:stressed}));
  });
  runs.push(new TextRun({text:"/",size:18,color:GREY,font:"Arial"}));
  return runs;
}
const C=[];
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:1600,after:240},children:[new TextRun({text:"Heart of English",bold:true,size:60,font:"Arial",color:ACC})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:"1단계 · 롱맨 기본단어",bold:true,size:32,font:"Arial"})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[new TextRun({text:title,size:24,font:"Arial",color:GREY})]}));
C.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:`${cards.length} 표제어`,size:20,font:"Arial",color:GREY})]}));
C.push(new Paragraph({children:[new PageBreak()]}));
let cur=-1;
for(const h of cards){
  if(mode!=='set' && h.block!==cur){ cur=h.block;
    C.push(new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:120,after:120},
      children:[new TextRun({text:`${cur}블록 · 빈도 ${(cur-1)*100+1}~${cur*100}위`,bold:true,size:32,font:"Arial",color:ACC})]})); }
  const hd=[new TextRun({text:`${h.n}. ${h.word}`,bold:true,size:28,font:"Arial"})];
  if(h.ipa) hd.push(...ipaRuns(h.ipa));
  if(h.tag && !student) hd.push(new TextRun({text:`   ${h.tag}`,italics:true,size:16,color:ACC,font:"Arial"}));  // 태그=내부용, 학생판 비표시
  if(!student && !h.reviewed) hd.push(new TextRun({text:`   ⟨미검수⟩`,bold:true,size:16,color:WARN,font:"Arial"}));
  C.push(new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:180,after:70},children:hd,
    border:{bottom:{style:BorderStyle.SINGLE,size:6,color:(student||h.reviewed)?ACC:WARN,space:2}}}));
  for(const s of h.senses){
    // 뜻풀이: ① [n.] 시간
    const gr=[];
    const m=s.g.match(/^([\u2460-\u2465])\s*(.*)$/);   // ①②③ 번호 분리
    if(m && s.pos){                                     // 번호 → 품사 → 뜻풀이
      gr.push(new TextRun({text:m[1]+" ",bold:true,size:22,font:"Arial",color:BLUE}));
      gr.push(new TextRun({text:`[${s.pos}] `,bold:true,size:20,font:"Arial",color:POSC}));
      gr.push(new TextRun({text:m[2],bold:true,size:22,font:"Arial",color:BLUE}));
    } else {
      if(s.pos) gr.push(new TextRun({text:`[${s.pos}] `,bold:true,size:20,font:"Arial",color:POSC}));
      gr.push(new TextRun({text:s.g,bold:true,size:22,font:"Arial",color:BLUE}));
    }
    C.push(P(gr,{spacing:{before:90,after:36}}));
    // 첫 2회 풀네임: 별도 줄
    if(s.pos_full && db.pos_gloss && db.pos_gloss[s.pos]){
      const lines=db.pos_gloss[s.pos].split('\n');
      lines.forEach((ln,i)=>{
        const txt=(i===0)?`${s.pos} = ${ln}`:ln;
        const isTable=/^\s{2,}(관사|양|지시|소유)/.test(ln);
        C.push(P([new TextRun({text:txt.trim(),size:16,italics:true,color:POSC,font:isTable?"Courier New":"Arial"})],
          {indent:{left:isTable?480:240},spacing:{after:i===lines.length-1?40:10}}));
      });
    }
    C.push(P([lab("예문",ACC),bod(s.ex,{italics:true})],{indent:{left:240}}));
    const ar=[lab("답",ACC),bod(s.ans,{bold:true})];
    if(s.form) ar.push(bod(`  〔${s.form}〕`,{color:GREY,size:16}));
    ar.push(new TextRun({text:"     ",font:"Arial"}),lab("해석",BLUE),bod(s.tr));
    C.push(P(ar,{indent:{left:240}}));
    if(s.c) C.push(P([lab("해설",ACC),bod(s.c)],{indent:{left:240}}));   // 변별은 해설로 통합됨
  }
}
const doc=new Document({styles:{default:{document:{run:{font:"Arial",size:20}}},
  paragraphStyles:[
   {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:32,bold:true,font:"Arial"},paragraph:{spacing:{before:240,after:120},outlineLevel:0}},
   {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{size:28,bold:true,font:"Arial"},paragraph:{spacing:{before:180,after:70},outlineLevel:1}}]},
  sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},children:C}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync(out,b);console.log(mode,'렌더 완료 →',out);});
