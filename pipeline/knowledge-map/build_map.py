#!/usr/bin/env python3
"""지식 지도 초안(nodes.py)을 사람이 읽는 MAP.md로 만든다. 단어의 세트 위치는 지금 FABLE DATA에서 읽는다.
사용: python3 pipeline/knowledge-map/build_map.py"""
import json,re,os,sys,collections
P=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(os.path.dirname(P))
sys.path.insert(0,P);from nodes import CHAPTERS
h=open(os.path.join(ROOT,'vocagoyangfable.html'),encoding='utf-8').read()
D=json.loads(re.search(r'^const DATA = (\[.*\]);',h,re.M).group(1))
idx=collections.defaultdict(list)
for L in D:
    if L['lesson']==46 or L['lesson']>=49: continue
    for e in L['exercises']:
        for w in e['words']: idx[(w.get('word') or w.get('en')).lower()].append((L['lesson'],w['ko'],w['ex']))
sv={}
sp=os.path.join(os.path.dirname(P),'knowledge-survey-20261008','judgments.jsonl')
for l in open(sp,encoding='utf-8'):
    o=json.loads(l); sv.setdefault(o['word'].lower(),[]).append(o)
out=[];used=collections.Counter();missing=[];flags=collections.Counter();nodes=0;sets_by_ch=[]
for ch,ns in CHAPTERS:
    out.append(f'\n## {ch}\n');chsets=[]
    for nid,title,core,words in ns:
        nodes+=1
        out.append(f'### {nid} {title}\n\n{core}\n')
        rows=[]
        for w,angle,fl in words:
            base,_,want=w.partition('@');ents=idx.get(base.lower())
            if not ents: missing.append(w);continue
            s=[e for e in ents if not want or e[0]==int(want)] or ents
            st=s[0][0];used[base.lower()]+=1;flags[fl]+=1;chsets.append(st)
            rows.append((st,f'- {fl} **{base}** ({st}세트) — {angle}'))
        out+= [r for _,r in sorted(rows)]
        out.append('')
    sets_by_ch.append((ch,chsets))
# 조사에서 R인데 지도에 안 걸린 단어
unassigned=sorted({o['word'] for ws in sv.values() for o in ws if o['v']=='R' and o['word'].lower() not in used})
head=[ '# 지식 지도 초안 · 2026-10-08 (Claude 작성, 영신 검토 전)\n',
 '노드를 먼저 정하고 단어를 건다. 노드마다 다른 단어로 2~4번, 앞 세트에서는 "언제·무엇", 뒤 세트에서는 "왜·무슨 뜻"을 만나게 한다(나선형).',
 '표시: ● 지금 예문이 이미 이 노드를 담음 / ○ 전수 조사(`pipeline/knowledge-survey-20261008`)의 교체 권장 / ◇ 조사 밖에서 새로 찾은 후보. 단어 옆 숫자는 그 카드가 처음 나오는 세트다.',
 '"하나만"이라고 적힌 쌍은 같은 사실이 겹치는 후보다. 묶음 작성 때 하나를 고르고 다른 하나는 다른 각도로 쓰거나 지금 예문을 둔다.\n',
 f'- 노드 {nodes}개, 단어 {sum(flags.values())}개(● {flags["●"]} · ○ {flags["○"]} · ◇ {flags["◇"]})',
 '- 장별 세트 분포(나선형 확인): '+' / '.join(f'{c.split(". ")[1]} {min(s)}~{max(s)}세트(중앙 {sorted(s)[len(s)//2]})' for c,s in sets_by_ch if s),
 f'- 조사에서 교체 권장이었지만 지도에 걸지 않은 단어 {len(unassigned)}개(잡학·겹침·축이 약함): '+', '.join(unassigned),
 f'- 표제어에 없는 단어(지도에서 빠짐): {", ".join(missing) or "없음"}' ]
open(os.path.join(P,'MAP.md'),'w',encoding='utf-8').write('\n'.join(head)+'\n'+'\n'.join(out)+'\n')
print('\n'.join(head))
dup=[w for w,n in used.items() if n>1]
if dup: print('두 노드에 걸린 단어:',dup)
