#!/usr/bin/env python3
"""시험 단어장 조립기: 원본(setNN.json)을 검사하고 시험 HTML의 DATA 한 줄을 바꾼다.

사용: python3 pipeline/exam/assemble.py <id> [--src DIR] [--html FILE] [--fable FILE] [--check]
  <id>     시험 id(toeic 등). 설정은 DIR/config.json, 세트는 DIR/setNN.json(NN=01..).
  --src    원본 폴더(기본 pipeline/exam/<id>). 개발용 작은 원본은 pipeline/exam/tests/fixture.
  --html   바꿀 HTML(기본 저장소 맨 위 vocagoyang<id>.html). 설정 블록의 EXAM.id가 <id>와 같아야 쓴다.
  --fable  FABLE 연결을 대조할 FABLE HTML(기본 vocagoyangfable.html의 DATA).
  --check  쓰지 않고, HTML의 DATA가 원본으로 만든 것과 같은지만 본다(다르면 종료 코드 1).

검사(하나라도 걸리면 쓰지 않고 종료 코드 1):
  - 카드 칸: en·ko·ex·tr·ipa·pos·word·si·sn 필수, c·meow·acceptedAnswers·fable은 있을 때만. 모르는 칸은 오타로 본다.
  - 예문의 {{BLANK}}는 정확히 하나. ko 앞 번호(①…)는 si와 같고, sn>1이면 번호가 있어야 한다.
  - word+si는 책 전체에서 하나. 표제어마다 si가 1..sn 빠짐없고 sn이 모두 같다.
  - fable {"set":FABLE 세트,"si":FABLE 뜻 번호}는 FABLE DATA에 그 세트·같은 word·그 si 카드가 있어야 한다.
  - fable 연결이 있는 카드는 scope "fable" 연습에만, 없는 카드는 scope "fable"이 아닌 연습에만 둔다.
    FABLE과 같은 뜻 카드를 모으는 일은 원본에서 한다. 조립기는 다시 묶지 않는다.
  - scope "fable" 연습은 세트 안에서 새 뜻 연습들 뒤에 온다. 연습 제목(번호)은 세트 안에서 겹치지 않는다.
IPA 맞추기(원본은 그대로 두고 DATA에만): fable 연결 카드는 연결된 FABLE 카드의 IPA로 덮어쓴다. 연결이 없어도
  FABLE에서 같은 철자(en)·품사(pos) 카드의 IPA가 하나뿐이면 그것을 쓴다. 같은 단어·IPA여야 FABLE 예외 음원이 붙는다.
"""
import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
NUM = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'
REQUIRED = ('en', 'ko', 'ex', 'tr', 'ipa', 'pos', 'word', 'si', 'sn')
OPTIONAL = ('c', 'meow', 'acceptedAnswers', 'fable')
CARD_ORDER = ('en', 'ko', 'ex', 'tr', 'c', 'ipa', 'pos', 'word', 'si', 'sn', 'meow', 'acceptedAnswers', 'fable')
EX_KEYS = {'ex', 'name', 'scope', 'words'}


def data_line(src):
    m = list(re.finditer(r'^const DATA = (.*);$', src, re.M))
    if len(m) != 1:
        raise SystemExit(f'DATA 줄이 {len(m)}개다(하나여야 한다)')
    return m[0]


def load_fable(path):
    """FABLE DATA 색인: (세트, word, si) → 카드, (en, pos) → IPA 집합."""
    lessons = json.loads(data_line(Path(path).read_text(encoding='utf-8')).group(1))
    cards, ipas = {}, {}
    for L in lessons:
        for e in L['exercises']:
            for w in e['words']:
                cards.setdefault((L['lesson'], w.get('word'), w.get('si', 1)), w)
                ipas.setdefault((w['en'], w.get('pos')), set()).add(w.get('ipa'))
    return cards, ipas


def load_course(exam_id, src=None):
    """원본 폴더를 읽어 (설정, 세트 목록, 문제 목록)을 돌려준다. 세트 = {lesson, label, name, exercises}."""
    src = Path(src) if src else HERE / exam_id
    problems = []
    cfg_file = src / 'config.json'
    if not cfg_file.exists():
        raise SystemExit(f'{cfg_file}가 없다')
    cfg = json.loads(cfg_file.read_text(encoding='utf-8'))
    if cfg.get('id') != exam_id:
        problems.append(f'config.json id({cfg.get("id")})가 {exam_id}가 아니다')
    sets = cfg.get('sets') or []
    seen, lessons = set(), []
    for s in sets:
        n, name = s.get('lesson'), s.get('name')
        if not isinstance(n, int) or n < 1 or n in seen:
            problems.append(f'config.json sets: lesson {n!r}가 1 이상 정수가 아니거나 겹친다')
            continue
        if not isinstance(name, str) or not name.strip():
            problems.append(f'config.json sets: {n}세트 이름이 없다')
        seen.add(n)
        f = src / f'set{n:02d}.json'
        if not f.exists():
            problems.append(f'{f.name}가 없다(config.json sets에 {n}세트가 있다)')
            continue
        exs = json.loads(f.read_text(encoding='utf-8'))
        if not isinstance(exs, list):
            problems.append(f'{f.name}: 연습 목록([...])이어야 한다')
            continue
        lessons.append({'lesson': n, 'label': f'{n}세트', 'name': name or '', 'exercises': exs, 'file': f.name})
    if not sets:
        problems.append('config.json sets가 비었다(세트 원본을 넣고 sets에 세트 번호·이름을 적는다)')
    if [L['lesson'] for L in lessons] != sorted(L['lesson'] for L in lessons):
        problems.append('config.json sets는 세트 번호 순서여야 한다')
    for f in sorted(src.glob('set*.json')):
        m = re.fullmatch(r'set(\d+)\.json', f.name)
        if m and int(m.group(1)) not in seen:
            problems.append(f'{f.name}가 config.json sets에 없다')
    return cfg, lessons, problems


def check_course(lessons, fable_cards):
    """카드 꼴·FABLE 연결·scope 검사. (문제, 알림)."""
    problems, notes = [], []
    heads = {}
    for L in lessons:
        tag0 = L['file']
        titles, fable_started = set(), False
        for ei, e in enumerate(L['exercises'], 1):
            tag = f'{tag0} 연습{ei}'
            if not isinstance(e, dict):
                problems.append(f'{tag}: 연습이 객체가 아니다')
                continue
            extra = set(e) - EX_KEYS
            if extra:
                problems.append(f'{tag}: 모르는 칸 {sorted(extra)}')
            scope = e.get('scope')
            if scope not in (None, 'fable'):
                problems.append(f'{tag}: scope는 없거나 "fable"이어야 한다({scope!r})')
            if not isinstance(e.get('ex'), int) or e['ex'] < 1:
                problems.append(f'{tag}: ex는 1 이상 정수')
            if not isinstance(e.get('name'), str) or not e['name'].strip():
                problems.append(f'{tag}: name이 없다')
            key = (scope == 'fable', e.get('ex'))
            if key in titles:
                problems.append(f'{tag}: {"FABLE 뜻" if scope == "fable" else "Exercise"} {e.get("ex")}가 세트 안에서 겹친다')
            titles.add(key)
            if scope == 'fable':
                fable_started = True
            elif fable_started:
                problems.append(f'{tag}: 새 뜻 연습이 FABLE 뜻 연습 뒤에 있다(FABLE 뜻 연습은 세트 끝에 모은다)')
            words = e.get('words')
            if not isinstance(words, list) or not words:
                problems.append(f'{tag}: words가 비었다')
                continue
            if not 4 <= len(words) <= 15:
                notes.append(f'{tag}: {len(words)}장(보통 4~15장. 16장부터 게임이 둘로 나눈다)')
            for ci, w in enumerate(words, 1):
                where = f'{tag} 카드{ci} {w.get("word", "?")}({w.get("si", "?")})' if isinstance(w, dict) else f'{tag} 카드{ci}'
                if not isinstance(w, dict):
                    problems.append(f'{where}: 카드가 객체가 아니다')
                    continue
                unknown = set(w) - set(REQUIRED) - set(OPTIONAL)
                if unknown:
                    problems.append(f'{where}: 모르는 칸 {sorted(unknown)}')
                for k in REQUIRED:
                    v = w.get(k)
                    if k in ('si', 'sn'):
                        if not isinstance(v, int) or isinstance(v, bool) or v < 1:
                            problems.append(f'{where}: {k}는 1 이상 정수')
                    elif not isinstance(v, str) or not v.strip():
                        problems.append(f'{where}: {k}가 비었다')
                if 'c' in w and not isinstance(w['c'], str):
                    problems.append(f'{where}: c는 글자여야 한다')
                if 'meow' in w and (not isinstance(w['meow'], str) or not w['meow'].strip()):
                    problems.append(f'{where}: meow는 있을 때만 쓴다(빈 글자 금지)')
                if 'acceptedAnswers' in w and (not isinstance(w['acceptedAnswers'], list) or not w['acceptedAnswers']
                                               or not all(isinstance(a, str) and a.strip() for a in w['acceptedAnswers'])):
                    problems.append(f'{where}: acceptedAnswers는 글자 목록')
                si, sn = w.get('si'), w.get('sn')
                if isinstance(si, int) and isinstance(sn, int) and si > sn:
                    problems.append(f'{where}: si({si})가 sn({sn})보다 크다')
                ex = w.get('ex') if isinstance(w.get('ex'), str) else ''
                if ex.count('{{BLANK}}') != 1:
                    problems.append(f'{where}: 예문의 {{{{BLANK}}}}가 {ex.count("{{BLANK}}")}개(하나여야 한다)')
                ko = w.get('ko') if isinstance(w.get('ko'), str) else ''
                m = re.match(f'^([{NUM}])\\s', ko)
                if m and isinstance(si, int) and NUM.index(m.group(1)) + 1 != si:
                    problems.append(f'{where}: ko 번호 {m.group(1)}가 si {si}와 다르다')
                if not m and isinstance(sn, int) and sn > 1:
                    problems.append(f'{where}: sn이 {sn}인데 ko 앞에 번호(①…)가 없다')
                if isinstance(w.get('word'), str) and isinstance(si, int):
                    heads.setdefault(w['word'], []).append((si, sn, where))
                link = w.get('fable')
                if 'fable' in w:
                    if (not isinstance(link, dict) or set(link) != {'set', 'si'}
                            or not all(isinstance(link[k], int) and not isinstance(link[k], bool) for k in ('set', 'si'))):
                        problems.append(f'{where}: fable은 {{"set":세트,"si":뜻번호}}')
                    else:
                        hit = fable_cards.get((link['set'], w.get('word'), link['si']))
                        if not hit:
                            problems.append(f'{where}: FABLE {link["set"]}세트에 {w.get("word")} si {link["si"]} 카드가 없다')
                        elif hit.get('pos') != w.get('pos'):
                            notes.append(f'{where}: 품사가 FABLE({hit.get("pos")})과 다르다({w.get("pos")}). 같은 뜻이 맞는지 본다')
                    if scope != 'fable':
                        problems.append(f'{where}: FABLE 연결 카드인데 scope "fable" 연습 밖에 있다')
                elif scope == 'fable':
                    problems.append(f'{where}: FABLE 연결이 없는데 scope "fable" 연습에 있다')
    for word, lst in heads.items():
        sis = sorted(si for si, _, _ in lst)
        if len(sis) != len(set(sis)):
            dup = sorted({si for si in sis if sis.count(si) > 1})
            problems.append(f'{word}: si {dup}가 겹친다(word+si는 책 전체에서 하나)')
        sns = {sn for _, sn, _ in lst}
        if len(sns) != 1:
            problems.append(f'{word}: sn이 {sorted(sns, key=str)}로 다르다')
            continue
        sn = next(iter(sns))
        if isinstance(sn, int) and sorted(set(sis)) != list(range(1, sn + 1)):
            problems.append(f'{word}: si {sorted(set(sis))}가 1..{sn}을 빠짐없이 채우지 않는다')
    return problems, notes


def align_ipa(lessons, fable_cards, fable_ipas):
    """DATA에 넣을 카드의 IPA를 FABLE에 맞춘다. 원본 카드는 바꾸지 않고 사본을 돌려준다."""
    counts = {'linked': 0, 'linkedChanged': 0, 'matched': 0, 'matchedChanged': 0}
    out = []
    for L in lessons:
        exs = []
        for e in L['exercises']:
            words = []
            for w in e['words']:
                w = dict(w)
                link = w.get('fable')
                ipa = None
                if link:
                    hit = fable_cards.get((link['set'], w['word'], link['si']))
                    if hit and hit.get('ipa'):
                        ipa = hit['ipa']
                        counts['linked'] += 1
                        counts['linkedChanged'] += ipa != w['ipa']
                else:
                    cand = fable_ipas.get((w['en'], w['pos'])) or set()
                    if len(cand) == 1:
                        ipa = next(iter(cand))
                        counts['matched'] += 1
                        counts['matchedChanged'] += ipa != w['ipa']
                if ipa:
                    w['ipa'] = ipa
                words.append({k: w[k] for k in CARD_ORDER if k in w})
            ex = {'ex': e['ex'], 'name': e['name']}
            if e.get('scope'):
                ex['scope'] = e['scope']
            ex['words'] = words
            exs.append(ex)
        out.append({'lesson': L['lesson'], 'label': L['label'], 'name': L['name'], 'exercises': exs})
    return out, counts


def blob(data):
    return json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def main(argv=None):
    ap = argparse.ArgumentParser(description='시험 단어장 조립기')
    ap.add_argument('id')
    ap.add_argument('--src')
    ap.add_argument('--html')
    ap.add_argument('--fable', default=str(ROOT / 'vocagoyangfable.html'))
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args(argv)
    if not re.fullmatch(r'[a-z][a-z0-9]*', a.id):
        raise SystemExit('id는 영문 소문자·숫자')
    html = Path(a.html) if a.html else ROOT / f'vocagoyang{a.id}.html'
    cfg, lessons, problems = load_course(a.id, a.src)
    fable_cards, fable_ipas = load_fable(a.fable)
    more, notes = check_course(lessons, fable_cards)
    problems += more
    for n in notes:
        print('알림:', n, file=sys.stderr)
    if problems:
        for p in problems:
            print('문제:', p, file=sys.stderr)
        print(json.dumps({'id': a.id, 'problems': len(problems)}, ensure_ascii=False))
        return 1
    data, counts = align_ipa(lessons, fable_cards, fable_ipas)
    if not html.exists():
        raise SystemExit(f'{html.name}가 없다. 먼저 node pipeline/exam/sync.cjs로 만든다')
    src = html.read_text(encoding='utf-8')
    m = re.search(r'/\* EXAM_CONFIG:START \*/[\s\S]*?\nconst EXAM=(\{.*\});\n', src)
    if not m or json.loads(m.group(1)).get('id') != a.id:
        raise SystemExit(f'{html.name}는 {a.id} 시험 HTML이 아니다(EXAM_CONFIG의 EXAM.id 확인). FABLE·마더텅 HTML에는 쓰지 않는다')
    line = data_line(src)
    new = src[:line.start()] + 'const DATA = ' + blob(data) + ';' + src[line.end():]
    cards = sum(len(e['words']) for L in data for e in L['exercises'])
    summary = {'id': a.id, 'html': html.name, 'sets': len(data), 'exercises': sum(len(L['exercises']) for L in data),
               'fableExercises': sum(1 for L in data for e in L['exercises'] if e.get('scope') == 'fable'),
               'cards': cards, 'fableCards': sum(1 for L in data for e in L['exercises'] for w in e['words'] if w.get('fable')),
               'headwords': len({w['word'] for L in data for e in L['exercises'] for w in e['words']}),
               'ipaFromFableLink': counts['linkedChanged'], 'ipaFromFableSameWordPos': counts['matchedChanged'],
               'ipaLinked': counts['linked'], 'ipaSameWordPos': counts['matched']}
    if a.check:
        summary['action'] = 'verified' if new == src else 'stale'
        print(json.dumps(summary, ensure_ascii=False))
        return 0 if new == src else 1
    if new != src:
        html.write_text(new, encoding='utf-8')
    summary['action'] = 'updated' if new != src else 'unchanged'
    print(json.dumps(summary, ensure_ascii=False))
    print(f'IPA: FABLE 연결로 덮어쓴 카드 {counts["linkedChanged"]}장(연결 {counts["linked"]}장 중), '
          f'같은 철자·품사 FABLE IPA로 덮어쓴 카드 {counts["matchedChanged"]}장(대조 {counts["matched"]}장 중)', file=sys.stderr)
    if new != src:
        print('다음: node pipeline/ipa-effects/build.cjs (발음 효과 표를 새 DATA에 맞춘다)', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
