#!/usr/bin/env python3
"""Rebuild embedded lessons from vocabulary, review, morphology and connection sources."""
from pathlib import Path
import copy
import json
import re

P = Path(__file__).resolve().parent
HTML = P.parent / 'vocagoyangfable.html'
def read(path):
    return json.loads(path.read_text(encoding='utf-8'))
def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

data = [read(P / f'out/lesson{i:02d}.json') for i in range(5)]
for n in range(5, 46):
    exs = read(P / f'out/set{n:02d}.json')
    if n < 23:
        start, end = (n-5)*100+401, min((n-4)*100+400, 2183)
    else:
        start, end = exs[0]['name'].split('~')[0], exs[-1]['name'].split('~')[1]
    data.append({'lesson':n, 'label':f'{n}세트', 'name':f'{start}~{end}', 'exercises':exs})

core = read(P / 'reading-core.json')
index = {(L['lesson'], w['word'], w['si']):w for L in data for e in L['exercises'] for w in e['words']}
review = []
for e in core['exercises']:
    words = []
    for r in e['refs']:
        w = copy.deepcopy(index[(r['set'], r['word'], r['si'])])
        w['reviewOf'] = r
        words.append(w)
    review.append({'ex':e['ex'], 'name':e['name'],
                   'progressTitle':f"핵심 {e['ex']} · {e['name']}", 'words':words})
write(P / 'out/set46.json', review)
data.append({'lesson':46, 'label':'46세트', 'name':'잘못 알기 쉬운 단어들',
             'kind':'review', 'progressId':core['id'], 'exercises':review})

morph = read(P / 'morphology.json')
units = {u['id']:u for u in morph['units']}
if len(units) != len(morph['units']):
    raise ValueError('Duplicate morphology unit id')
for course in morph['courses']:
    exs = []
    for i, group in enumerate(course['groups'], 1):
        cards = []
        for uid in group['unitIds']:
            for raw in units[uid]['cards']:
                w = copy.deepcopy(raw)
                w['unitId'] = uid
                cards.append(w)
        counts = {w['word']:sum(x['word']==w['word'] for x in cards) for w in cards}
        seen = {}
        for w in cards:
            seen[w['word']] = seen.get(w['word'], 0)+1
            w['si'], w['sn'] = seen[w['word']], counts[w['word']]
        exercise = {'ex':i, 'name':group['name'], 'unitIds':group['unitIds'], 'words':cards}
        # Display numbering may change while each existing exercise keeps its record.
        for key in ('progressId', 'progressTitle', 'legacyLocation'):
            if key in group:
                exercise[key] = copy.deepcopy(group[key])
        exs.append(exercise)
    n = course['lesson']
    write(P / f'out/set{n}.json', exs)
    data.append({'lesson':n, 'label':f'{n}세트', 'name':course['name'], 'kind':'morphology',
                 'progressId':course['progressId'], 'exercises':exs})

connections = read(P / 'connections.json') if (P / 'connections.json').exists() else None
if connections:
    entries = {entry['id']: entry for entry in connections['entries']}
    if len(entries) != len(connections['entries']):
        raise ValueError('Duplicate connection entry id')
    for course in connections['courses']:
        course_ids = [eid for group in course['groups'] for eid in group['entryIds']]
        totals = {}
        for eid in course_ids:
            head = entries[eid]['card']['word']
            totals[head] = totals.get(head, 0) + 1
        seen, exercises = {}, []
        for i, group in enumerate(course['groups'], 1):
            words = []
            for eid in group['entryIds']:
                w = copy.deepcopy(entries[eid]['card'])
                head = w['word']
                seen[head] = seen.get(head, 0) + 1
                w.update(constructionId=eid, si=seen[head], sn=totals[head])
                words.append(w)
            exercises.append({'ex':i, 'name':group['name'], 'words':words})
        n = course['lesson']
        write(P / f'out/set{n}.json', exercises)
        data.append({'lesson':n, 'label':f'{n}세트', 'name':course['name'],
                     'kind':'connections', 'progressId':course['progressId'], 'exercises':exercises})

# These two files were generated for the previous split root courses.
# Remove only retired generated outputs, never the underlying morphology units.
active_numbers = {L['lesson'] for L in data}
for n in (49, 50):
    if n not in active_numbers:
        (P / f'out/set{n}.json').unlink(missing_ok=True)

src = HTML.read_text(encoding='utf-8')
constants = [('DATA', data), ('READING_CORE', core), ('MORPHOLOGY', morph)]
if connections:
    constants.append(('CONNECTIONS', connections))
for name, value in constants:
    blob = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    pattern = rf'(const {name} = )[^\n]+(;\n)'
    src, n = re.subn(pattern, lambda m:m[1]+blob+m[2], src)
    if n == 0 and name == 'CONNECTIONS':
        marker = '/* ===== parse already-structured DATA -> lessons ===== */'
        if src.count(marker) != 1:
            raise ValueError('Expected one insertion point for CONNECTIONS')
        src = src.replace(marker, 'const CONNECTIONS = '+blob+';\n\n'+marker)
    elif n != 1:
        raise ValueError(f'Expected one {name} declaration; found {n}')
HTML.write_text(src, encoding='utf-8')
# DATA keeps the authored topic groups. The app's splitExercises() builds the
# balanced, at-most-eight-card playable exercises without changing this source.
print(json.dumps({'sets':len(data), 'sourceGroups':sum(len(L['exercises']) for L in data),
                  'cards':sum(len(e['words']) for L in data for e in L['exercises']),
                  'morphologyUnits':len(units)}, ensure_ascii=False))
