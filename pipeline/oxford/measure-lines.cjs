// [{word, ex}] → [[{t,q}@390, {t,q}@360], ...] (게임의 실제 렌더 함수로 잰다)
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const drafts=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const server=http.createServer((q,r)=>{const p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':p.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});fs.createReadStream(p).pipe(r);});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const out={};
  for(const W of [390,360]){
    const pg=await (await b.newContext({viewport:{width:W,height:800},deviceScaleFactor:2,isMobile:true,hasTouch:true})).newPage();
    await pg.goto(`http://127.0.0.1:${server.address().port}/vocagoyangfable.html`);await pg.waitForSelector('.lessonbtn');
    await pg.evaluate(()=>{openLesson(0);openExercise(0);});await pg.waitForFunction(()=>state.session&&document.querySelector('#hoeCtx'));
    out[W]=await pg.evaluate(ds=>{
      const box=document.querySelector('#hoeCtx');
      const lines=el=>{const lh=parseFloat(getComputedStyle(el).lineHeight)||24,cs=[];const r=document.createRange();r.selectNodeContents(el);for(const rc of r.getClientRects())if(rc.width>0&&rc.height>0)cs.push((rc.top+rc.bottom)/2);cs.sort((a,b)=>a-b);let n=0,last=-1e9;for(const c of cs){if(c-last>lh*0.5){n++;last=c;}}return n;};
      return ds.map(d=>{const w={term:d.word,ex:d.ex};box.innerHTML=hoeCtxHtml(w);const ex=box.querySelector('.ex');const q=lines(ex);ex.innerHTML=fillBlank(w.ex,w.term);return {q,t:lines(ex)};});
    },drafts);
  }
  await b.close();server.close();
  process.stdout.write(JSON.stringify(drafts.map((_,i)=>[out[390][i],out[360][i]])));
})().catch(e=>{console.error(e);process.exit(1);});
