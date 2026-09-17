#!/usr/bin/env python3
"""빈칸 중의성 기계 조사 (2차) — 카드의 한국어 뜻이 '통째로' 다른 표제어에도 들어맞는가"""
import json,glob,re,os,collections,sys
P='/home/user/vocagoyang/pipeline'
def load():
    fs=sorted(glob.glob(f'{P}/out/lesson0[0-4].json'))+sorted(glob.glob(f'{P}/out/set*.json'),key=lambda f:int(re.search(r'set(\d+)',f).group(1)))
    for f in fs:
        d=json.load(open(f)); exs=d['exercises'] if isinstance(d,dict) else d
        ln=int(re.search(r'(\d+)',os.path.basename(f)).group(1))
        for ex in exs:
            for w in ex.get('words',[]): yield ln,ex.get('name','?'),w
CIRC=re.compile(r'^[①-⑳\s]+')
def sg(ko):
    ko=re.sub(r'\(.*?\)','',ko or ''); out=[]
    for g in re.split(r'[,;/·]|또는',ko):
        g=CIRC.sub('',g); g=re.sub(r'\s+',' ',g).strip()
        if len(g)>=2: out.append(g)
    return out
def norm(v):
    v=re.sub(r"['’]","",(v or '').lower()); v=re.sub(r"[-/]"," ",v)
    return re.sub(r'\s+',' ',v).strip()

ALT=json.load(open('/tmp/claude-0/-home-user-vocagoyang/6607e389-d1a5-5ab0-98ca-41fad42d433a/scratchpad/alt.json'))
cards=[c for c in load() if c[0]<46]
SENSES=collections.defaultdict(list)          # 표제어 -> [(pos, frozenset(조각))]
BYFRAG=collections.defaultdict(set)           # 조각 -> {표제어}
WHERE={}
for ln,_,w in cards:
    t=norm(w.get('word') or w.get('en') or '')
    if not t: continue
    WHERE.setdefault(t,ln)
    fr=frozenset(sg(w.get('ko','')))
    SENSES[t].append((w.get('pos') or '',fr))
    for g in fr: BYFRAG[g].add(t)

rows=[]
for ln,exn,w in cards:
    t=norm(w.get('word') or w.get('en') or ''); pos=w.get('pos') or ''
    mine=set(sg(w.get('ko','')))
    if not mine: continue
    cand=set.intersection(*[BYFRAG[g] for g in mine]) if mine else set()
    ex=(w.get('ex') or '').lower()
    note=(w.get('c') or '').lower()
    ok=set(norm(x) for x in ALT.get(f"{w.get('word')}/{w.get('si')}",[]))   # 이미 정답으로 받아 주는 말
    # 빈칸 바로 앞의 관사가 맞수를 걸러 준다: "A {{BLANK}}"에는 officer가 못 들어간다
    m=re.search(r'\b(a|an)\s+\{\{blank\}\}',ex)      # ex는 소문자로 내려와 있다
    art=m.group(1) if m else None
    rv=[]
    for r in cand:
        if r==t: continue
        if r in ok: continue                                          # 별칭표에 있으면 결함이 아니다 — 쳐도 정답
        if re.search(r'\b'+re.escape(r)+r'\b',ex): continue          # 이미 예문에 쓰인 단어는 답일 수 없다
        # 해설이 이미 그 단어와 대비해 놨는가. \b는 "examination의"에서 안 먹는다 —
        # 한글도 \w라서 n과 의 사이에 경계가 안 생긴다. 알파벳으로만 경계를 잡는다.
        if re.search(r'(?<![a-z])'+re.escape(r)+r'(?![a-z])',note): continue
        if art and (r[0] in 'aeiou')!=(art=='an'): continue            # a/an 불일치
        if any(p==pos and mine<=set(fr) for p,fr in SENSES[r]): rv.append(r)
    if rv: rows.append((ln,exn,w,sorted(rv)))

print(f"0~45세트 {len(cards)}장 중, 한국어 뜻이 통째로 다른 표제어에도 들어맞는 카드: {len(rows)}장")
c=collections.Counter(r[0] for r in rows)
print("세트별 " + " ".join(f"{k}:{v}" for k,v in sorted(c.items())))
out=[{'set':ln,'ex_name':exn,'word':w.get('word'),'si':w.get('si'),'pos':w.get('pos'),
      'ko':w.get('ko'),'ex':w.get('ex'),'tr':w.get('tr'),'c':w.get('c') or '',
      'rivals':[{'w':r,'set':WHERE[r]} for r in rv]} for ln,exn,w,rv in rows]
json.dump(out,open('/tmp/claude-0/-home-user-vocagoyang/6607e389-d1a5-5ab0-98ca-41fad42d433a/scratchpad/collisions.json','w'),ensure_ascii=False,indent=1)
if '--list' in sys.argv:
    only=[int(a.split('=')[1]) for a in sys.argv if a.startswith('--set=')]
    for ln,exn,w,rv in rows:
        if only and ln not in only: continue
        print(f"\n{ln}세트 {w.get('word')}({w.get('si')}) {w.get('pos')} \"{w.get('ko')}\" ← {', '.join(rv)}")
        print(f"   {w.get('ex')}")
        print(f"   {w.get('tr')}")
