#!/usr/bin/env python3
"""예문 순서 통제 — 예문에 그 카드보다 뒤에서 처음 배우는 단어가 섞였는지 본다.

26.10.10 영신: "학습할 때 가장 나쁜 게 A를 배우려고 하는데 모르는 B가 같이 등장해 버리는 식이라고 생각하거든.
(물론 나중에 가면 이런 게 오히려 학습에 도움을 주겠지만 지금 이 단어 풀은 '기초'니까)"
같은 날 영신: 이 제약 때문에 적절한 예문을 못 만들게 되면 꼭 따를 필요는 없다 → 논의 끝에 정한 기준(PRINCIPLES 2-1).

- 늘 허용: 0세트·5세트(기능어) 표제어, base-words.json(기초 생활어·외래어), 숫자, 고유명사(문장 첫머리가 아닌 대문자).
- 허용: 앞 세트와 같은 세트의 표제어, 그 활용형·파생형(-s, -ed, -ing, -er, -ly 등과 불규칙형).
- 앞당김: 그 카드의 세트보다 뒤에서 처음 나오는 표제어. 예문당 1개까지는 사람이 판단해 둘 수 있다
  (빈칸을 찾는 단서가 아니고 해석이 풀어 줄 때). 2개 이상은 다시 쓴다.
- Oxford 3000 보강 배치안(oxford/placement-*.json)의 새 단어는 정한 세트에서 배운 것으로 친다.
- 46~50세트는 복습·주제 세트라 세지 않는다. 표제어 밖 단어는 exaudit.py가 본다.
사용: python3 pipeline/ordercheck.py [--list 2] [--set N] [--json 경로]
"""
import argparse, collections, json, re
from pathlib import Path

P = Path(__file__).resolve().parent
HTML = P.parent / 'vocagoyangfable.html'
BASE_SETS = {0, 5}

IRREG = {}
for base, forms in {
    'be': 'am is are was were been being', 'have': 'has had having', 'do': 'does did done doing',
    'go': 'went gone goes', 'say': 'said says', 'see': 'saw seen', 'make': 'made', 'get': 'got gotten',
    'take': 'took taken', 'come': 'came', 'give': 'gave given', 'know': 'knew known', 'think': 'thought',
    'tell': 'told', 'find': 'found', 'feel': 'felt', 'keep': 'kept', 'leave': 'left', 'meet': 'met',
    'run': 'ran', 'sit': 'sat', 'stand': 'stood', 'hear': 'heard', 'hold': 'held', 'bring': 'brought',
    'buy': 'bought', 'catch': 'caught', 'teach': 'taught', 'wear': 'wore worn', 'choose': 'chose chosen',
    'speak': 'spoke spoken', 'break': 'broke broken', 'write': 'wrote written', 'eat': 'ate eaten',
    'drink': 'drank drunk', 'drive': 'drove driven', 'fall': 'fell fallen', 'grow': 'grew grown',
    'draw': 'drew drawn', 'fly': 'flew flown', 'throw': 'threw thrown', 'win': 'won', 'lose': 'lost',
    'pay': 'paid', 'send': 'sent', 'spend': 'spent', 'build': 'built', 'mean': 'meant', 'sell': 'sold',
    'become': 'became', 'begin': 'began begun', 'sing': 'sang sung', 'swim': 'swam swum', 'ring': 'rang rung',
    'freeze': 'froze frozen', 'hide': 'hid hidden', 'shake': 'shook shaken', 'wake': 'woke woken',
    'sleep': 'slept', 'feed': 'fed', 'lead': 'led', 'hang': 'hung', 'dig': 'dug', 'stick': 'stuck',
    'strike': 'struck', 'ride': 'rode ridden', 'rise': 'rose risen', 'shine': 'shone', 'shoot': 'shot',
    'seek': 'sought', 'fight': 'fought', 'bind': 'bound', 'blow': 'blew blown', 'forgive': 'forgave forgiven',
    'forget': 'forgot forgotten', 'tear': 'tore torn', 'lay': 'laid', 'lie': 'lay lain', 'deal': 'dealt',
    'understand': 'understood', 'steal': 'stole stolen', 'bite': 'bit bitten', 'lend': 'lent', 'bend': 'bent',
    'child': 'children', 'man': 'men', 'woman': 'women', 'person': 'people', 'foot': 'feet', 'tooth': 'teeth',
    'mouse': 'mice', 'good': 'better best', 'well': 'better best', 'bad': 'worse worst', 'can': "can't cannot",
    'will': "won't", 'little': 'less least', 'much': 'more most', 'many': 'more most', 'far': 'farther further',
}.items():
    for f in forms.split():
        IRREG.setdefault(f, []).append(base)
NUMS = set('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion'.split())


def load():
    html = HTML.read_text(encoding='utf-8')
    data = json.loads(re.search(r'^const DATA\s*=\s*(\[.*\]);\s*$', html, re.M).group(1))
    first, cards = {}, []
    for li, lesson in enumerate(data):
        for ei, ex in enumerate(lesson['exercises']):
            for wi, w in enumerate(ex['words']):
                for k in {(w.get('word') or w['en']).lower(), w['en'].lower()}:
                    if li < first.get(k, 99):
                        first[k] = li
                cards.append(dict(set=li, ex=ei, i=wi, name=ex.get('name'), word=w.get('word') or w['en'], si=w.get('si') or 1, text=w.get('ex') or ''))
    # 26.10.10 Oxford 3000 보강 배치안: 데이터에 넣기 전에도 정한 자리(세트)에서 배운 것으로 친다.
    for f in sorted(P.glob('oxford/placement-*.json')):
        plan = json.loads(f.read_text(encoding='utf-8'))
        for w in plan.get('words', []) + plan.get('set0', []):
            k = w['word'].lower()
            if ' ' not in k and w['set'] < first.get(k, 99):
                first[k] = w['set']
    return first, cards


def candidates(t):
    out = [t] + IRREG.get(t, [])
    for suf, rep in (('ies', 'y'), ('ied', 'y'), ('ier', 'y'), ('iest', 'y'), ('ily', 'y'), ('es', ''), ('s', ''), ('ed', ''), ('ed', 'e'),
                     ('d', ''), ('ing', ''), ('ing', 'e'), ('er', ''), ('er', 'e'), ('r', ''), ('est', ''), ('st', ''), ('ly', ''), ('ness', ''), ('ful', '')):
        if t.endswith(suf) and len(t) - len(suf) >= 2:
            b = t[:-len(suf)] + rep
            out.append(b)
            if len(b) > 2 and b[-1] == b[-2]:
                out.append(b[:-1])
    return out


def check(first, cards, base):
    known_always = {k for k, s in first.items() if s in BASE_SETS} | base | NUMS
    res = []
    for c in cards:
        if c['set'] > 45:
            continue
        body = re.sub(r"[A-Za-z']*\{\{BLANK\}\}[a-z]*(?:'[a-z]+|n't)?", ' ', c['text'])
        body = re.sub(r"\b\d+[A-Za-z]*", ' ', body)
        fwd = []
        for m in re.finditer(r"[A-Za-z][A-Za-z'-]*", body):
            tok = m.group(0)
            if tok[0].isupper() and m.start() > 0 and tok != 'I' and not re.search(r'[.!?"“]\s*$', body[:m.start()]):
                continue
            t = re.sub(r"(n't|'s|'re|'ll|'ve|'m|'d)$", '', tok.lower()).strip("'")
            if len(t) < 2:
                continue
            parts = t.split('-') if '-' in t and t not in first else [t]
            for p in parts:
                cs = candidates(p)
                if any(x in known_always for x in cs):
                    continue
                sets = [first[x] for x in cs if x in first]
                if not sets:
                    continue  # 표제어 밖 단어는 exaudit.py 몫
                s = min(sets)
                if s > c['set']:
                    fwd.append((p, s))
        c['fwd'] = sorted(set(fwd))
        res.append(c)
    return res


def band(s):
    return '0' if s == 0 else '1-4' if s <= 4 else '5' if s == 5 else '6-20' if s <= 20 else '21-45'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', type=int, default=0, help='앞당김이 이 수 이상인 예문을 나열한다')
    ap.add_argument('--set', type=int, help='이 세트만 나열한다')
    ap.add_argument('--json', help='결과 저장 경로')
    a = ap.parse_args()
    bw = json.loads((P / 'base-words.json').read_text(encoding='utf-8'))
    base = set(bw['words']) | set(bw.get('loanwords', []))
    first, cards = load()
    res = check(first, cards, base)
    tot, n1, n2, words = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
    for c in res:
        b = band(c['set'])
        tot[b] += 1
        k = len(c['fwd'])
        n1[b] += k == 1
        n2[b] += k >= 2
        for w, s in c['fwd']:
            words[(w, s)] += 1
    print('구간    카드  앞당김1  앞당김2+')
    for b in ('0', '1-4', '5', '6-20', '21-45'):
        print(f'{b:6s} {tot[b]:5d} {n1[b]:7d} {n2[b]:8d}')
    print(f"합계   {sum(tot.values()):5d} {sum(n1.values()):7d} {sum(n2.values()):8d}")
    print('자주 앞당겨지는 단어(처음 세트):', ', '.join(f'{w}({s}) {n}' for (w, s), n in words.most_common(20)))
    if a.list:
        for c in res:
            if len(c['fwd']) >= a.list and (a.set is None or c['set'] == a.set):
                print(f"{c['set']:2d} {c['word']}({c['si']}) {c['text']}  ← " + ', '.join(f'{w}({s})' for w, s in c['fwd']))
    if a.json:
        Path(a.json).write_text(json.dumps([dict(set=c['set'], ex=c['ex'], i=c['i'], word=c['word'], si=c['si'], text=c['text'], fwd=c['fwd']) for c in res if c['fwd']], ensure_ascii=False, indent=0) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
