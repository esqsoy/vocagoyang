# 세트 카드를 읽기 좋게 뽑는다(읽기량·한도 넘음 표시). 사용: python3 dump.py 세트번호
import json,re,sys
src=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))),'vocagoyangfable.html'),encoding='utf-8').read()
D=json.loads(re.search(r'^const DATA = (\[.*\]);\s*$',src,re.M).group(1))
FUNC_POS={'pron.','det.','conj.','aux.','prep.','prep.phr.','inf. marker'}
FUNC_WORDS={'be','do','have','not','yes','no','there','here','what','who','where','when','why','how','which'}
def f(w): return w.get('pos') in FUNC_POS or w.get('word') in FUNC_WORDS
def t(w): return 0.25*len((w.get('ex') or '').split())+0.11*(len(w.get('tr') or '')+len(w.get('c') or ''))+0.055*len(w.get('meow') or '')
n=int(sys.argv[1]); L=next(L for L in D if L['lesson']==n)
for ei,e in enumerate(L['exercises'],1):
    print(f"=== 연습 {ei} {e['name']} ({len(e['words'])})")
    for ci,w in enumerate(e['words'],1):
        cap=13 if f(w) else 12; x=t(w)
        print(f"{n}-{ei:02d}-{ci:02d} {w['word']} {w['si']}/{w['sn']} [{w.get('pos')}] {w['ko']}  ({x:.1f}s{' OVER' if x>cap else ''})")
        print(f"   ex: {w.get('ex')}\n   tr: {w.get('tr')}")
        if w.get('c'): print(f"   c : {w.get('c')}")
        if w.get('meow'): print(f"   m : {w.get('meow')}")
