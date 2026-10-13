#!/usr/bin/env python3
"""검토를 마친 카드 확정본(final-*.json)의 연습을 배치표 순서대로 pipeline/out/setNN.json 끝에 붙인다.
기존 연습·카드·진도 키는 건드리지 않는다. 같은 이름 연습이 이미 있으면 멈춘다.
26.10.10 Oxford 3000 보강 때 임시 폴더에서 쓰던 것을 26.10.13 Oxford 5000 보강 때 저장소로 옮겼다.
사용: python3 pipeline/oxford/apply.py pipeline/oxford/placement-20261013.json <확정본 폴더>"""
import json, glob, os, sys, collections
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
plan = json.load(open(sys.argv[1], encoding='utf-8'))
order = list(collections.OrderedDict(((w['set'], w['exercise']), 1) for w in plan['words']))
byex = collections.defaultdict(list)
for w in plan['words']:
    byex[(w['set'], w['exercise'])].append(w['word'])
got = {}
for f in sorted(glob.glob(os.path.join(sys.argv[2], 'final-*.json'))):
    for ex in json.load(open(f, encoding='utf-8'))['exercises']:
        got[(ex['set'], ex['name'])] = ex['words']
missing = [k for k in order if k not in got]
assert not missing, missing
KEYS = ['en', 'ko', 'ex', 'tr', 'c', 'ipa', 'pos', 'word', 'si', 'sn', 'meow']
# 다른 세트에서 옮겨 오는 연습(lesson-placement-20261003)이 쓸 번호는 비워 둔다(45세트 9~14: 0세트의 독해 핵심 보강).
reserved = collections.defaultdict(set)
for m in json.load(open(f'{ROOT}/pipeline/lesson-placement-20261003.json', encoding='utf-8'))['moves']:
    reserved[m['toLesson']].add(m['toExercise'])
total = 0
for s, n in order:
    ws = got[(s, n)]
    heads = [w['word'] for w in ws]
    assert [h for i, h in enumerate(heads) if i == 0 or heads[i - 1] != h] == byex[(s, n)], (s, n, heads)
    path = f'{ROOT}/pipeline/out/set{s:02d}.json'
    raw = open(path, encoding='utf-8').read()
    src = json.loads(raw)
    assert all(e.get('name') != n for e in src), ('이미 있음', s, n)
    cards = [{k: w[k] for k in KEYS if k in w and (k != 'meow' or w[k])} for w in ws]
    src.append({'ex': max([e['ex'] for e in src] + list(reserved[s])) + 1, 'name': n, 'words': cards})
    open(path, 'w', encoding='utf-8').write(json.dumps(src, ensure_ascii=False, indent=2) + ('\n' if raw.endswith('\n') else ''))
    total += len(cards)
print(json.dumps({'exercises': len(order), 'cards': total}, ensure_ascii=False))
