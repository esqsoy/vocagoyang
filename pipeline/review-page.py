#!/usr/bin/env python3
"""세트 하나를 영신 직검수 페이지(claude.ai 아티팩트용 HTML)로 뽑는다.

26.10.11 영신: 직검수는 고치는 게 아니라 의견을 내는 것이라, 카드 옆에 '+'로 댓글을 다는 읽기 페이지가 편하다.
사용: python3 pipeline/review-page.py 세트번호 [--since 커밋] [--out 폴더]
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
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>'''


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    lesson = int(args[0])
    opt = {args[i]: args[i + 1] for i in range(1, len(args) - 1, 2)}
    src = HTML.read_text(encoding='utf-8')
    data, alts = data_of(src), alts_of(src)
    L = next(L for L in data if L['lesson'] == lesson)
    head = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
    since = opt.get('--since')
    before = {}
    if since:
        old = subprocess.run(['git', '-C', str(ROOT), 'show', f'{since}:vocagoyangfable.html'], capture_output=True, text=True, check=True).stdout
        for OL in data_of(old):
            if OL['lesson'] == lesson:
                for ex in OL['exercises']:
                    for w in ex['words']:
                        before[(w['word'], w.get('si', 1))] = w
    total = sum(len(x['words']) for x in L['exercises'])
    changed = 0
    toc, body = [], []
    for ei, x in enumerate(L['exercises'], 1):
        sid = f'ex{ei}'
        toc.append(f'<a href="#{sid}">{x["ex"]} · {e(x.get("name", ""))}</a>')
        items = []
        for ci, w in enumerate(x['words'], 1):
            cid = f'{lesson}-{ei:02d}-{ci:02d}'
            tags, olds, state = [], [], ''
            if since:
                b = before.get((w['word'], w.get('si', 1)))
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
            parts = [f'<div class="head"><span class="num">{cid}</span><span class="hw">{e(w["en"])}</span>'
                     f'<span class="ko">{e(w.get("ko", ""))}</span><span class="pos">{e(w.get("pos", ""))} /{e(w.get("ipa", ""))}/</span>{"".join(tags)}</div>',
                     f'<p class="sen">{sentence(w)}</p>']
            if w.get('tr'):
                parts.append(f'<p class="tr">{e(w["tr"])}</p>')
            parts.append(f'<p class="c">{e(w.get("c") or "") or "<span class=none>(해설 없음)</span>"}</p>')
            if w.get('meow'):
                parts.append(f'<p class="meow"><b>고양</b>{e(w["meow"])}</p>')
            alt = alts.get(f'{w["word"]}/{w.get("si", 1)}')
            if alt:
                parts.append(f'<p class="alt"><b>다른 정답</b>{e(", ".join(alt))}</p>')
            parts += olds
            items.append(f'<li id="c{cid}" data-state="{state}">{"".join(parts)}</li>')
        body.append(f'<section class="ex" id="{sid}"><h2><span class="num">Exercise {x["ex"]}</span>{e(x.get("name", ""))}'
                    f'<span class="count">{len(x["words"])}장</span></h2><ol class="cards">{"".join(items)}</ol></section>')
    title = f'{L["label"]} 직검수'
    since_note = f' 지난 검수({e(since)}) 뒤 바뀐 카드는 {changed}장이야. 바뀐 칸은 전 내용을 아래에 같이 보여.' if since else ''
    filt = ('<div class="tools"><div class="seg" role="group" aria-label="보기">'
            '<button type="button" data-f="all" aria-pressed="true">전체</button>'
            '<button type="button" data-f="chg" aria-pressed="false">바뀐 카드만</button></div>'
            f'<span class="count" id="cnt">{total}장</span></div>') if since else ''
    script = ('<script>(function(){const bs=document.querySelectorAll(".seg button"),cnt=document.getElementById("cnt");'
              'bs.forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.f;bs.forEach(x=>x.setAttribute("aria-pressed",x===b));let n=0;'
              'document.querySelectorAll("ol.cards li").forEach(li=>{const show=f==="all"||li.dataset.state==="chg";li.classList.toggle("hide",!show);n+=show;});'
              'document.querySelectorAll("section.ex").forEach(s=>s.classList.toggle("hide",!s.querySelector("li:not(.hide)")));cnt.textContent=n+"장";}));})();</script>') if since else ''
    page = f'''<title>{e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&display=swap">
{STYLE}
<div class="wrap">
<header><h1>{e(title)}</h1><p class="lede">FABLE {e(L["label"])} · {e(L.get("name", ""))}. {len(L["exercises"])}연습 {total}장을 게임 순서대로 모았어. 노란 글자가 학생이 치는 정답이야. 의견은 카드에 바로 댓글로 달아 줘(카드 번호 세트-연습-카드).{since_note} 기준 {e(head)}, {date.today().isoformat()}.</p></header>
<nav class="toc" aria-label="연습">{"".join(toc)}</nav>
{filt}
{"".join(body)}
</div>
{script}
'''
    out = Path(opt.get('--out', '.'))
    out.mkdir(parents=True, exist_ok=True)
    path = out / f'fable-{lesson:02d}-review.html'
    path.write_text(page, encoding='utf-8')
    print(json.dumps({'file': str(path), 'title': title, 'exercises': len(L['exercises']), 'cards': total, 'changed': changed}, ensure_ascii=False))


if __name__ == '__main__':
    main()
