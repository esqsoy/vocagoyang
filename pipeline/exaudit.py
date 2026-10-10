#!/usr/bin/env python3
"""예문 어휘 감사 — 예문에 'Fable 표제어 밖 단어'가 섞였는지 본다.

audit.py의 어휘 통제는 LDV+used400+화이트리스트+0세트 기준이라 기초 세트를 다 덮지 못했다.
영신 기준(26.9.16): "꼭 세트에 맞춰갈 필요는 없다. Fable 단어 수준이면 된다."
→ 허용 = 전 세트 표제어 4,713 + 화이트리스트 + 불규칙 변화형 + 수사.
사용: python3 pipeline/exaudit.py   (레포 어디서 돌려도 된다)
26.9.16 기준 0~45세트 5,752장 전수 위반 0장.

26.10.08 영신 재확인: "통제는 필요해. 한계도 필요해." 예문은 이제 기억할 지식을 담는 도구다.
그런데 학생이 모르는 단어가 섞이면 그 지식이 읽히지 않는다. 그래서 이 검사는 경고등으로 계속 돈다.
판정은 사람이 한다(고유한 지식어 하나 정도는 허용할 수 있다). 다만 경고가 0에서 늘면 반드시 본다.
26.9.19~10.8 사이 SPEC이 "과거 명세"로 분류되며 이 검사가 빠졌고, 0장이던 이탈이 36장이 됐다."""
import re, json, glob, os, sys, collections
import os as _os
P=_os.path.dirname(_os.path.abspath(__file__))
white=set(json.load(open(f'{P}/whitelist.json')))
NUMS=set("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion first second third fourth fifth".split())
IRR=set("understood kitty was were is are am been being has had having does did done doing went gone goes going said says saw seen made got gotten took taken came gave given knew known thought told found felt kept left met ran sat stood heard held brought bought caught taught wore chose spoke spoken broke broken wrote written ate eaten drank drove driven fell fallen grew grown drew drawn flew threw thrown won lost paid sent spent built meant sold became children men women people feet teeth mice better best worse worst an froze frozen sank sunk swam swum rang rung sang sung bit bitten hid hidden shook shaken woke woken slid crept swept wept slept fed led bled bred bent lent spun stung strung swung hung dug stuck struck rode ridden rose risen shone shot sought fought bound ground wound blew withdrew forgave forgiven forgot forgotten chosen tore torn worn swore sworn bore borne began begun sprang sprung shrank shrunk stank laid lain lay dealt burnt learnt dreamt spat split spread shed hurt cut put set let hit quit read".split())

def load():
    fs=sorted(glob.glob(f'{P}/out/lesson0[0-4].json'))+sorted(glob.glob(f'{P}/out/set*.json'),
              key=lambda f:int(re.search(r'set(\d+)',f).group(1)))
    out=[]
    for f in fs:
        d=json.load(open(f))
        exs=d['exercises'] if isinstance(d,dict) else d
        n=os.path.basename(f)
        ln=int(re.search(r'(\d+)',n).group(1))
        for ex in exs:
            for w in ex.get('words',[]):
                out.append((ln,ex.get('name','?'),w,f))
    return out

cards=load()
# 26.10.10 표제어 정리(PRINCIPLES 2-8): 화면에서 뺀 단어는 원본에 남아 있어도 표제어로 치지 않는다.
PRUNED=set()
for _f in glob.glob(f'{P}/prune-2*.json'):
    PRUNED|={w.lower() for w in json.load(open(_f,encoding='utf-8'))['words']}
cards=[c for c in cards if (c[2].get('word') or c[2].get('en') or '').lower() not in PRUNED]
HEAD={ (w.get('word') or w.get('en') or '').lower() for _,_,w,_ in cards }
HEAD.discard('')
# 46~50세트는 set*.json이 아니라 별도 원본에서 조립되므로 HTML DATA에서 표제어를 보탠다(26.10.08).
try:
    _h=open(_os.path.join(_os.path.dirname(P),'vocagoyangfable.html'),encoding='utf-8').read()
    for _L in json.loads(re.search(r'const DATA = (\[.*?\]);\n',_h,re.S).group(1)):
        for _e in _L['exercises']:
            for _w in _e['words']:
                for _k in ('word','en'):
                    _v=(_w.get(_k) or '').lower().strip()
                    if _v: HEAD.add(_v); HEAD.update(_v.split())
except Exception as _err: print('주의: HTML 표제어를 읽지 못함', _err)
# 26.10.10 Oxford 3000 보강 배치안: 자리를 정한 새 표제어는 예문에 미리 쓸 수 있다(순서는 ordercheck.py가 본다).
PLANNED=set()
try:
    for _f in sorted(glob.glob(f'{P}/oxford/placement-*.json')):
        _d=json.load(open(_f,encoding='utf-8'))
        for _w in _d.get('words',[])+_d.get('set0',[]):
            _v=_w['word'].lower(); PLANNED.add(_v); PLANNED.update(_v.split())
except Exception as _err: print('주의: Oxford 배치안을 읽지 못함', _err)
ALLOWED = (HEAD | white | NUMS | IRR | PLANNED) - PRUNED

def tok_ok(t):
    t=t.lower().strip("'")
    t={"can't":"can","won't":"will","shan't":"shall","ain't":"be"}.get(t,t)
    t=re.sub(r"(n't|'s|'re|'ll|'ve|'m|'d)$","",t)
    if not t or not re.match(r"^[a-z-]+$",t): return True
    if t in ALLOWED: return True
    if '-' in t and all(p in ALLOWED for p in t.split('-') if p): return True
    for suf in ("s","es","ed","d","ing","er","est","ly","r","st","ies","ier","iest"):
        if t.endswith(suf):
            b=t[:-len(suf)]
            c=[b,b+"e"]
            if len(b)>2 and b[-1]==b[-2]: c.append(b[:-1])
            if b.endswith("i"): c.append(b[:-1]+"y")
            if suf in ("ies","ier","iest"): c.append(b+"y")
            if any(x in ALLOWED for x in c): return True
    return False

bad=collections.defaultdict(list)
tally=collections.Counter()
for ln,exname,w,f in cards:
    if ln>=46: continue                      # 형태론 세트는 규칙이 다르다
    exs=w.get('ex','') or ''
    # 빈칸에 붙은 앞뒤 조각과 뒤따르는 축약(-'s, -n't …)까지 함께 지운다
    body=re.sub(r"[A-Za-z']*\{\{BLANK\}\}[a-z]*(?:'[a-z]+|n't)?",' ',exs)
    body=re.sub(r"\b\d+[A-Za-z]*",' ',body)   # 1800s·18th·3x의 s/th/x 조각 제거
    toks=re.findall(r"[A-Za-z][A-Za-z']*",body)
    miss=sorted({t for t in toks if len(t)>1 and not t[0].isupper() and not tok_ok(t)})  # 한 글자(수식의 x 등)는 단어가 아니다
    if miss:
        bad[ln].append((w.get('word') or w.get('en'), w.get('si'), miss, exs))
        for m in miss: tally[m]+=1

tot=sum(len(v) for v in bad.values())
print(f"표제어 {len(HEAD)}개 + 화이트리스트/불규칙/수사 를 기준으로")
print(f"0~45세트 예문 중 기준 밖 단어가 섞인 카드: {tot}장\n")
for ln in sorted(bad):
    print(f"── {ln}세트 ({len(bad[ln])}장)")
    for word,si,miss,exs in bad[ln][:60]:
        print(f"   {word}({si}) {miss} │ {exs}")
print("\n기준 밖 단어 빈도순:")
for t,n in tally.most_common(60): print(f"   {t} ×{n}")
