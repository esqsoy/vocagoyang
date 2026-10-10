#!/usr/bin/env python3
"""Rebuild embedded lessons from vocabulary, review, morphology and connection sources."""
from pathlib import Path
import copy
import json
import re
import subprocess

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
        ranged = [e['name'] for e in exs if '~' in e['name']]   # 26.10.08 지식 어휘 연습(범위 없는 이름)은 제외
        start, end = ranged[0].split('~')[0], ranged[-1].split('~')[1]
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

# Explicit teaching boundaries override the default short-part splitter only
# for reviewed groups. Keep source ordering/identities for prior progress.
topics = read(P / 'exercise-topics.json')
for group in topics['groups']:
    lesson = next(L for L in data if L['lesson'] == group['lesson'])
    exercise = next(e for e in lesson['exercises'] if e['ex'] == group['ex'])
    exercise['topicPreviousWords'] = [{'word': w['word'], 'si': w['si']} for w in exercise['words']]
    for addition in group.get('additions', []):
        ref = addition['ref']
        card = copy.deepcopy(index[(ref['set'], ref['word'], ref['si'])])
        card.update(addition.get('overrides', {}))
        card['topicReviewOf'] = copy.deepcopy(ref)
        position = next(i for i, w in enumerate(exercise['words']) if w['word'] == addition['before'])
        exercise['words'].insert(position, card)
    parts, start = [], 0
    for part in group['parts']:
        matches = [i for i, w in enumerate(exercise['words']) if w['word'].lower() == part['through'].lower()]
        if not matches or max(matches) < start:
            raise ValueError(f"Invalid topic boundary: {group['lesson']}:{group['ex']} {part['through']}")
        end = max(matches) + 1
        left = {w['word'].lower() for w in exercise['words'][:end]}
        right = {w['word'].lower() for w in exercise['words'][end:]}
        if left & right:
            raise ValueError('Topic boundary splits a headword')
        parts.append({'start': start, 'end': end, 'name': part['name']})
        start = end
    if start != len(exercise['words']):
        raise ValueError('Topic boundaries do not cover the full exercise')
    exercise['practiceParts'] = parts

# Display placement is separate from authored locations used by review refs.
# Keep each moved exercise's existing storage identity and resume location.
placement = read(P / 'lesson-placement-20261003.json')
for move in placement['moves']:
    source = next(L for L in data if L['lesson'] == move['fromLesson'])
    target = next(L for L in data if L['lesson'] == move['toLesson'])
    exercise = next(e for e in source['exercises'] if e['ex'] == move['fromExercise'])
    if len(exercise['words']) != move['cards']:
        raise ValueError('Review placement manifest after changing the card pool')
    if any(e['ex'] == move['toExercise'] for e in target['exercises']):
        raise ValueError('Duplicate exercise at relocation destination')
    title = f"Exercise {exercise['ex']} · {exercise['name']}"
    exercise.update(progressId=source['label'], progressTitle=title,
                    legacyLocation={'lid': source['label'], 'title': title},
                    relocatedFrom={'lid': source['label'], 'title': title})
    source['exercises'].remove(exercise)
    exercise['ex'] = move['toExercise']
    target['exercises'].append(exercise)
for change in placement['titleChanges']:
    lesson = next(L for L in data if L['lesson'] == change['lesson'])
    if lesson['name'] != change['old']:
        raise ValueError('Unexpected lesson title before relocation')
    lesson['name'] = change['new']

from placement_regrouping import apply_regrouping
data = apply_regrouping(data)

# 26.10.10 표제어 정리(PRINCIPLES 2-8): 범위와 상관없거나 같은 뜻 다른 꼴인 말을 저작 원본은 그대로 두고 화면 배치에서만 뺀다.
# 카드를 뺀 연습에는 빼기 전 카드 목록(preDeletion)을 남겨 완료 기록을 이어받게 한다.
def drop_cards(exercise, keep):
    """화면 배치에서 카드를 빼고, 배포된 판(빼기 전 카드 목록·판 나눔)을 남긴다. 판 나눔은 남은 카드에 맞춘다."""
    if 'preDeletion' in exercise:
        raise ValueError('An exercise may lose cards only once per release')
    exercise['preDeletion'] = [{'word': w.get('word') or w['en'], 'si': w.get('si') or 1} for w in exercise['words']]
    if 'practiceParts' in exercise:
        exercise['preDeletionParts'] = copy.deepcopy(exercise['practiceParts'])
        kept, parts, start = {id(w) for w in keep}, [], 0
        for part in exercise['practiceParts']:
            n = sum(id(w) in kept for w in exercise['words'][part['start']:part['end']])
            if n == 0:
                raise ValueError('Removing cards would empty a practice part')
            parts.append({**part, 'start': start, 'end': start + n})
            start += n
        exercise['practiceParts'] = parts
    exercise['words'] = keep

prune = read(P / 'prune-20261010.json')
drop = {w.lower() for w in prune['words']}
removed, dropped_heads = 0, set()
for lesson in data:
    for exercise in lesson['exercises']:
        keep = [w for w in exercise['words'] if (w.get('word') or w['en']).lower() not in drop]
        if len(keep) == len(exercise['words']):
            continue
        if lesson['lesson'] > 45:
            raise ValueError('Pruned headword appears in a review or topic set')
        if not keep:
            raise ValueError('Pruning would empty an exercise')
        dropped_heads |= {(w.get('word') or w['en']).lower() for w in exercise['words']} & drop
        removed += len(exercise['words']) - len(keep)
        drop_cards(exercise, keep)
if removed != prune['cards'] or dropped_heads != drop:
    raise ValueError(f'Pruning manifest mismatch: {removed} cards, {len(dropped_heads)} headwords')

# 26.10.10 0세트 재구성(PRINCIPLES 12, 영신 승인): 0세트를 문법 순서 23연습으로 다시 묶고 5세트·1세트의 기초 카드 39장을 옮겨 온다.
# 저작 위치는 그대로 두고 화면 배치만 바꾼다. 새 카드 3장은 lesson00.json 연습 20에 있다.
# 계획(set0-20261010/plan.json)은 바꾸기 전 판에서 계산한 모아둔 카드 ID·완료 기록 키·옛 이어하기 위치를 카드에 단다.
set0 = read(P / 'set0-20261010/plan.json')
lessons = {L['lesson']: L for L in data}
def find_card(lesson, word, si):
    found = [(e, w) for e in lessons[lesson]['exercises'] for w in e['words']
             if (w.get('word') or w['en']) == word and (w.get('si') or 1) == si]
    if len(found) != 1:
        raise ValueError(f'Set 0 plan expects one card {lesson}:{word}:{si}; found {len(found)}')
    return found[0]
before_set0 = sum(len(e['words']) for e in lessons[0]['exercises'])
moved, set0_exercises = {}, []
for group in set0['exercises']:
    words = []
    for ref in group['cards']:
        source, card = find_card(ref['lesson'], ref['word'], ref['si'])
        if ref['lesson'] != 0:
            moved.setdefault(id(source), (source, []))[1].append(card)
        card = copy.deepcopy(card)
        if ref.get('new'):
            if 'savedId' in card or 'priorKeys' in ref:
                raise ValueError('A new set-0 card has no earlier identity')
        else:
            if card.get('savedId', ref['savedId']) != ref['savedId']:
                raise ValueError('Set 0 plan disagrees with a fixed saved ID')
            card['savedId'], card['priorKeys'] = ref['savedId'], ref['priorKeys']
        words.append(card)
    set0_exercises.append({'ex': group['ex'], 'name': group['name'], 'progressId': set0['progressId'],
                           'progressTitle': f"Exercise {group['ex']} · {group['name']}", 'words': words})
set0_cards = [w for e in set0_exercises for w in e['words']]
if len(set0_cards) - sum(len(cards) for _, cards in moved.values()) != before_set0:
    raise ValueError('Set 0 plan must keep every current set-0 card exactly once')
if len({(w['word'], w['si']) for w in set0_cards}) != len(set0_cards):
    raise ValueError('Duplicate card in the new set 0')
for source, cards in moved.values():
    drop_cards(source, [w for w in source['words'] if all(w is not c for c in cards)])
lessons[0]['exercises'] = set0_exercises
for ref in set0['resume']:
    _, card = find_card(ref['lesson'], ref['word'], ref['si'])
    card['resumeFrom'] = ref['from']

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
subprocess.run(['node', str(P / 'index-stats.cjs')], check=True)
# DATA keeps the authored topic groups. The app's splitExercises() builds short
# playable exercises without dividing a headword's senses or changing this source.
print(json.dumps({'sets':len(data), 'sourceGroups':sum(len(L['exercises']) for L in data),
                  'cards':sum(len(e['words']) for L in data for e in L['exercises']),
                  'morphologyUnits':len(units)}, ensure_ascii=False))
