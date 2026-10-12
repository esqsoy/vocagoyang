#!/usr/bin/env python3
"""세트 하나를 영신 직검수 페이지(claude.ai 아티팩트용 HTML)로 뽑는다.

26.10.11 영신: 직검수는 고치는 게 아니라 의견을 내는 것이라, 카드 옆에 '+'로 댓글을 다는 읽기 페이지가 편하다.
사용: python3 pipeline/review-page.py 세트번호 [--since 커밋] [--out 폴더]
      python3 pipeline/review-page.py changed --since 커밋 [--title 제목] [--name 파일명] [--out 폴더]  (세트를 가리지 않고 바뀐 카드만)
  --since 커밋: 그 커밋 뒤로 바뀐 카드에 표시를 붙이고 바뀐 칸의 전 내용을 함께 보인다(새 카드는 '새 카드').
카드마다 한 블록이라 댓글이 그 카드에 붙는다. 카드 번호는 세트-연습-카드(0-05-03).
화면 DATA(vocagoyangfable.html)를 읽으므로 assemble.py 뒤에 돌린다. 만든 HTML은 Artifact로 올린다.
"""
import html, json, re, subprocess, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'vocagoyangfable.html'
FIELDS = [('ko', '뜻'), ('ex', '예문'), ('tr', '해석'), ('c', '해설'), ('meow', '고양'), ('ipa', '발음'), ('pos', '품사')]
e = html.escape


def data_of(src):
    return json.loads(re.search(r'^const DATA = (\[.*\]);\s*$', src, re.M).group(1))


def alts_of(src):
    i = src.index('const ALT={')
    j = src.index('};', i)
    return json.loads(re.sub(r'//.*', '', src[i + len('const ALT='):j + 1]))


def sentence(w, ex=None):
    ex = w.get('ex') if ex is None else ex
    if not ex:
        return '<span class="none">(예문 없음)</span>'
    term = w['en']
    if ex.startswith('{{BLANK}}'):
        term = term[:1].upper() + term[1:]
    return e(ex).replace('{{BLANK}}', f'<mark>{e(term)}</mark>')


STYLE = '''<style>
/* 직검수 페이지: 세트 하나를 연습 순서대로 읽는 목록. 카드 한 장이 한 블록이라 댓글이 카드에 붙는다. 보카고양 읽기 페이지와 같은 색·글꼴. */
:root{--bg:#f6f5fa;--surface:#ffffff;--ink:#211a30;--muted:#686079;--line:#e2deec;--accent:#5b36a6;--accent-soft:#ece5f8;
--answer:#8a5a00;--answer-bg:#fff3cf;--chg:#a3431f;--chg-bg:#fbe9df;
--font-display:"Gowun Batang","Noto Serif KR",serif;--font-body:"IBM Plex Sans KR","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif;
--font-en:"Source Serif 4",Georgia,"Times New Roman",serif;--font-mono:"IBM Plex Mono",ui-monospace,Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141019;--surface:#1b1623;--ink:#ebe6f4;--muted:#a199b5;--line:#2d2639;
--accent:#b99cff;--accent-soft:#2a2140;--answer:#ffd34d;--answer-bg:#3a2e0b;--chg:#ffad8a;--chg-bg:#3b2219;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141019;--surface:#1b1623;--ink:#ebe6f4;--muted:#a199b5;--line:#2d2639;
--accent:#b99cff;--accent-soft:#2a2140;--answer:#ffd34d;--answer-bg:#3a2e0b;--chg:#ffad8a;--chg-bg:#3b2219;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.6;margin:0;word-break:keep-all;overflow-wrap:break-word}
.wrap{max-width:820px;margin:0 auto;padding-inline:16px;padding-block:28px 72px;display:grid;gap:26px}
h1{font-family:var(--font-display);font-weight:700;font-size:clamp(1.6rem,4.6vw,2.2rem);line-height:1.2;margin:0;text-wrap:balance}
h2{font-family:var(--font-display);font-size:1.2rem;margin:0;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;text-wrap:balance}
p{margin:0}
.lede{color:var(--muted);margin-top:6px;max-width:66ch}
.num{font-family:var(--font-mono);font-size:.78rem;color:var(--accent);font-weight:500}
.count{font-family:var(--font-mono);font-size:.8rem;color:var(--muted);font-weight:400}
nav.toc{display:flex;flex-wrap:wrap;gap:6px}
nav.toc a{font-size:.8rem;color:var(--accent);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:2px 9px;background:var(--surface)}
.tools{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);padding-block:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid var(--line)}
.seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--surface)}
.seg button{font:inherit;font-size:.84rem;border:0;background:transparent;color:var(--muted);padding:6px 10px;cursor:pointer}
.seg button[aria-pressed=true]{background:var(--accent-soft);color:var(--accent);font-weight:600}
button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
section.ex{display:grid;gap:4px}
ol.cards{list-style:none;margin:0;padding:0}
ol.cards li{display:grid;gap:3px;padding:12px 0;border-bottom:1px solid var(--line);min-width:0}
.head{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}
.hw{font-family:var(--font-en);font-weight:600;font-size:1.08rem}
.ko{font-size:.92rem}
.pos{font-family:var(--font-mono);font-size:.72rem;color:var(--muted)}
.tag{font-size:.72rem;color:var(--chg);background:var(--chg-bg);padding:0 7px;border-radius:5px}
.sen{font-family:var(--font-en);font-size:1.04rem}
mark{background:var(--answer-bg);color:var(--answer);padding:0 2px;border-radius:3px;font-weight:600}
.tr{color:var(--muted);font-size:.92rem}
.c{font-size:.9rem}
.meow{font-size:.86rem;color:var(--muted)}
.meow b,.alt b{font-weight:500;font-size:.72rem;letter-spacing:.03em;margin-right:6px;color:var(--accent)}
.alt{font-size:.84rem;color:var(--muted)}
.old{font-size:.82rem;color:var(--muted);border-left:2px solid var(--chg-bg);padding-left:8px}
.old b{font-weight:500;font-size:.72rem;margin-right:6px;color:var(--chg)}
.none{color:var(--muted)}
.hide{display:none}
/* 줄 댓글: 줄을 누르면 입력칸이 열리고 Enter로 바로 Claude에게 보낸다(comments 권한의 sendToClaude). */
.hint{font-size:.84rem;color:var(--accent);background:var(--accent-soft);border-radius:10px;padding:8px 12px}
body.cm-on .ln{cursor:text;border-radius:6px;margin-inline:-6px;padding-inline:6px}
@media (hover:hover){body.cm-on .ln:hover{background:var(--accent-soft)}}
.ln.on{background:var(--accent-soft)}
.ln.sent{box-shadow:inset 3px 0 0 var(--accent)}
.cbox{display:grid;gap:6px;margin:2px 0 6px;padding:8px;border:1px solid var(--accent);border-radius:10px;background:var(--surface)}
.cbox textarea{font:inherit;font-size:16px;line-height:1.5;width:100%;min-height:44px;resize:none;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--bg);color:var(--ink)}
.cbox textarea:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.cbox .row{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:space-between}
.cbox .st{font-size:.78rem;color:var(--muted);min-width:0}
.cbox .st.ok{color:var(--accent)}
.cbox .st.err{color:var(--chg)}
.cbox .go{font:inherit;font-size:.84rem;border:0;border-radius:8px;background:var(--accent);color:var(--surface);padding:6px 14px;min-height:36px;cursor:pointer}
.cbox .go:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>'''


# 줄 댓글(26.10.11 영신: "범위지정 후에 댓글달고 푸쉬해야 하는데 그건 좀 번거로워. 그냥 라인바이라인으로 댓글달수 있게 해주고
# 엔터치면 바로 너에게 가는걸로 해줘"). Artifact를 capabilities {comments: {}}로 올려야 동작한다. 없으면 기존 댓글 모드만 안내한다.
COMMENT_JS = r"""<script>(function(){
const hint=document.getElementById('cmhint');
const LABEL={head:'뜻',sen:'예문',tr:'해석',c:'해설',meow:'고양 대사',alt:'다른 정답'};
const ERR={consent_required:'허락 창에서 허용해야 보낼 수 있어. 쓴 글은 그대로 뒀어.',
forbidden:'이 화면에선 페이지에서 댓글 달기가 꺼져 있어. 범위를 지정하는 기존 댓글로 달아 줘.',
rate_limited:'너무 빨리 보냈어. 잠깐 뒤에 Enter를 다시 눌러 줘.',
claude_unavailable:'Claude에게 바로 보내기가 지금 안 돼. 쓴 글은 그대로 뒀어.',
invalid:'글이 너무 길거나 쓸 수 없는 글자가 있어.'};
let cm=null,open=null,shift=false;
function say(box,msg,cls){const s=box.querySelector('.st');s.textContent=msg;s.className='st'+(cls?' '+cls:'');}
function closeBox(){if(!open)return;open.box.remove();open.line.classList.remove('on');open=null;}
function off(msg){document.body.classList.remove('cm-on');closeBox();hint.textContent=msg;}
async function send(o){
  const ta=o.box.querySelector('textarea'),go=o.box.querySelector('.go'),text=ta.value.trim();
  if(!text||o.busy)return;
  o.busy=true;ta.readOnly=true;go.disabled=true;say(o.box,'보내는 중…');
  try{
    const anchor=await cm.anchorFor(o.line);
    let can='off';try{can=await cm.canSendToClaude();}catch(_){}
    if(can==='available'){await cm.sendToClaude({anchor,text});say(o.box,'Claude에게 보냈어.','ok');}
    else{await cm.create({anchor,text});say(o.box,'댓글로 남겼어. 바로 보내기가 지금 안 돼서, 대화창에 "댓글 봐줘"라고 해 줘.','err');}
    o.line.classList.add('sent');ta.value='';
    setTimeout(()=>{if(open===o)closeBox();},1500);
  }catch(err){
    const c=err&&err.code;
    say(o.box,ERR[c]||'못 보냈어. 쓴 글은 그대로 뒀어. 잠깐 뒤에 Enter를 다시 눌러 줘.','err');
    if(c==='forbidden'||c==='not_granted'||c==='capability_disabled'||c==='capability_removed')setTimeout(()=>off('이 화면에선 줄 댓글이 꺼져 있어. 범위를 지정하는 기존 댓글로 달아 줘.'),2500);
  }finally{o.busy=false;ta.readOnly=false;go.disabled=false;}
}
function openBox(line){
  if(open&&open.line===line){open.box.querySelector('textarea').focus();return;}
  if(open&&open.box.querySelector('textarea').value.trim()){open.box.querySelector('textarea').focus();say(open.box,'쓰던 글이 있어. 보내거나 Esc로 닫고 옮겨 줘.','err');return;}
  closeBox();
  const kind=Object.keys(LABEL).find(k=>line.classList.contains(k))||'';
  const name=LABEL[kind]||'이 줄';
  const box=document.createElement('div');box.className='cbox';box.setAttribute('data-uncommentable','');
  box.innerHTML='<textarea rows="1" enterkeyhint="send" maxlength="1300"></textarea><div class="row"><span class="st">Enter로 바로 보내기 · 줄바꿈은 Shift+Enter · Esc 닫기</span><button type="button" class="go">보내기</button></div>';
  const ta=box.querySelector('textarea');ta.setAttribute('aria-label',name+'에 댓글');ta.placeholder=name+'에 대한 의견';
  line.after(box);line.classList.add('on');
  const o={line,box,busy:false};open=o;
  ta.addEventListener('keydown',ev=>{
    if(ev.key==='Shift')shift=true;
    if(ev.key==='Escape'){ev.preventDefault();closeBox();return;}
    if(ev.key==='Enter'&&!ev.shiftKey){if(ev.isComposing||ev.keyCode===229)return;ev.preventDefault();send(o);}
  });
  ta.addEventListener('keyup',ev=>{if(ev.key==='Shift')shift=false;});
  ta.addEventListener('beforeinput',ev=>{if((ev.inputType==='insertLineBreak'||ev.inputType==='insertParagraph')&&!shift){ev.preventDefault();send(o);}});
  ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
  box.querySelector('.go').addEventListener('click',()=>send(o));
  ta.focus();
}
document.addEventListener('click',ev=>{
  if(!document.body.classList.contains('cm-on'))return;
  if(ev.target.closest('.cbox,a,button'))return;
  const line=ev.target.closest('.ln');if(!line)return;
  const sel=window.getSelection();if(sel&&!sel.isCollapsed)return;
  openBox(line);
});
(async()=>{
  try{cm=await window.claude.use('comments');}catch(_){cm=null;}
  if(!cm){hint.textContent='이 화면에선 줄 댓글을 쓸 수 없어. 범위를 지정하는 기존 댓글로 달아 줘.';return;}
  document.body.classList.add('cm-on');
  hint.textContent='줄을 누르면 입력칸이 열려. 쓰고 Enter를 누르면 바로 Claude에게 가. 줄바꿈은 Shift+Enter.';
})();
})();</script>"""


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    # 'changed': 세트를 가리지 않고 --since 뒤로 바뀐 카드만 모은다(26.10.12 소설 명문장처럼 여러 세트에 걸친 작업용).
    only_changed = args[0] == 'changed'
    opt = {args[i]: args[i + 1] for i in range(1, len(args) - 1, 2)}
    src = HTML.read_text(encoding='utf-8')
    data, alts = data_of(src), alts_of(src)
    since = opt.get('--since')
    if only_changed and not since:
        sys.exit('changed 모드는 --since 커밋이 필요하다.')
    lessons = data if only_changed else [next(L for L in data if L['lesson'] == int(args[0]))]
    head = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
    before = {}
    if since:
        old = subprocess.run(['git', '-C', str(ROOT), 'show', f'{since}:vocagoyangfable.html'], capture_output=True, text=True, check=True).stdout
        for OL in data_of(old):
            for ex in OL['exercises']:
                for w in ex['words']:
                    before[(OL['lesson'], w['word'], w.get('si', 1))] = w
    total = changed = 0
    toc, body = [], []
    for L in lessons:
        lesson = L['lesson']
        for ei, x in enumerate(L['exercises'], 1):
            sid = f's{lesson}ex{ei}' if only_changed else f'ex{ei}'
            items = []
            for ci, w in enumerate(x['words'], 1):
                cid = f'{lesson}-{ei:02d}-{ci:02d}'
                tags, olds, state = [], [], ''
                if since:
                    b = before.get((lesson, w['word'], w.get('si', 1)))
                    if b is None:
                        tags.append('<span class="tag">새 카드</span>')
                        state = 'chg'
                    else:
                        diff = [(k, label) for k, label in FIELDS if (b.get(k) or '') != (w.get(k) or '')]
                        if diff:
                            tags.append(f'<span class="tag">바뀜 · {"·".join(label for _, label in diff)}</span>')
                            state = 'chg'
                            for k, label in diff:
                                val = sentence(w, b.get(k)) if k == 'ex' else e(b.get(k) or '(없음)')
                                olds.append(f'<p class="old"><b>전 {label}</b>{val}</p>')
                    changed += state == 'chg'
                if only_changed and state != 'chg':
                    continue
                total += 1
                parts = [f'<div class="head ln"><span class="num">{cid}</span><span class="hw">{e(w["en"])}</span>'
                         f'<span class="ko">{e(w.get("ko", ""))}</span><span class="pos">{e(w.get("pos", ""))} /{e(w.get("ipa", ""))}/</span>{"".join(tags)}</div>',
                         f'<p class="sen ln">{sentence(w)}</p>']
                if w.get('tr'):
                    parts.append(f'<p class="tr ln">{e(w["tr"])}</p>')
                parts.append(f'<p class="c ln">{e(w.get("c") or "") or "<span class=none>(해설 없음)</span>"}</p>')
                if w.get('meow'):
                    parts.append(f'<p class="meow ln"><b>고양</b>{e(w["meow"])}</p>')
                alt = alts.get(f'{w["word"]}/{w.get("si", 1)}')
                if alt:
                    parts.append(f'<p class="alt ln"><b>다른 정답</b>{e(", ".join(alt))}</p>')
                parts += olds
                items.append(f'<li id="c{cid}" data-state="{state}">{"".join(parts)}</li>')
            if not items:
                continue
            label = f'{L["label"]} · Exercise {x["ex"]}' if only_changed else f'Exercise {x["ex"]}'
            toc.append(f'<a href="#{sid}">{(L["label"] + " ") if only_changed else ""}{x["ex"]} · {e(x.get("name", ""))}</a>')
            body.append(f'<section class="ex" id="{sid}"><h2><span class="num">{e(label)}</span>{e(x.get("name", ""))}'
                        f'<span class="count">{len(items)}장</span></h2><ol class="cards">{"".join(items)}</ol></section>')
    L0 = lessons[0]
    title = opt.get('--title') or (f'{L0["label"]} 직검수' if not only_changed else '바뀐 카드 직검수')
    if only_changed:
        intro = f'{e(since)} 뒤로 바뀐 카드 {total}장을 세트·연습 순서대로 모았어. 노란 글자가 학생이 치는 정답이야. 바뀐 칸은 전 내용을 아래에 같이 보여. 의견은 줄을 눌러 바로 달아 줘(카드 번호 세트-연습-카드).'
    else:
        since_note = f' 지난 검수({e(since)}) 뒤 바뀐 카드는 {changed}장이야. 바뀐 칸은 전 내용을 아래에 같이 보여.' if since else ''
        intro = f'FABLE {e(L0["label"])} · {e(L0.get("name", ""))}. {len(L0["exercises"])}연습 {total}장을 게임 순서대로 모았어. 노란 글자가 학생이 치는 정답이야. 의견은 줄을 눌러 바로 달아 줘(카드 번호 세트-연습-카드).{since_note}'
    filt = ('<div class="tools"><div class="seg" role="group" aria-label="보기">'
            '<button type="button" data-f="all" aria-pressed="true">전체</button>'
            '<button type="button" data-f="chg" aria-pressed="false">바뀐 카드만</button></div>'
            f'<span class="count" id="cnt">{total}장</span></div>') if since and not only_changed else ''
    script = ('<script>(function(){const bs=document.querySelectorAll(".seg button"),cnt=document.getElementById("cnt");'
              'bs.forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.f;bs.forEach(x=>x.setAttribute("aria-pressed",x===b));let n=0;'
              'document.querySelectorAll("ol.cards li").forEach(li=>{const show=f==="all"||li.dataset.state==="chg";li.classList.toggle("hide",!show);n+=show;});'
              'document.querySelectorAll("section.ex").forEach(s=>s.classList.toggle("hide",!s.querySelector("li:not(.hide)")));cnt.textContent=n+"장";}));})();</script>') if filt else ''
    page = f'''<title>{e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap">
{STYLE}
<div class="wrap">
<header><h1>{e(title)}</h1><p class="lede">{intro} 기준 {e(head)}, {date.today().isoformat()}.</p></header>
<p class="hint" id="cmhint" role="status">줄 댓글을 준비하는 중이야.</p>
<nav class="toc" aria-label="연습">{"".join(toc)}</nav>
{filt}
{"".join(body)}
</div>
{script}
{COMMENT_JS}
'''
    out = Path(opt.get('--out', '.'))
    out.mkdir(parents=True, exist_ok=True)
    path = out / (opt['--name'] if '--name' in opt else ('fable-changed-review.html' if only_changed else f'fable-{L0["lesson"]:02d}-review.html'))
    path.write_text(page, encoding='utf-8')
    print(json.dumps({'file': str(path), 'title': title, 'cards': total, 'changed': changed}, ensure_ascii=False))


if __name__ == '__main__':
    main()
