#!/usr/bin/env node
'use strict';
/* 예문 '한눈에' 검사 — 폰 문제 화면에서 예문이 몇 줄로 보이는지 실제 렌더로 센다.

   기준(PRINCIPLES 2-2, 26.10.08 영신 확정): 폰(390px) 문제 화면에서 예문 3줄 이내.
   왜: 길이 상한은 "한 화면에 나오냐"가 아니라 "한눈에 들어오냐"의 문제다. 모르는 단어가 섞이거나
   눈이 문장을 훑어 내려가야 하면 지식도 단어도 남지 않는다. 단어 수로는 줄 수를 잘 예측하지 못한다
   (짧은 단어면 13단어도 3줄, 긴 정답이면 7단어도 빈칸이 한 줄을 먹는다) — 그래서 화면에서 직접 잰다.

   사용: node pipeline/linecheck.cjs [--width 390] [--max 3] [--strict] [--list]
         Playwright가 필요하다(NODE_PATH에 playwright). 브라우저는 PW_CHROMIUM 또는 /opt/pw-browsers 기본값.
   --strict 이면 기준 초과 예문이 있을 때 종료 코드 1. 기본은 경고만 낸다(판정은 사람이, 경고는 기계가). */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i>0?process.argv[i+1]:d;};
const WIDTH=+arg('--width',390),MAX=+arg('--max',3),STRICT=process.argv.includes('--strict'),LIST=process.argv.includes('--list');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const server=http.createServer((req,res)=>{
  const p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));
  if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'content-type':TYPES[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`;
  const exe=process.env.PW_CHROMIUM||(fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')?'/opt/pw-browsers/chromium-1194/chrome-linux/chrome':undefined);
  const browser=await chromium.launch(exe?{executablePath:exe}:{});
  const page=await (await browser.newContext({viewport:{width:WIDTH,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'ko-KR'})).newPage();
  await page.goto(base+'/vocagoyangfable.html',{waitUntil:'load'});await page.waitForSelector('.lessonbtn');
  await page.evaluate(()=>{openLesson(0);openExercise(0);});
  await page.waitForFunction(()=>state.session&&document.querySelector('#hoeCtx'));
  const rows=await page.evaluate(()=>{
    const box=document.querySelector('#hoeCtx'),out=[];
    // 줄 수 = 글자·빈칸 칸의 세로 중심을 줄 높이의 절반 간격으로 묶은 개수(빈칸 칸이 조금 높아도 한 줄로 센다)
    const lines=el=>{
      const lh=parseFloat(getComputedStyle(el).lineHeight)||24,cs=[];
      const r=document.createRange();r.selectNodeContents(el);
      for(const rc of r.getClientRects())if(rc.width>0&&rc.height>0)cs.push((rc.top+rc.bottom)/2);
      cs.sort((a,b)=>a-b);let n=0,last=-1e9;for(const c of cs){if(c-last>lh*0.5){n++;last=c;}}
      return n;
    };
    state.lessons.forEach(L=>L.exercises.forEach(e=>e.words.forEach(w=>{
      if(!w.ex)return;box.innerHTML=hoeCtxHtml(w);const ex=box.querySelector('.ex');
      out.push({lesson:L.lesson,word:w.term,ex:w.ex,lines:lines(ex)});
    })));
    return out;
  });
  await browser.close();server.close();
  const dist={};for(const r of rows)dist[r.lines]=(dist[r.lines]||0)+1;
  const over=rows.filter(r=>r.lines>MAX);
  const seen=new Set(),overUnique=over.filter(r=>{const k=r.lesson+'|'+r.word+'|'+r.ex;if(seen.has(k))return false;seen.add(k);return true;});
  console.log(JSON.stringify({width:WIDTH,max:MAX,examples:rows.length,lines:dist,over:overUnique.length}));
  if(LIST||overUnique.length)for(const r of overUnique.sort((a,b)=>b.lines-a.lines||a.lesson-b.lesson))console.log(`${r.lines}줄 ${String(r.lesson).padStart(2)}세트 ${r.word.padEnd(16)} ${r.ex}`);
  process.exit(STRICT&&overUnique.length?1:0);
})().catch(e=>{console.error(e);server.close();process.exit(2);});
