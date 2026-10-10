#!/usr/bin/env python3
"""새 카드 초안 검사(26.10.10 Oxford 보강 때 만듦). 사용: python3 pipeline/oxford/cardcheck.py 초안.json
초안 형식: {"exercises":[{"set":N,"name":"...","words":[카드...]}]}. 데이터에 이미 넣은 카드는 !!중복으로 잡힌다.
검사: 표제어 밖 단어(!!어휘), 뒤 세트 단어 앞당김(!!앞당김, 1개까지 허용·2개 이상 XX),
형식(ko ①, {{BLANK}}, tr, c ≤72자, ipa 빗금 없음, si/sn), 기존 예문과 같은 문장(!!중복),
폰 화면 줄 수(390px 문장 3줄·문제 4줄, 360px 참고)."""
import json, re, sys, io, contextlib, subprocess, os, importlib.util
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
HERE = os.path.dirname(os.path.abspath(__file__))
# exaudit의 허용 판정(tok_ok)
src = open(f'{ROOT}/pipeline/exaudit.py', encoding='utf-8').read()
src = src[:src.index('bad=collections')]
g = {'__file__': f'{ROOT}/pipeline/exaudit.py', '__name__': 'x'}
with contextlib.redirect_stdout(io.StringIO()):
    exec(src, g)
# ordercheck의 처음 세트·후보 규칙
spec = importlib.util.spec_from_file_location('oc', f'{ROOT}/pipeline/ordercheck.py')
oc = importlib.util.module_from_spec(spec); spec.loader.exec_module(oc)
first, cards = oc.load()
bw = json.load(open(f'{ROOT}/pipeline/base-words.json'))
base = set(bw['words']) | set(bw.get('loanwords', []))
known_always = {k for k, s in first.items() if s in oc.BASE_SETS} | base | oc.NUMS
norm = lambda t: re.sub(r'\W+', ' ', t.lower()).strip()
existing = {norm(c['text']) for c in cards}

draft = json.load(open(sys.argv[1]))
items = []
for ex in draft['exercises']:
    for w in ex['words']:
        items.append((ex['set'], ex.get('name', ''), w))
seen = {}
rows = []
for s, name, w in items:
    probs = []
    e = w.get('ex', '')
    if '{{BLANK}}' not in e: probs.append('빈칸 없음')
    if not re.match(r'^[①-⑳] ', w.get('ko', '')): probs.append('ko 형식(① 뜻)')
    if not w.get('tr'): probs.append('tr 없음')
    c = w.get('c', '')
    if len(c) > 72: probs.append(f'해설 {len(c)}자')
    ipa = w.get('ipa', '')
    if not ipa or '/' in ipa or '[' in ipa: probs.append('ipa 형식')
    if w.get('meow') and ('고양' not in w['meow'] or len(w['meow']) > 48): probs.append('meow 형식')
    for k in ('en', 'ko', 'ex', 'tr', 'c', 'ipa', 'pos', 'word', 'si', 'sn'):
        if k not in w: probs.append('키 없음:' + k)
    if w.get('en') != w.get('word'): probs.append('en≠word')
    n = norm(e.replace('{{BLANK}}', w.get('word', '')))
    if norm(e) in existing or n in existing or norm(e) in seen: probs.append('!!중복')
    seen[norm(e)] = 1
    body = re.sub(r"[A-Za-z']*\{\{BLANK\}\}[a-z]*(?:'[a-z]+|n't)?", ' ', e)
    body = re.sub(r"\b\d+[A-Za-z]*", ' ', body)
    out = sorted({t for t in re.findall(r"[A-Za-z][A-Za-z']*", body) if len(t) > 1 and not t[0].isupper() and not g['tok_ok'](t)})
    if out: probs.append('!!어휘:' + ','.join(out))
    fwd = oc.check(first, [dict(set=s, ex=0, i=0, name=name, word=w.get('word'), si=w.get('si'), text=e)], base)[0]['fwd']
    fwd = [f for f in fwd if f[0] != (w.get('word') or '').lower()]
    if fwd: probs.append(('!!앞당김2+:' if len(fwd) > 1 else '앞당김1:') + ','.join(f'{a}({b})' for a, b in fwd))
    rows.append([s, w, probs])
# 줄 수
tmp = os.path.join(HERE, f'_measure-{os.getpid()}.json')
json.dump([{'word': w.get('word', ''), 'ex': w.get('ex', '')} for _, w, _ in rows], open(tmp, 'w'))
env = dict(os.environ, NODE_PATH='/opt/node22/lib/node_modules')
r = subprocess.run(['node', os.path.join(HERE, 'measure-lines.cjs'), tmp], capture_output=True, text=True, env=env)
os.remove(tmp)  # 임시 측정 파일은 남기지 않는다
lines = json.loads(r.stdout or '[]') if r.returncode == 0 else None
if lines is None: print('줄 측정 실패:', r.stderr[-500:])
bad = 0
for i, (s, w, probs) in enumerate(rows):
    if lines:
        a, b = lines[i]
        if a['t'] > 3 or a['q'] > 4: probs.append(f"!!길이 390:문장{a['t']}/화면{a['q']}")
        lens = f"390:{a['t']}/{a['q']} 360:{b['t']}/{b['q']}"
    else:
        lens = '?'
    hard = [p for p in probs if p.startswith('!!') or not p.startswith('앞당김1')]
    ok = not hard
    bad += not ok
    print(f"{'OK' if ok else 'XX'} {s:2d} {w.get('word','?')}({w.get('si')}/{w.get('sn')}) {lens} | {w.get('ex','')} {'  << ' + ' / '.join(probs) if probs else ''}")
print(f'카드 {len(rows)}장, 고칠 것 {bad}장')
