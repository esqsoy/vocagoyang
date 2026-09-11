"""워크플로 결과(JSON: affix/roots/pairs 카드 배열) → out/set46.json, out/set47.json, fable/in/set46·47.json"""
import json,sys,os,re,collections
os.chdir('/home/claude/hoe-prod')
R=json.load(open(sys.argv[1]))
KEYS=['en','ko','ex','tr','c','ipa','pos','word','si','sn','meow']
AFFIX=['un-','re-','dis-','in-','im-','non-','pre-','mis-','over-','inter-','sub-','-ly','-ness','-ment','-tion','-sion','-er','-or','-able','-ible','-ful','-less','-ive','-ous','-al','-ize','-ity','-ship','-hood','-ward','-ish','-en','-ify','-ist']
ROOTS=['port','spect','dict','graph','scrib','script','vis','vid','aud','ject','duc','duct','mit','miss','fer','pos','pon','struct','tract','vert','vers','cede','ceed','cess','form','log','logy','meter','metr','bio','geo','chron','tele','phon','sens','sent']
def clean(c):
    d={k:c[k] for k in KEYS if k in c and c[k] not in (None,'')}
    d['en']=d['word']=c['word'].strip(); d['si']=int(c['si']); d['sn']=int(c['sn']); return d
def by_word(cards,order):
    g=collections.OrderedDict((w,[]) for w in order)
    for c in cards:
        w=c['word'].strip()
        if w in g: g[w].append(c)
        else: print('명단 밖 표제어(버림):',w)
    out=[]
    for w,cs in g.items():
        cs=sorted(cs,key=lambda c:int(c['si']))
        for i,c in enumerate(cs,1): c['si']=i; c['sn']=len(cs)
        if not cs: print('카드 없음:',w)
        out.append((w,[clean(c) for c in cs]))
    return out
def exercises(groups,sizes,names):
    exs=[];i=0
    for n,(sz,nm) in enumerate(zip(sizes,names),1):
        ws=[c for w,cs in groups[i:i+sz] for c in cs]; exs.append({"ex":n,"name":nm,"words":ws}); i+=sz
    return exs
A=by_word(R['affix'],AFFIX); Rt=by_word(R['roots'],ROOTS)
pairs=[clean(c) for c in R['pairs']]
for c in pairs: c['si']=1; c['sn']=1
s46=exercises(A,[11,12,11],["접두사 un~sub","접미사 -ly~-ous","접미사 -al~-ist"])
s47=exercises(Rt,[12,12,12],["어근 port~duct","어근 mit~cess","어근 form~sent"])+[{"ex":4,"name":"사촌 쌍 — 그림 법칙","words":pairs}]
json.dump(s46,open('out/set46.json','w'),ensure_ascii=False,indent=0); json.dump(s47,open('out/set47.json','w'),ensure_ascii=False,indent=0)
# 명단: word 순서 + preview 단어(어휘 통제 허용)
prev47=sorted({c['word'] for c in R['roots']+R['pairs'] if c.get('preview')})
# 어근 카드의 예문 파생어 자체는 빈칸 처리로 감사에서 빠지므로 preview는 사촌 쌍 표제어만 의미 있음
json.dump([{"word":w,"src":["morph:affix"]} for w in AFFIX],open('fable/in/set46.json','w'),ensure_ascii=False,indent=0)
json.dump([{"word":w,"src":["morph:root"]} for w in ROOTS]+[{"word":c['word'],"src":["morph:pair"],"preview":[c['word']]} for c in pairs],open('fable/in/set47.json','w'),ensure_ascii=False,indent=0)
n46=sum(len(e['words']) for e in s46); n47=sum(len(e['words']) for e in s47)
print('set46 cards',n46,'meow',sum(1 for e in s46 for w in e['words'] if w.get('meow')),'| set47 cards',n47,'meow',sum(1 for e in s47 for w in e['words'] if w.get('meow')),'| preview',len(prev47))
