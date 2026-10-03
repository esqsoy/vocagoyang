"""Apply the reviewed display layout without changing authored word sources."""
import copy
import json
from pathlib import Path


def apply_regrouping(data):
    plan = json.loads((Path(__file__).parent / 'placement-review-20261003/placement.json').read_text(encoding='utf-8'))
    lessons = {lesson['lesson']: lesson for lesson in data}
    for move in plan['wholeMoves']:
        source, target = lessons[move['fromLesson']], lessons[move['toLesson']]
        exercise = next(e for e in source['exercises'] if e['ex'] == move['fromExercise'])
        if len(exercise['words']) != move['cards']:
            raise ValueError('Review the whole-exercise placement after card changes')
        title = f"Exercise {exercise['ex']} · {exercise['name']}"
        exercise.update(progressId=source['label'], progressTitle=title,
                        legacyLocation={'lid': source['label'], 'title': title},
                        relocatedFrom={'lid': source['label'], 'title': title})
        source['exercises'].remove(exercise)
        exercise['ex'] = move['toExercise']
        target['exercises'].append(exercise)

    cards = {}
    changed = set()
    for group in plan['beforeGroups']:
        lesson = lessons[group['lesson']]
        exercise = next(e for e in lesson['exercises'] if e['ex'] == group['metadata']['ex'])
        if len(exercise['words']) != group['cardCount']:
            raise ValueError('Review the regrouping plan after card additions or deletions')
        metadata = {k: v for k, v in exercise.items() if k != 'words'}
        if metadata != group['metadata']:
            raise ValueError('Unreviewed source exercise metadata change')
        history = lesson.setdefault('placementHistory', {k: copy.deepcopy(v) for k, v in lesson.items() if k != 'exercises'})
        old = copy.deepcopy(metadata)
        old['words'] = [{k: v for k, v in w.items() if k in ('word', 'en', 'si', 'sn', 'unitId', 'constructionId')} for w in exercise['words']]
        history.setdefault('exercises', []).append(old)
        namespace = exercise.get('progressId') or lesson.get('progressId') or lesson['label']
        title = exercise.get('progressTitle') or f"Exercise {exercise['ex']}" + (f" · {exercise['name']}" if exercise.get('name') else '')
        for i, word in enumerate(exercise['words']):
            card = copy.deepcopy(word)
            card['savedId'] = json.dumps([namespace, title, word['word'], word.get('si') or 1, word.get('unitId') or word.get('constructionId') or ''], ensure_ascii=False, separators=(',', ':'))
            cards[(lesson['lesson'], exercise['ex'], i)] = card
        changed.add((lesson['lesson'], exercise['ex']))

    # The plan is a permutation of the affected source cards, never a copy/delete.
    references = [tuple(ref) for group in plan['rewrites'] for ref in group['cards']]
    if len(references) != len(set(references)) or set(references) != set(cards):
        raise ValueError('Regrouping must preserve every affected card exactly once')
    replacement = {(g['lesson'], g['metadata']['ex']): {**copy.deepcopy(g['metadata']), 'words': [cards[tuple(ref)] for ref in g['cards']]} for g in plan['rewrites']}
    for lesson in data:
        existing = set()
        exercises = []
        for ex in lesson['exercises']:
            key = (lesson['lesson'], ex['ex'])
            existing.add(key)
            if key in replacement:
                exercises.append(replacement[key])
            elif key not in changed:
                exercises.append(ex)
        for key, exercise in replacement.items():
            if key[0] == lesson['lesson'] and key not in existing:
                exercises.append(exercise)
        lesson['exercises'] = exercises
    for change in plan['titleChanges']:
        lesson = lessons[change['lesson']]
        if lesson['name'] != change['old']:
            raise ValueError('Unexpected title before regrouping')
        lesson['name'] = change['new']
    return data
