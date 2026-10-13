#!/usr/bin/env python3
"""새 카드 초안 검사(26.10.10 Oxford 보강 때 만듦). 사용: python3 pipeline/oxford/cardcheck.py 초안.json
초안 형식: {"exercises":[{"set":N,"name":"...","words":[카드...]}]}. 데이터에 이미 넣은 카드는 !!중복으로 잡힌다.
검사: 표제어 밖 단어(!!어휘), 뒤 세트 단어 앞당김(!!앞당김, 1개까지 허용·2개 이상 XX),
형식(ko ①, {{BLANK}}, tr, c ≤72자, ipa 빗금 없음, si/sn), 기존 예문과 같은 문장(!!중복),
읽기량(12초, 기능어 13초)·빈칸 어미(26.10.13 추가),
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

FUNC_POS = {'pron.', 'det.', 'conj.', 'aux.', 'prep.', 'prep.phr.', 'inf. marker'}
VES = set('life knife wife leaf loaf half shelf wolf thief calf self sheaf elf'.split())
IRR_PLURAL = set('man woman child foot tooth mouse goose person ox sheep deer fish series species'.split())
def suffix_problem(t, ex):
    """deepcheck A7과 같은 규칙: 화면은 {{BLANK}} 뒤 어미를 정답에 그대로 붙인다."""
    m = re.search(r'\{\{BLANK\}\}([a-z]+)', ex)
    if not m or len(t) < 2: return ''
    sf = m.group(1)
    if t[-1] == 'y' and t[-2] not in 'aeiou' and sf[0] in 'se': return f'y+{sf}'
    if t[-1] == 'e' and sf[0] in 'ei': return f'e+{sf}'
    if re.search(r'(s|x|z|ch|sh)$', t) and sf == 's': return '-es 필요'
    if sf == 's' and t in VES: return 'f/fe→ves'
    if sf in ('s', 'es') and t in IRR_PLURAL: return '불규칙 복수'
    if t.endswith('ie') and sf == 'ing': return 'ie+ing'
    if sf in ('d', 'r', 'st') and t[-1] != 'e': return f'e 없는 말+{sf}'
    return ''

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
    # 26.10.13 Oxford 5000 보강부터: 읽기량(PRINCIPLES 2-2, deepcheck A8)과 빈칸 어미(deepcheck A7)도 본다.
    load = 0.25 * len(e.split()) + 0.11 * (len(w.get('tr') or '') + len(c)) + 0.055 * len(w.get('meow') or '')
    if load > (13 if w.get('pos') in FUNC_POS else 12): probs.append(f'읽기량 {load:.1f}초')
    a7 = suffix_problem((w.get('en') or '').lower(), e)
    if a7: probs.append('빈칸 어미:' + a7)
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
# 임시 측정 파일은 저장소 밖(시스템 임시 폴더)에 쓴다. 여러 에이전트가 동시에 돌려도 저장소에 흔적이 남지 않게(26.10.13).
import tempfile
fd, tmp = tempfile.mkstemp(prefix='cardcheck-', suffix='.json'); os.close(fd)
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
