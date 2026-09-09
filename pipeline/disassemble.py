#!/usr/bin/env python3
"""vocagoyangfable.html의 DATA 블롭 → out/lesson00~04.json, out/set05~45.json 복원.
사용: python3 disassemble.py [html경로]   (기본: /home/claude/vocagoyang/vocagoyangfable.html)
새 작업 공간에서 GitHub의 HTML 하나만 있을 때 이걸로 파이프라인 원본을 되살린다.
assemble.py의 역연산 — 복원 후 assemble.py를 돌리면 같은 HTML이 나와야 한다."""
import json, re, sys, os
HTML = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/vocagoyang/vocagoyangfable.html'
src = open(HTML, encoding='utf-8').read()
m = re.search(r'const DATA = (\[.*?\]);\n', src, re.S)
data = json.loads(m.group(1))
os.makedirs('out', exist_ok=True)
for L in data:
    n = L['lesson']
    if n <= 4:
        json.dump(L, open(f'out/lesson{n:02d}.json', 'w'), ensure_ascii=False, indent=0)
    else:
        json.dump(L['exercises'], open(f'out/set{n:02d}.json', 'w'), ensure_ascii=False, indent=0)
print('lessons', len(data), 'cards', sum(len(e['words']) for L in data for e in L['exercises']))
