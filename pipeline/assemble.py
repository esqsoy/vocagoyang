#!/usr/bin/env python3
import os as _os
P = _os.path.dirname(_os.path.abspath(__file__))          # pipeline/
REPO = _os.path.dirname(P)                                  # 레포 루트
HTMLPATH = _os.path.join(REPO, 'vocagoyangfable.html')
import json,re
HTML=HTMLPATH
src=open(HTML,encoding='utf-8').read()
data=[]
import os
if _os.path.exists(f'{P}/out/lesson00.json'): data.append(json.load(open(f'{P}/out/lesson00.json')))
for i in range(1,5): data.append(json.load(open(f'{P}/out/lesson{i:02d}.json')))
for n in range(5,23):
    exs=json.load(open(f'{P}/out/set{n:02d}.json'))
    S=(n-5)*100+401; E=min((n-4)*100+400,2183)
    data.append({"lesson":n,"label":f"{n}세트","name":f"{S}~{E}","exercises":exs})
for n in range(23,46):
    exs=json.load(open(f'{P}/out/set{n}.json'))
    S=exs[0]['name'].split('~')[0]; E=exs[-1]['name'].split('~')[1]
    data.append({"lesson":n,"label":f"{n}세트","name":f"{S}~{E}","exercises":exs})
MORPH={46:"접사 — 파생을 읽는 규칙",47:"어근 — 라틴·그리스 렌즈 + 사촌 쌍"}
for n in (46,47):
    if _os.path.exists(f'{P}/out/set{n}.json'):
        data.append({"lesson":n,"label":f"{n}세트","name":MORPH[n],"exercises":json.load(open(f'{P}/out/set{n}.json'))})
blob=json.dumps(data,ensure_ascii=False,separators=(',',':'))
m=re.search(r'const DATA = (\[.*?\]);\n',src,re.S)
new=src[:m.start(1)]+blob+src[m.end(1):]
open(HTML,'w',encoding='utf-8').write(new)
ncards=sum(len(w) for L in data for e in L['exercises'] for w in [e['words']])
words=set(w['word'] for L in data for e in L['exercises'] for w in e['words'])
print('lessons',len(data),'cards',ncards,'words',len(words),'bytes',len(new))
