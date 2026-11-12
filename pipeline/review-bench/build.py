"""시험지 재료 모으기: 지난 검수에서 진짜 결함으로 확인돼 고친 카드를 '고치기 전' 모양으로 되돌린다.
사용: python3 pipeline/review-bench/build.py <vocagoyangfable.html> <출력 폴더>
26.11.12에는 90a2b68의 vocagoyangfable.html로 만들었다(packet.md·answer-key.json). 지금 데이터로 다시 돌리면 그 뒤에 고친 카드만큼 달라진다.
A: 10-08 리뷰의 검증 통과 결함(review-findings.json survived) + 필드 수정(content-fixes-edits.json). 지금 값이 '고친 값'과 같을 때만 되돌린다.
B: 뒤 원장(DATA 경로 단위). 지금 값이 '새 값'과 같을 때만 되돌린다.
고른 52장(A 17 + B 23 + 그대로인 카드 12)과 섞는 순서는 make-packet 부분의 seed 20261112로 정했다."""
import json,random,collections,sys,copy,re,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','claude-review-20261008')+'/'
D=json.loads(re.search(r'^const DATA = (\[.*\]);\s*$',open(sys.argv[1],encoding='utf-8').read(),re.M).group(1)); S=sys.argv[2]
cards=[(li,ei,wi,w) for li,L in enumerate(D) for ei,e in enumerate(L['exercises']) for wi,w in enumerate(e['words'])]
def get(path):
    x=D
    for p in path: x=x[p]
    return x
picked=[];used=set()
# A: 10-08 verified findings + field edits
F=json.load(open(R+'review-findings.json'))['survived']
E=json.load(open(R+'content-fixes-edits.json'))
ed=collections.defaultdict(list)
for e in E: ed[e['word']].append(e)
for f in F:
    es=ed.get(f['word'],[])
    if not es: continue
    hits=[c for c in cards if c[3]['en']==f['word'] and all(c[3].get(e['field'],'')==e['new'] for e in es)]
    if len(hits)!=1: continue
    li,ei,wi,w=hits[0]; old=copy.deepcopy(w)
    for e in es: old[e['field']]=e['old']
    picked.append({'src':'A:'+f['id'],'cat':f['category'],'sev':f.get('finalSeverity',f['severity']),'problem':f['problem'],'fix':[{k:e[k] for k in ('field','old','new')} for e in es],'loc':[li,ei,wi],'card':old})
# B: later ledgers (path-based, DATA snapshot)
for n in ['astra-content-20261015','astra-review-20261013','fable-review-20261013','codex-review-20261011','c-example-20261013','ishmael-20261024','like-song-20261102']:
    d=json.load(open(R+n+'.json')); ch=d['snapshots']['DATA']['changes']
    by=collections.defaultdict(list)
    for c in ch:
        p=c['path']
        if len(p)==6 and p[1]=='exercises' and p[3]=='words': by[tuple(p[:5])].append(c)
    for k,cs in by.items():
        try: w=get(list(k))
        except Exception: continue
        if not all(w.get(c['path'][5])==c.get('new') for c in cs if c.get('newExists')): continue
        old=copy.deepcopy(w)
        for c in cs:
            if c.get('oldExists'): old[c['path'][5]]=c['old']
            else: old.pop(c['path'][5],None)
        picked.append({'src':'B:'+n,'cat':'?','sev':'?','problem':d['summary'][:200],'fix':[{'field':c['path'][5],'old':c.get('old'),'new':c.get('new')} for c in cs],'loc':[k[0],k[2],k[4]],'card':old})
cnt=collections.Counter(p['src'].split(':')[0]+':'+p['cat'] if p['src'].startswith('A') else p['src'] for p in picked)
print(len(picked),cnt)
os.makedirs(S,exist_ok=True); json.dump(picked,open(S+'/all-seeded.json','w'),ensure_ascii=False,indent=1)
