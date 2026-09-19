#!/usr/bin/env python3
"""HTML의 DATA 및 READING_CORE/MORPHOLOGY/CONNECTIONS → 카드와 편집 원본 복원.
사용: python3 disassemble.py [html경로]   (기본: 레포의 vocagoyangfable.html)
새 작업 공간에서 GitHub의 HTML 하나만 있을 때 이걸로 파이프라인 원본을 되살린다.
assemble.py의 역연산 — 복원 후 assemble.py를 돌리면 같은 HTML이 나와야 한다."""
import os as _os
P = _os.path.dirname(_os.path.abspath(__file__))          # pipeline/
REPO = _os.path.dirname(P)                                  # 레포 루트
HTMLPATH = _os.path.join(REPO, 'vocagoyangfable.html')
import json, re, sys, os
HTML = sys.argv[1] if len(sys.argv) > 1 else HTMLPATH
src = open(HTML, encoding='utf-8').read()
m = re.search(r'const DATA = (\[.*?\]);\n', src, re.S)
data = json.loads(m.group(1))
os.makedirs(f'{P}/out', exist_ok=True)
for L in data:
    n = L['lesson']
    if n <= 4:
        json.dump(L, open(f'{P}/out/lesson{n:02d}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    else:
        json.dump(L['exercises'], open(f'{P}/out/set{n:02d}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
for name, filename in [('READING_CORE','reading-core.json'),('MORPHOLOGY','morphology.json'),('CONNECTIONS','connections.json')]:
    m=re.search(r'const '+name+r' = ([^\n]+);\n',src)
    if m:
        json.dump(json.loads(m.group(1)),open(f'{P}/{filename}','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('lessons', len(data), 'cards', sum(len(e['words']) for L in data for e in L['exercises']))
