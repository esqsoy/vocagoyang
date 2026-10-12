# 세트 작업 제안 파일(E 목록)을 저작 원본에 넣는다. 사용: python3 apply.py 제안.py 기록.json
# 제안(proposals.py)을 작업 트리 원본에 넣는다. 카드는 화면 세트·단어·뜻 번호로 찾고, 원본은 같은 내용의 카드 하나로 찾는다.
import json,glob,re,sys,collections,importlib.util
import os
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))+'/'
spec=importlib.util.spec_from_file_location('p',sys.argv[1]);P=importlib.util.module_from_spec(spec);spec.loader.exec_module(P)
D=json.loads(re.search(r'^const DATA = (\[.*\]);\s*$',open(R+'vocagoyangfable.html',encoding='utf-8').read(),re.M).group(1))
files=sorted(glob.glob(R+'pipeline/out/lesson0[0-4].json'))+sorted(glob.glob(R+'pipeline/out/set*.json'),key=lambda f:int(re.search(r'set(\d+)',f).group(1)))
files=[f for f in files if int(re.search(r'(\d+)\.json',f).group(1))<46]
data={f:json.load(open(f,encoding='utf-8')) for f in files}
morph=json.load(open(R+'pipeline/morphology.json',encoding='utf-8'))
src=collections.defaultdict(list)
for f,x in data.items():
    for e in (x['exercises'] if isinstance(x,dict) else x):
        for w in e['words']: src[(w.get('word') or w['en'],w.get('si',1))].append((f,w))
for u in morph['units']:
    for w in u['cards']: src[(w['word'],None)].append(('morphology',w))
disp={}
for L in D:
    for e in L['exercises']:
        for w in e['words']: disp.setdefault((L['lesson'],w['word'],w.get('si',1)),w)
log=[];touched=set()
for p in P.E:
    cur=disp[(p['set'],p['word'],p['si'])]
    cands=src.get((p['word'],p['si'])) or []
    if p['set']>=47: cands=src[(p['word'],None)]
    m=[(f,w) for f,w in cands if all((w.get(k) or '')==(cur.get(k) or '') for k in ('ex','tr','c','ko'))]
    assert len(m)==1,(p['word'],p['si'],len(m))
    f,w=m[0]
    before={k:w.get(k) for k in p['fields']}
    for k,v in p['fields'].items():
        assert w.get(k)!=v,(p['word'],k); (w.pop(k,None) if v is None else w.__setitem__(k,v))
    touched.add(f);log.append(dict(set=p['set'],word=p['word'],si=p['si'],tag=p['tag'],why=p['why'],source=f.replace(R,'') if f!='morphology' else 'pipeline/morphology.json',before=before,after=p['fields'],ko=cur.get('ko'),ex=cur.get('ex')))
for f in touched:
    if f=='morphology': open(R+'pipeline/morphology.json','w',encoding='utf-8').write(json.dumps(morph,ensure_ascii=False,indent=2)+'\n')
    else: open(f,'w',encoding='utf-8').write(json.dumps(data[f],ensure_ascii=False,indent=2)+'\n')
json.dump(log,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
long=[(l['word'],len(l['after']['c'])) for l in log if (l['after'].get('c') or '') and len(l['after']['c'])>72]
print(len(log),'edits;',len(touched),'files; c>72:',long)
