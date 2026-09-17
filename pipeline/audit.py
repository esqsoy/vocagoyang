#!/usr/bin/env python3
"""보카고양 HoE 기계 감사기 — 사용: python3 audit.py out/set05.json [--fix-report]"""
import os as _os
P = _os.path.dirname(_os.path.abspath(__file__))          # pipeline/
REPO = _os.path.dirname(P)                                  # 레포 루트
HTMLPATH = _os.path.join(REPO, 'vocagoyangfable.html')
import re, json, sys

allowed_data = json.load(open(f'{P}/allowed.json'))
white = set(json.load(open(f'{P}/whitelist.json')))
ALLOWED = set(allowed_data['ldv']) | set(allowed_data['used400']) | white | set(allowed_data.get('set0',[]))
NUMS = set("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million first second third fourth fifth".split())
IRR = set("was were is are am been being has had having does did done doing went gone goes going said says saw seen made got gotten took taken came gave given knew known thought told found felt kept left met ran sat stood heard held brought bought caught taught wore chose spoke spoken broke broken wrote written ate eaten drank drove driven fell fallen grew grown drew drawn flew threw thrown won lost paid sent spent built meant sold became children men women people feet teeth mice better best worse worst an froze frozen sank sunk swam swum rang rung sang sung bit bitten hid hidden shook shaken woke woken slid crept swept wept slept fed led bled bred bent lent spun stung strung swung hung dug stuck struck rode ridden rose risen shone shot sought fought bound ground wound blew grew threw withdrew forgave forgiven forgot forgotten chose chosen tore torn wore worn swore sworn bore borne began begun sprang sprung sank shrank shrunk stank stuck laid lain lay dealt burnt learnt dreamt spat split spread shed hurt cut put set let hit quit read".split())

def tok_ok(t):
    t = t.lower().strip("'")
    t = {"can't": "can", "won't": "will", "shan't": "shall", "ain't": "be"}.get(t, t)
    t = re.sub(r"(n't|'s|'re|'ll|'ve|'m|'d)$", "", t)
    if not t or not re.match(r"^[a-z-]+$", t): return True
    if t in ALLOWED or t in IRR or t in NUMS: return True
    for suf in ("s","es","ed","d","ing","er","est","ly","r","st"):
        if t.endswith(suf):
            b = t[:-len(suf)]
            cands = [b, b+"e"]
            if len(b) > 2 and b[-1] == b[-2]: cands.append(b[:-1])
            if b.endswith("i"): cands.append(b[:-1]+"y")
            if any(c in ALLOWED or c in IRR or c in NUMS for c in cands): return True
    return False

def audit(path, expected_words=None):
    data = json.load(open(path))
    problems = []
    words_seen = []
    ncards = 0
    meow_count = 0
    seen_key, seen_ex, seen_ko = set(), {}, set()
    for ei, ex in enumerate(data):
        for w in ex.get('words', []):
            ncards += 1
            wd = w.get('word','?')
            tag = f"[{ex.get('name','?')}] {wd}({w.get('si')})"
            # 중복 검사(헌장 제5조): 같은 단어·뜻 번호, 같은 단어·같은 뜻, 같은 예문
            key = (wd, w.get('si'))
            if key in seen_key: problems.append(f"{tag} 중복 카드(단어·뜻 번호)")
            seen_key.add(key)
            kok = (wd, re.sub(r'^[①-⑩]\s*', '', w.get('ko','')).strip())
            if kok in seen_ko and w.get('pos') not in ('pref.','suf.','root'): problems.append(f"{tag} 같은 단어에 같은 뜻 두 번: {kok[1][:20]}")
            seen_ko.add(kok)
            exn = re.sub(r'\s+', ' ', w.get('ex','')).strip().lower()
            if exn in seen_ex and seen_ex[exn] != wd: problems.append(f"{tag} 예문 중복({seen_ex[exn]}와 동일)")
            seen_ex.setdefault(exn, wd)
            if wd not in words_seen: words_seen.append(wd)
            exs = w.get('ex','')
            if '{{BLANK}}' not in exs: problems.append(f"{tag} 빈칸 없음")
            nw = len(re.findall(r"[A-Za-z'{}]+", exs))
            if nw > 10: problems.append(f"{tag} 예문 {nw}단어 초과: {exs[:40]}")
            c = w.get('c') or ''
            if len(c) > 72: problems.append(f"{tag} 해설 {len(c)}자 초과")
            m = w.get('meow')
            if m:
                meow_count += 1
                if len(m) > 48: problems.append(f"{tag} meow {len(m)}자 초과")
                if '고양' not in m: problems.append(f"{tag} meow 고양체 아님: {m[:30]}")
            body = re.sub(r"[A-Za-z']*\{\{BLANK\}\}[a-z]*", ' ', exs)   # 빈칸에 붙은 앞뒤 조각(educa{{BLANK}}, re{{BLANK}}, {{BLANK}}ing)은 단어가 아님
            toks = re.findall(r"[A-Za-z][A-Za-z']*", body)
            bad = sorted(set(t for t in toks if not t[0].isupper() and not tok_ok(t)))
            if bad: problems.append(f"{tag} 예문 어휘 위반: {bad} | {exs[:45]}")
            if not w.get('ipa'): problems.append(f"{tag} ipa 없음")
            if not w.get('tr'): problems.append(f"{tag} tr 없음")
            if not w.get('pos'): problems.append(f"{tag} pos 없음")
    if expected_words is not None:
        missing = [w for w in expected_words if w not in words_seen]
        extra = [w for w in words_seen if w not in expected_words]
        if missing: problems.append(f"누락 단어 {len(missing)}: {missing[:10]}")
        if extra: problems.append(f"명단 외 단어: {extra[:10]}")
        # 순서 검사
        idx = [expected_words.index(w) for w in words_seen if w in expected_words]
        if idx != sorted(idx): problems.append("단어 순서가 입력 순서와 다름")
    return ncards, len(words_seen), meow_count, problems

def dups_all():
    """--dups: 전 세트 교차 중복 — 같은 표제어가 여러 세트에, 같은 예문이 여러 카드에"""
    import glob, collections
    files = sorted(glob.glob(f'{P}/out/lesson0[0-4].json')) + sorted(f for f in glob.glob(f'{P}/out/set*.json') if int(re.search(r'set(\d+)', f).group(1)) < 46)  # 46·47 형태론 세트는 재등장이 목적이라 제외
    where, exwhere = collections.defaultdict(list), collections.defaultdict(list)
    for f in files:
        o = json.load(open(f)); exs = o['exercises'] if isinstance(o, dict) else o
        name = f.split('/')[-1][:-5]
        for e in exs:
            for w in e['words']:
                where[w['word']].append(name)
                exwhere[re.sub(r'\s+', ' ', w['ex']).strip().lower()].append(f"{name}:{w['word']}/{w['si']}")
    cross = {w: sorted(set(v)) for w, v in where.items() if len(set(v)) > 1}
    exd = {e: v for e, v in exwhere.items() if len(v) > 1}
    print(f"표제어 교차 세트 {len(cross)}: " + ", ".join(f"{w}({'·'.join(s)})" for w, s in sorted(cross.items())[:60]))
    print(f"예문 중복 {len(exd)}:"); [print("  -", v) for v in list(exd.values())[:40]]

if __name__ == '__main__':
    if sys.argv[1] == '--dups': dups_all(); sys.exit()
    path = sys.argv[1]
    setno = int(re.search(r'set(\d+)', path).group(1))
    if setno >= 46:   # 형태론 세트(접사·어근): Fable 전체 표제어 + 명단의 preview 단어 허용
        fab = allowed_data.get('fable', {})
        ALLOWED |= set(fab)
        spec = json.load(open(f'{P}/fable/in/set{setno}.json'))
        for x in spec: ALLOWED |= set(x.get('preview', []))
        expected = [x['word'] for x in spec]
    elif setno >= 23:
        fab = allowed_data.get('fable', {})
        ALLOWED |= {w for w, s in fab.items() if s <= setno}
        expected = [x['word'] for x in json.load(open(f'{P}/fable/in/set{setno}.json'))]
    else:
        sets = json.load(open(f'{P}/sets.json'))
        expected = sets[setno-5]
    n, u, m, probs = audit(path, expected)
    print(f"{path}: 카드 {n} · 단어 {u} · meow {m} · 문제 {len(probs)}")
    for p in probs[:40]: print("  -", p)
