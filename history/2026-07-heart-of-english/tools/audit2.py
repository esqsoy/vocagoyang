#!/usr/bin/env python3
"""마스터 JSON 감사"""
import json,re,sys
db=json.load(open('hoe_master.json'))
KEEP={'football','minute'}; bad=0
words=[c['word'] for c in db['cards']]; ns=[c['n'] for c in db['cards']]
from collections import Counter
dup=[w for w,c in Counter(words).items() if c>1]
miss=[i for i in range(1,max(ns)+1) if i not in set(ns)]
for c in db['cards']:
    body=json.dumps(c,ensure_ascii=False)
    if len(re.findall(r'고양(?!이)',body))>1: bad+=1; print("[말투]",c['n'],c['word'])
    if len(c['senses'])==1 and '/' in c['senses'][0]['g'] and '↔' not in c['senses'][0]['g'] and c['word'] not in KEEP:
        bad+=1; print("[슬래시]",c['n'],c['word'],c['senses'][0]['g'][:40])
    for s in c['senses']:
        m=re.search(r'((?:_\s?)+)',s.get('ex',''))
        if m and m.group(1).count('_')!=len(s['ans']): bad+=1; print("[빈칸]",c['n'],c['word'],s['ex'][:40])
        if not m: bad+=1; print("[빈칸없음]",c['n'],c['word'],s.get('ex','')[:40])
    # 어간 종결 검사 (기계 치환 부작용 탐지)
    import re as _re
    for s2 in c['senses']:
        for f in ('c',):
            v=s2.get(f); texts=v if isinstance(v,list) else ([v] if v else [])
            for t in texts:
                for sent in _re.split(r'(?<=[.!?])\s+',t.strip()):
                    core=sent.rstrip('."\')!?…')
                    if core and _re.search(r'(있|없|되|싶|않)$',core):
                        bad+=1; print("[어간종결]",c['n'],c['word'],core[-25:])
print(f"\n총 {db['total']}표제어/{db['senses']}뜻 | 중복 {dup or 0} | 누락 {miss or 0} | 이상 {bad}건")
