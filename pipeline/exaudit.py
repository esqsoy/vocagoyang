#!/usr/bin/env python3
"""예문 어휘 감사 — 예문에 'Fable 표제어 밖 단어'가 섞였는지 본다.

audit.py의 어휘 통제는 LDV+used400+화이트리스트+0세트 기준이라 기초 세트를 다 덮지 못했다.
영신 기준(26.9.16): "꼭 세트에 맞춰갈 필요는 없다. Fable 단어 수준이면 된다."
→ 허용 = 전 세트 표제어 4,713 + 화이트리스트 + 불규칙 변화형 + 수사.
사용: python3 pipeline/exaudit.py   (레포 어디서 돌려도 된다)
26.9.16 기준 0~45세트 5,752장 전수 위반 0장."""
import re, json, glob, os, sys, collections
P='/home/user/vocagoyang/pipeline'
white=set(json.load(open(f'{P}/whitelist.json')))
NUMS=set("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion first second third fourth fifth".split())
IRR=set("was were is are am been being has had having does did done doing went gone goes going said says saw seen made got gotten took taken came gave given knew known thought told found felt kept left met ran sat stood heard held brought bought caught taught wore chose spoke spoken broke broken wrote written ate eaten drank drove driven fell fallen grew grown drew drawn flew threw thrown won lost paid sent spent built meant sold became children men women people feet teeth mice better best worse worst an froze frozen sank sunk swam swum rang rung sang sung bit bitten hid hidden shook shaken woke woken slid crept swept wept slept fed led bled bred bent lent spun stung strung swung hung dug stuck struck rode ridden rose risen shone shot sought fought bound ground wound blew withdrew forgave forgiven forgot forgotten chosen tore torn worn swore sworn bore borne began begun sprang sprung shrank shrunk stank laid lain lay dealt burnt learnt dreamt spat split spread shed hurt cut put set let hit quit read".split())

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
HEAD={ (w.get('word') or w.get('en') or '').lower() for _,_,w,_ in cards }
HEAD.discard('')
ALLOWED = HEAD | white | NUMS | IRR

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
    toks=re.findall(r"[A-Za-z][A-Za-z']*",body)
    miss=sorted({t for t in toks if not t[0].isupper() and not tok_ok(t)})
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
