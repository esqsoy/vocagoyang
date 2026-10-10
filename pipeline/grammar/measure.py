#!/usr/bin/env python3
"""FABLE 예문의 문법 노출을 센다(26.10.10 영신 결정: 5,000단어를 순서대로 플레이하면 문법이 체화되게).

예문 빈칸에 정답을 채운 문장을 spaCy로 구문 분석하고, 문법 항목별로
예문 수·처음 나오는 세트·구간별 분포·다시 나오는 세트 수를 보고한다.
자동 분석 추정치다. 문법 지도(syllabus)의 노출 목표를 확인하는 데 쓴다.

필요: pip install spacy && python3 -m spacy download en_core_web_sm
사용: python3 pipeline/grammar/measure.py [--json 출력.json] [--cards 카드별.json]
"""
import argparse, collections, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = ROOT / 'vocagoyangfable.html'

try:
    import spacy
except ImportError:
    sys.exit('spaCy가 없다: pip install spacy && python3 -m spacy download en_core_web_sm')

WH = {'who', 'whom', 'whose', 'which', 'that', 'where', 'when', 'why', 'what', 'how'}
REL = {'who', 'whom', 'whose', 'which', 'that'}
PP = re.compile(r"\b(have|has|haven't|hasn't|'ve)\s+(just |already |never |ever |not |been )?(\w+ed|been|done|gone|seen|made|taken|given|known|written|eaten|found|lost|left|met|heard|had|told|thought|brought|bought|caught|taught|felt|kept|won|read|run|come|become|begun|broken|chosen|driven|fallen|forgotten|grown|hidden|ridden|risen|shown|spoken|stolen|sung|swum|thrown|woken|worn|got|gotten)\b", re.I)


def band(li):
    return '0' if li == 0 else '1-5' if li <= 5 else '6-20' if li <= 20 else '21-45' if li <= 45 else '46-50'


def load_cards():
    html = HTML.read_text(encoding='utf-8')
    data = json.loads(re.search(r'^const DATA\s*=\s*(\[.*\]);\s*$', html, re.M).group(1))
    cards = []
    for li, lesson in enumerate(data):
        for ei, ex in enumerate(lesson['exercises']):
            for wi, w in enumerate(ex['words']):
                text = (w.get('ex') or '').replace('{{BLANK}}', w['en'])
                cards.append(dict(set=li, ex=ei, i=wi, word=w.get('word') or w['en'], si=w.get('si') or 1, s=text))
    return cards


def tags(doc, s):
    T = set()
    toks = list(doc)
    low = s.lower()
    end_q = s.strip().endswith('?')
    for t in toks:
        d, tg, l = t.dep_, t.tag_, t.lemma_.lower()
        kids = list(t.children)
        if tg == 'VBZ' and l not in ('be', 'have', 'do'): T.add('3인칭 단수 -s')
        if l == 'be' and tg in ('VBZ', 'VBP'): T.add('be 현재')
        if tg == 'VBD':
            T.add('과거(규칙)' if t.lower_.endswith('ed') else '과거(불규칙)' if l not in ('be', 'have', 'do') else 'was/were·had·did')
        if d == 'auxpass': T.add('수동태')
        if d == 'neg': T.add('부정 not/never')
        if d == 'expl' and t.lower_ == 'there': T.add('There is/are')
        if d == 'expl' and t.lower_ == 'it': T.add('가주어 it')
        if tg == 'VBG' and any(c.dep_ == 'aux' and c.lemma_ == 'be' for c in kids): T.add('진행형')
        if tg == 'VBN' and any(c.lower_ == 'had' and c.dep_ == 'aux' for c in kids): T.add('과거완료')
        if l == 'will' and tg == 'MD': T.add('미래 will')
        if l == 'go' and tg == 'VBG' and t.i + 2 < len(toks) and toks[t.i + 1].lower_ == 'to' and toks[t.i + 2].tag_ == 'VB': T.add('be going to')
        if tg == 'MD' and l != 'will': T.add('조동사')
        if tg == 'TO' and t.head.tag_ == 'VB': T.add('to부정사')
        if tg == 'VBG' and d in ('nsubj', 'dobj', 'pobj', 'pcomp', 'csubj', 'attr'): T.add('동명사')
        if d == 'relcl':
            if any(c.lower_ in REL for c in t.subtree if c.i < t.i): T.add('관계대명사')
            elif any(c.lower_ in ('where', 'when', 'why') for c in kids): T.add('관계부사')
            else: T.add('관계사 생략 수식절')
        if d == 'acl' and tg in ('VBN', 'VBG'): T.add('분사 후치 수식')
        if d == 'amod' and tg in ('VBN', 'VBG'): T.add('분사 형용사')
        if d == 'ccomp' and any(c.lower_ == 'that' and c.dep_ == 'mark' for c in kids): T.add('that 명사절')
        if d == 'advcl':
            m = [c.lower_ for c in kids if c.dep_ == 'mark']
            if 'if' in m: T.add('if 조건절')
            if any(x in m for x in ('when', 'while', 'before', 'after', 'until', 'since', 'as')): T.add('시간 부사절')
            if 'because' in m: T.add('because 절')
            if any(x in m for x in ('although', 'though')): T.add('양보절')
            if not m and tg in ('VBG', 'VBN') and t.i < t.head.i: T.add('분사구문')
        if tg in ('JJR', 'RBR'): T.add('비교급')
        if tg in ('JJS', 'RBS'): T.add('최상급')
        if d in ('dative', 'iobj'): T.add('4형식')
        if d == 'oprd': T.add('5형식(목적격 보어)')
        if l in ('make', 'let', 'have', 'help') and any(c.dep_ == 'ccomp' and c.tag_ == 'VB' for c in kids): T.add('사역동사')
        if l in ('see', 'hear', 'watch', 'feel', 'notice') and any(c.dep_ in ('ccomp', 'xcomp') and c.tag_ in ('VB', 'VBG') for c in kids): T.add('지각동사')
        if tg == 'PRP' and t.lower_.endswith(('self', 'selves')): T.add('재귀대명사')
        if tg == 'NNS': T.add('복수 명사')
    if PP.search(s) and not re.search(r"\bhas (no|a|an|the|\d)\b", low): T.add('현재완료')
    if re.search(r'\b[a-z]+,? (who|which|whose|whom)\b', low) and not end_q: T.add('관계대명사')
    if re.search(r'\bas \w+( \w+)? as\b', low): T.add('as ~ as')
    if re.search(r'\btoo \w+ to\b', low): T.add('too ~ to')
    if re.search(r'\bso \w+ that\b', low) or re.search(r'\bsuch an? (\w+ )?\w+ that\b', low): T.add('so/such ~ that')
    if re.search(r'\bused to \w+', low) and not re.search(r'\b(be|is|am|are|was|were|get|got) used to\b', low): T.add('used to')
    if re.search(r'\bif\b[^.]*\b(were|had)\b[^.]*\b(would|could|might)\b', low) or re.search(r'\b(would|could|might)\b[^.]*\bif\b[^.]*\b(were|had)\b', low) or re.search(r'\bwish\b[^.]*\b(were|had|could)\b', low) or re.search(r'\bas if\b', low): T.add('가정법')
    if re.search(r"\b(should|could|would|must|might|may) have \w+(ed|en|n)\b", low): T.add('조동사+have p.p.')
    if re.search(r"^(never|rarely|seldom|only|not only|little|hardly|no sooner)\b[^,]*\b(do|does|did|have|has|had|can|will|is|are|was|were)\b \w+", low) and not end_q: T.add('도치')
    if re.search(r"^it (is|was) [^.]* (that|who) ", low): T.add('강조 It ~ that')
    if re.search(r", (isn't|aren't|don't|doesn't|didn't|won't|can't|wasn't|weren't|is|are|do|does|did|will|can) (it|he|she|they|you|we|i|there)\?", low): T.add('부가의문문')
    if re.search(r'^(what an?|how) [^?]*!$', low): T.add('감탄문')
    if end_q:
        T.add('wh-의문문' if toks and toks[0].lower_ in WH else 'yes/no 의문문')
    if toks and toks[0].tag_ == 'VB' and toks[0].dep_ == 'ROOT': T.add('명령문')
    if any(t.dep_ == 'ccomp' and any(c.lower_ in WH and c.i < t.i for c in t.subtree) for t in toks) and not end_q: T.add('간접의문문·wh 명사절')
    return sorted(T)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--json', help='항목별 집계를 저장할 경로')
    ap.add_argument('--cards', help='카드별 태그를 저장할 경로')
    a = ap.parse_args()
    nlp = spacy.load('en_core_web_sm')
    cards = load_cards()
    for c, doc in zip(cards, nlp.pipe([c['s'] for c in cards], batch_size=256)):
        c['tags'] = tags(doc, c['s'])
    items = collections.defaultdict(lambda: dict(n=0, first=None, bands=collections.Counter(), sets=set()))
    for c in cards:
        for t in c['tags']:
            it = items[t]
            it['n'] += 1
            it['bands'][band(c['set'])] += 1
            it['sets'].add(c['set'])
            if it['first'] is None:
                it['first'] = dict(set=c['set'], word=c['word'], si=c['si'], s=c['s'])
    out = {k: dict(n=v['n'], first=v['first'], bands=dict(v['bands']), sets=len(v['sets'])) for k, v in sorted(items.items(), key=lambda kv: -kv[1]['n'])}
    print(f"카드 {len(cards)}장")
    print(f"{'문법':20s} {'예문':>5} {'첫세트':>5} {'세트수':>5}  0 / 1-5 / 6-20 / 21-45 / 46-50")
    for k, v in out.items():
        b = v['bands']
        print(f"{k:20s} {v['n']:5d} {v['first']['set']:5d} {v['sets']:5d}  {b.get('0',0)} / {b.get('1-5',0)} / {b.get('6-20',0)} / {b.get('21-45',0)} / {b.get('46-50',0)}")
    if a.json:
        Path(a.json).write_text(json.dumps(dict(cards=len(cards), items=out), ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    if a.cards:
        Path(a.cards).write_text(json.dumps([dict(set=c['set'], ex=c['ex'], i=c['i'], word=c['word'], si=c['si'], tags=c['tags']) for c in cards], ensure_ascii=False) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
