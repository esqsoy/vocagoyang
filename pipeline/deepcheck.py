#!/usr/bin/env python3
"""완성도 전수 검사 — 4절(중의성)·exaudit(어휘) 밖의 기준들 (26.9.17)
   A1 si/sn 무결성 · A2 IPA 일관성 · A3 pos↔빈칸 자리 · A5 예문 교차 중복 · A6 형식 규칙
   (A4 tr↔뜻 대응은 설계에 실패해 폐기 — 아래 주석)
사용: python3 pipeline/deepcheck.py [--list A3 A4 ...]"""
import json,glob,re,os,sys,collections
P=os.path.join(os.path.dirname(os.path.abspath(__file__)))
def load():
    fs=sorted(glob.glob(f'{P}/out/lesson0[0-4].json'))+sorted(
        glob.glob(f'{P}/out/set*.json'),key=lambda f:int(re.search(r'set(\d+)',f).group(1)))
    for f in fs:
        d=json.load(open(f)); exs=d['exercises'] if isinstance(d,dict) else d
        ln=int(re.search(r'(\d+)',os.path.basename(f)).group(1))
        for ex in exs:
            for w in ex.get('words',[]): yield ln,ex.get('name','?'),w
cards=list(load())
CIRC=re.compile(r'^[①-⑳\s]+')
def sg(ko):
    ko=re.sub(r'\(.*?\)','',ko or ''); out=[]
    for g in re.split(r'[,;/·]|또는',ko):
        g=CIRC.sub('',g); g=re.sub(r'\s+',' ',g).strip()
        if len(g)>=2: out.append(g)
    return out
F=collections.defaultdict(list)          # 기준 -> [(세트, 단어, 설명)]

# ── A1 si/sn 무결성
by=collections.defaultdict(list)
for ln,_,w in cards: by[w.get('word')].append((ln,w))
for word,lst in by.items():
    if any(l>=46 for l,_ in lst): continue
    sis=sorted(w.get('si') or 0 for _,w in lst)
    sns={w.get('sn') for _,w in lst}
    n=len(lst)
    if sis!=list(range(1,n+1)):
        F['A1'].append((lst[0][0],word,f"si가 {sis} (카드 {n}장)"))
    if sns!={n}:
        F['A1'].append((lst[0][0],word,f"sn이 {sorted(sns)}인데 카드는 {n}장"))

# ── A2 IPA 일관성 (품사가 같은데 발음이 다른 경우만)
# 동철이음어는 뜻마다 발음이 갈리는 것이 맞다 — 실측으로 확인한 것만 면제한다.
#   address 주소 ˈædrɛs / 연설 əˈdrɛs · aged 나이가 ~인 eɪdʒd / 나이 든 ˈeɪdʒɪd
#   bass 저음 beɪs / 농어 bæs · primer 밑칠 ˈpraɪmɚ / 입문서 ˈprɪmɚ
HETERO={'address','aged','bass','primer'}
for word,lst in by.items():
    if word in HETERO: continue
    if any(l>=46 for l,_ in lst): continue
    bypos=collections.defaultdict(set)
    for _,w in lst: bypos[w.get('pos')].add((w.get('ipa') or '').strip())
    for pos,ip in bypos.items():
        if len(ip)>1: F['A2'].append((lst[0][0],word,f"{pos} 안에서 ipa가 {sorted(ip)}"))

# ── A3 pos ↔ 빈칸 자리
# 'that'·'one'은 여기서 한정사가 아니라 주어다(That sounds…, No one objected…) — 뺀다.
DET=r"(a|an|the|my|your|his|her|its|our|their|these|those|some|any|every|each|another)"
for ln,exn,w in cards:
    if ln>=46: continue
    ex=w.get('ex') or ''; pos=(w.get('pos') or '').rstrip('.')
    m=re.search(r'(\S+)?\s*\{\{BLANK\}\}(\w*)',ex)
    if not m: continue
    before=(m.group(1) or '').lower().strip('.,!?;:"\'')
    after=m.group(2)
    # 'to + 명사'는 부정사가 아니라 전치사다(go to school, listen to music) — to는 보지 않는다.
    if pos in ('n','pron') and before in ('will','can','should','must','might','would','may',"don't","doesn't","didn't","let's"):
        F['A3'].append((ln,f"{w['word']}({w.get('si')})",f"{pos}인데 앞이 '{before}' → 동사 자리 | {ex}"))
    # 한정사 + 동사-ing는 동명사다: "By my reckoning" — 자리가 틀린 게 아니다.
    if pos=='v' and re.fullmatch(DET,before or '') and after!='ing':
        F['A3'].append((ln,f"{w['word']}({w.get('si')})",f"v인데 앞이 한정사 '{before}' → 명사 자리 | {ex}"))
    if pos=='adj' and before in ('will','can',"don't"):
        F['A3'].append((ln,f"{w['word']}({w.get('si')})",f"adj인데 앞이 '{before}' | {ex}"))

# ── A4 (폐기) tr ↔ 뜻 대응
# 번역에 카드 뜻의 흔적이 있는지 문자열로 재려 했으나 실패했다. '일곱'을 "7시 30분"으로,
# '모두'를 "다들"로, '지루해하는'을 "심심해"로 옮긴 멀쩡한 번역이 1,269건 걸렸다.
# 한국어의 형태 변화와 자연스러운 의역은 부분 문자열로 못 잡는다. 이 기준은 사람이 읽어야 한다.

# ── A5 예문 교차 중복
seen=collections.defaultdict(list)
for ln,exn,w in cards:
    if ln>=46: continue
    k=re.sub(r'\s+',' ',(w.get('ex') or '')).strip().lower()
    if k: seen[k].append((ln,w.get('word'),w.get('si')))
for k,v in seen.items():
    if len(v)>1 and len({x[1] for x in v})>1:
        F['A5'].append((v[0][0],'/'.join(f"{a}{b}({c})" for a,b,c in v),k[:60]))

# ── A6 형식
for ln,exn,w in cards:
    c=w.get('c') or ''; m=w.get('meow') or ''
    tag=f"{w.get('word')}({w.get('si')})"
    if len(c)>72: F['A6'].append((ln,tag,f"해설 {len(c)}자"))
    if m:
        if len(m)>48: F['A6'].append((ln,tag,f"meow {len(m)}자"))
        if '고양' not in m: F['A6'].append((ln,tag,f"meow 고양체 아님: {m[:24]}"))
    nw=len(re.findall(r"[A-Za-z'{}]+",w.get('ex') or ''))
    if nw>10: F['A6'].append((ln,tag,f"예문 {nw}단어"))

NAME={'A1':'si/sn 무결성','A2':'IPA 일관성','A3':'pos↔빈칸 자리',
      'A5':'예문 교차 중복','A6':'형식 규칙'}
print(f"어휘 카드 {sum(1 for l,_,_ in cards if l<46)}장 검사\n")
for k in ('A1','A2','A3','A5','A6'):
    print(f"  {k} {NAME[k]:<12} {len(F[k])}건")
want=[a for a in sys.argv[1:] if a in NAME]
for k in want:
    print(f"\n── {k} {NAME[k]} ({len(F[k])}건)")
    for ln,tag,msg in F[k]: print(f"  {ln:>2}세트 {tag} — {msg}")
