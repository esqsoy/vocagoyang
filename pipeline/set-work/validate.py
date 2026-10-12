# 세트 작업 제안 파일(setN.py, E 목록)을 원본에 넣기 전에 검사한다. 저장소를 바꾸지 않는다.
# 사용: python3 validate.py 제안.py [--quiet]
# 카드마다: 바뀐 칸, 새 읽기량(한도), 앞당김(순서 통제), 표제어 밖 단어, 해설 길이, 빈칸 형식, 고양이 예문의 대사 여부를 본다.
import json, re, sys, importlib.util, collections
import os
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
sys.path.insert(0, R + 'pipeline')
import ordercheck as oc
src = open(R + 'pipeline/exaudit.py', encoding='utf-8').read()
cut = src.index('bad=collections.defaultdict(list)')
ns = {'__file__': R + 'pipeline/exaudit.py'}
exec(compile(src[:cut], 'exaudit', 'exec'), ns)
tok_ok = ns['tok_ok']
first, _ = oc.load()
bw = json.load(open(R + 'pipeline/base-words.json', encoding='utf-8'))
base = set(bw['words']) | set(bw.get('loanwords', []))
D = json.loads(re.search(r'^const DATA = (\[.*\]);\s*$', open(R + 'vocagoyangfable.html', encoding='utf-8').read(), re.M).group(1))
disp = {}
allex = collections.Counter()
for L in D:
    for e in L['exercises']:
        for w in e['words']:
            disp.setdefault((L['lesson'], w['word'], w.get('si', 1)), w)
            if L['lesson'] <= 45 and w.get('ex'):
                allex[re.sub(r'\{\{BLANK\}\}\w*', '_', w['ex']).lower()] += 1
FUNC_POS = {'pron.', 'det.', 'conj.', 'aux.', 'prep.', 'prep.phr.', 'inf. marker'}
FUNC_WORDS = {'be', 'do', 'have', 'not', 'yes', 'no', 'there', 'here', 'what', 'who', 'where', 'when', 'why', 'how', 'which'}
isf = lambda w: w.get('pos') in FUNC_POS or w.get('word') in FUNC_WORDS
load = lambda w: 0.25 * len((w.get('ex') or '').split()) + 0.11 * (len(w.get('tr') or '') + len(w.get('c') or '')) + 0.055 * len(w.get('meow') or '')
spec = importlib.util.spec_from_file_location('p', sys.argv[1]); P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)
quiet = '--quiet' in sys.argv
problems = 0
seen = set()
for p in P.E:
    key = (p['set'], p['word'], p['si'])
    flags = []
    if key in seen: flags.append('같은 카드 두 번')
    seen.add(key)
    cur = disp.get(key)
    if not cur:
        print(f'!! 카드 없음 {key}'); problems += 1; continue
    new = dict(cur)
    for k, v in p['fields'].items():
        if v is None: new.pop(k, None)
        else: new[k] = v
        if cur.get(k) == v: flags.append(f'{k} 그대로')
    ex = new.get('ex') or ''
    if ex and '{{BLANK}}' not in ex: flags.append('빈칸 없음')
    if ex.count('{{BLANK}}') > 1: flags.append('빈칸 둘')
    x = load(new); cap = 13 if isf(new) else 12
    if x > cap: flags.append(f'읽기량 {x:.1f}>{cap}')
    fwd = oc.check(first, [dict(set=p['set'], ex=0, i=0, name='', word=p['word'], si=p['si'], text=ex)], base)[0]['fwd'] if ex else []
    if len(fwd) >= 2: flags.append(f'앞당김 {fwd}')
    body = re.sub(r"[A-Za-z']*\{\{BLANK\}\}[a-z]*(?:'[a-z]+|n't)?", ' ', ex)
    body = re.sub(r"\b\d+[A-Za-z]*", ' ', body)
    out = sorted({t for t in re.findall(r"[A-Za-z][A-Za-z']*", body) if len(t) > 1 and not t[0].isupper() and not tok_ok(t)})
    if out: flags.append(f'표제어 밖 {out}')
    if len(new.get('c') or '') > 72: flags.append(f"해설 {len(new['c'])}자")
    if re.search(r'\b(cat|cats|kitten|kitty)\b', ex, re.I) and not new.get('meow'): flags.append('고양이 예문 대사 없음')
    if 'ex' in p['fields'] and allex[re.sub(r'\{\{BLANK\}\}\w*', '_', ex).lower()] > 0 and ex != cur.get('ex'): flags.append('다른 카드와 같은 문장')
    if re.search(r'[가-힣]', ex): flags.append('예문에 한글')
    problems += bool(flags)
    if quiet and not flags: continue
    print(f"{p['set']}-{p['word']}({p['si']}) [{p['tag']}] {x:.1f}s {'· '.join(flags) if flags else 'OK'}")
    for k in p['fields']:
        print(f"   {k}: {cur.get(k)!r}\n   →  {new.get(k)!r}")
print(f'\n제안 {len(P.E)}개, 걸린 것 {problems}개')
