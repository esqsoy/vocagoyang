"""사용: apply.py <json> <edits.json>  — (word,si) 키로 필드 덮어쓰기 + 빈칸/어휘 검사"""
import os as _os
P = _os.path.dirname(_os.path.abspath(__file__))          # pipeline/
REPO = _os.path.dirname(P)                                  # 레포 루트
HTMLPATH = _os.path.join(REPO, 'vocagoyangfable.html')
import json,re,sys
sys.argv=[sys.argv[0]]+sys.argv[1:]
p,ep=sys.argv[1],sys.argv[2]
o=json.load(open(p)); exs=o['exercises'] if isinstance(o,dict) else o
E={tuple(json.loads(k)) if k.startswith('[') else (k.rsplit('/',1)[0],int(k.rsplit('/',1)[1])):v for k,v in json.load(open(ep)).items()}
src=open(f'{P}/audit.py').read().split('def audit(')[0]; exec(src)
hit=set()
for e in exs:
    for w in e['words']:
        k=(w['word'],w['si'])
        if k in E:
            for f,v in E[k].items(): w[f]=v
            hit.add(k)
            assert '{{BLANK}}' in w['ex'],k
            bad=[t for t in re.findall(r"[A-Za-z']+",w['ex'].replace('{{BLANK}}','')) if not tok_ok(t) and t not in ('d','s','ed','es','ing')]
            if bad: print('VOCAB',k,bad)
            if len(w.get('c',''))>74: print('C>74',k,len(w['c']))
miss=set(E)-hit
print('edited',len(hit),'/',len(E),'missing',miss)
json.dump(o,open(p,'w'),ensure_ascii=False,indent=0)
