#!/usr/bin/env python3
"""이음새 감사(헌장 제5조): LDV ↔ Fable ↔ 마더텅 ↔ EBS 표제어 대조.
사용: python3 seam.py [--list 마더텅only|ebsonly|both]  — 레포의 세 HTML에서 DATA를 뽑아 겹침·공백 매트릭스를 낸다."""
import re, json, sys, collections
REPO = '/home/claude/vocagoyang'
def words_of(path):
    h = open(path, encoding='utf-8').read()
    m = re.search(r'const DATA = (\[.*?\]);\n', h, re.S)
    data = json.loads(m.group(1))
    ws = collections.OrderedDict()
    for L in data:
        for e in L['exercises']:
            for w in e['words']:
                k = w.get('word') or w['en']
                k = k.strip().lower()
                ws.setdefault(k, L.get('lesson'))
    return ws
fable = words_of(f'{REPO}/vocagoyangfable.html')
mt = words_of(f'{REPO}/vocagoyangksat2027.html')
ebs = words_of(f'{REPO}/vocagoyangebs2027.html')
ldv = set(json.load(open('/home/claude/hoe-prod/allowed.json'))['ldv'])
F, M, E = set(fable), set(mt), set(ebs)
def n(s): return f"{len(s):,}"
print("=== 표제어 수")
print(f"LDV {n(ldv)} · Fable {n(F)} · 마더텅 {n(M)} · EBS {n(E)} · 세 앱 합집합 {n(F|M|E)} · Fable∪마더텅 {n(F|M)}")
print("=== 겹침")
print(f"LDV−Fable(미수록) {n(ldv-F)} · Fable∩마더텅 {n(F&M)} · Fable∩EBS {n(F&E)} · 마더텅∩EBS {n(M&E)} · 셋 다 {n(F&M&E)}")
print("=== 순기여(다른 두 앱에 없는 것)")
print(f"Fable만 {n(F-M-E)} · 마더텅만 {n(M-F-E)} · EBS만 {n(E-F-M)}")
print("=== 마더텅 표제어 중 파생 원형이 Fable에 있는 것(예: environmental ← environment)")
import itertools
SUF = ["ly","ness","ment","tion","ation","al","ic","ical","ive","ous","ful","less","er","or","ist","ism","ity","ize","ise","able","ible","ance","ence","ent","ant","ure","ship","hood","ish","ward","wise","en","ify","y","ery","age","dom","ee","ess"]
def stem_hits(w):
    for s in sorted(SUF, key=len, reverse=True):
        if w.endswith(s) and len(w) - len(s) >= 3:
            b = w[:-len(s)]
            for c in (b, b+'e', b[:-1] if len(b)>3 and b[-1]==b[-2] else None, b[:-1]+'y' if b.endswith('i') else None):
                if c and c in F: return c
    return None
mt_only = M - F
derivable = {w: stem_hits(w) for w in mt_only if stem_hits(w)}
print(f"마더텅만 {n(mt_only)} 중 Fable 원형에서 파생 가능 {n(derivable)} (예: " + ", ".join(f"{k}←{v}" for k, v in list(derivable.items())[:8]) + ")")
if '--list' in sys.argv:
    which = sys.argv[sys.argv.index('--list')+1]
    s = {'마더텅only': M-F-E, 'ebsonly': E-F-M, 'both': M&E-F}[which]
    print("\n".join(sorted(s)))
