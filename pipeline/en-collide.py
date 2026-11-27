#!/usr/bin/env python3
"""영어 쪽 같은 칸 수 경쟁어 후보 뽑기(26.11.28, 이솝·톨킨 제안 1).

collide.py는 한국어 뜻이 겹치는 표제어끼리만 본다. 그래서 책에 없는 영어(dissolve·rockslide 등)를 못 잡는다.
이 도구는 WordNet 동의어(같은 품사)에서 후보를 뽑아, 빈칸에 실제로 들어갈 수 있는 것만 남긴다.
  - 글자 수가 표제어와 같다(학생은 칸 수를 본다).
  - 칸 밖 꼬리(-s·-d·-ed·-ing·-ring 등)를 붙여도 철자가 선다.
  - 빈칸 바로 앞 관사(a/an)와 첫소리가 맞는다.
  - 이미 해설(c)에 적었거나 허용 정답(acceptedAnswers·ALT)인 것은 뺀다.
결과는 후보다. 결함 판정은 팀원이 문장을 읽고 한다(PRINCIPLES 3).

사용: NLTK_ALLOW_PROXIED_URLOPEN=1 python3 pipeline/en-collide.py vocagoyangfable.html [--out 후보.json]
필요: pip install nltk, nltk.download('wordnet')
"""
import json, re, sys, argparse
from nltk.corpus import wordnet as wn

POS = {'n.': [wn.NOUN], 'v.': [wn.VERB], 'adj.': [wn.ADJ, wn.ADJ_SAT], 'adv.': [wn.ADV]}
VOWEL = re.compile(r'^[aeiou]', re.I)


def letters(s):
    return re.sub(r'[^a-z]', '', s.lower())


def load(html):
    s = open(html, encoding='utf-8').read()
    data = json.loads(re.search(r'^const DATA = (\[.*\]);$', s, re.M).group(1))
    m = re.search(r'^const ALT=(\{.*?\});', s, re.M)
    alt = json.loads(m.group(1)) if m else {}
    return data, alt


def noted(c):
    out = set()
    for m in re.finditer(r'이 문장에는\s*([^.]+?)도 들어간다', c or ''):
        out |= {x.strip().lower() for x in re.split('[·,/]', m.group(1))}
    for m in re.finditer(r"([A-Za-z][A-Za-z' ·,/-]*?)(?:와|과) 바꿔 쓸 수 있다", c or ''):
        out |= {x.strip().lower() for x in re.split('[·,/]', m.group(1))}
    return out


def tail_ok(base, tail):
    """꼬리를 붙인 꼴이 그 낱말의 실제 굴절형인지 대충 본다."""
    if not tail:
        return True
    if tail in ('s', 'es'):
        return True
    if tail in ('d',):
        return base.endswith('e')
    if tail in ('ed', 'ing', 'er', 'est'):
        return not base.endswith('e')
    m = re.match(r'^([a-z])(ed|ing|er)$', tail)   # 겹자음 꼬리(referring의 -ring)
    if m:
        return base.endswith(m.group(1)) is False and bool(re.search(r'[aeiou][bcdfgklmnprstvz]$', base)) and base[-1] == m.group(1)
    return False


def synonyms(term, pos):
    out = set()
    for p in POS.get(pos, []):
        for syn in wn.synsets(term.replace(' ', '_'), pos=p):
            for l in syn.lemmas():
                out.add(l.name().replace('_', ' ').lower())
            for rel in syn.similar_tos():
                for l in rel.lemmas():
                    out.add(l.name().replace('_', ' ').lower())
    out.discard(term.lower())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--out')
    a = ap.parse_args()
    data, alt = load(a.html)
    rows = []
    for L in data:
        for e in L['exercises']:
            for w in e['words']:
                ex = w.get('ex') or ''
                m = re.search(r'(\S*)\s*\{\{BLANK\}\}([a-z]*)', ex)
                if not m:
                    continue
                before = ex[:m.start()].split()
                prev = before[-1].lower() if before else ''
                tail = m.group(2)
                term = w['en']
                n = len(letters(term))
                skip = noted(w.get('c')) | {x.lower() for x in (w.get('acceptedAnswers') or [])} | {x.lower() for x in alt.get(f"{term}/{w.get('si', 1)}", [])}
                cands = []
                for s in synonyms(term, w.get('pos', '')):
                    if len(letters(s)) != n or s in skip or ' ' in s.strip() and ' ' not in term:
                        continue
                    if prev == 'a' and VOWEL.match(s) or prev == 'an' and not VOWEL.match(s):
                        continue
                    if not tail_ok(letters(s), tail) and tail:
                        continue
                    cands.append(s)
                if cands:
                    rows.append({'lesson': L['lesson'], 'term': term, 'si': w.get('si', 1), 'ko': w.get('ko'), 'pos': w.get('pos'),
                                 'ex': ex, 'c': w.get('c', ''), 'cands': sorted(cands)})
    print(f'후보가 있는 카드 {len(rows)}장, 후보 낱말 {sum(len(r["cands"]) for r in rows)}개', file=sys.stderr)
    if a.out:
        json.dump(rows, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    else:
        for r in rows[:40]:
            print(r['lesson'], r['term'], r['cands'], '|', r['ex'])


if __name__ == '__main__':
    main()
