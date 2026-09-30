"""Apply the approved, authored 327-card curriculum; never regenerate prose."""
from pathlib import Path
import copy
import hashlib
import json
import re
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p,v): p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def digest(v): return hashlib.sha256(json.dumps(v,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def data_from_html(): return json.loads(re.search(r'const DATA = (\[.*?\]);\r?\n',(ROOT/'vocagoyangfable.html').read_text(encoding='utf-8'),re.S)[1])
plan = read(HERE/'curriculum.json')
before = read(HERE/'before-morphology.json')
before_lessons = read(HERE/'before-lessons.json')
current = data_from_html()
baseline = copy.deepcopy(current)
for old in before_lessons: baseline[old['lesson']] = old
assert digest(baseline)==plan['baselineDataSha256'], 'Unrelated DATA changed since proposal; review before applying'
if (HERE/'findings.json').exists():
    assert digest(current) in (plan['baselineDataSha256'],read(HERE/'findings.json')['afterDataSha256'])
    assert digest(read(ROOT/'pipeline/morphology.json'))==read(HERE/'findings.json')['afterMorphologySha256'], 'Canonical morphology changed independently; do not replay this historical patch'
else:
    assert digest(current)==plan['baselineDataSha256']

# US dictionary pronunciations checked against Collins individual entries.
# Reused headwords retain their selected existing pronunciation below.
new_ipa = dict(row.split('|') for row in '''intercellular|ˌɪntərˈsɛljələr
import|ɪmˈpɔrt
postpone|poʊstˈpoʊn
counteract|ˌkaʊntərˈækt
malfunction|mælˈfʌŋkʃən
symmetry|ˈsɪmətri
asymmetry|eɪˈsɪmətri
homogeneous|ˌhoʊməˈdʒiniəs
heterogeneous|ˌhɛtərəˈdʒiniəs
hyperactive|ˌhaɪpərˈæktɪv
hypothermia|ˌhaɪpoʊˈθɜrmiə
macroscopic|ˌmækroʊˈskɑpɪk
microeconomics|ˌmaɪkroʊˌɛkəˈnɑmɪks
macroeconomics|ˌmækroʊˌɛkəˈnɑmɪks
monologue|ˈmɑnəˌlɔɡ
monolingual|ˌmɑnoʊˈlɪŋɡwəl
multilingual|ˌmʌltɪˈlɪŋɡwəl
polygon|ˈpɑlɪˌɡɑn
quadrant|ˈkwɑdrənt
pentagon|ˈpɛntəˌɡɑn
hexagon|ˈhɛksəˌɡɑn
octopus|ˈɑktəpəs
decade|ˈdɛkˌeɪd
millennium|mɪˈlɛniəm
semicircle|ˈsɛmɪˌsɜrkəl
hemisphere|ˈhɛmɪˌsfɪr
exclude|ɪkˈsklud
evolve|ɪˈvɑlv
involve|ɪnˈvɑlv
valid|ˈvælɪd
revive|rɪˈvaɪv
vital|ˈvaɪtəl
manual|ˈmænjuəl
temporary|ˈtɛmpəˌrɛri
contemporary|kənˈtɛmpəˌrɛri
dehydrate|diˈhaɪˌdreɪt
aquatic|əˈkwɑtɪk'''.splitlines())
assert set(new_ipa)==set(plan.get('approvedNewHeadwords',plan.get('newHeadwordsAwaitingApproval',[])))
pool = {}
for L in baseline:
    for e in L['exercises']:
        for i,w in enumerate(e['words']):
            pool.setdefault(w['word'].casefold(),[]).append((L['lesson'],e['ex'],i,w))

# Explicit choices after reading every candidate meaning. All other reused
# heads have only one matching sense/POS, or select their sense 1 as reviewed.
selected_sense={'depend':2,'nature':2,'provoke':2,'uniform':2}
cards={}
provenance=[]
for row in (HERE/'cards.txt').read_text(encoding='utf-8').splitlines():
    if not row or row.startswith('#'): continue
    word,pos,ko,ex,tr,c=row.split('|')
    assert word not in cards
    card=dict(word=word,en=word,ko=ko,ex=ex,tr=tr,c=c,pos=pos)
    if word in new_ipa:
        card['ipa']=new_ipa[word]
        provenance.append({'word':word,'type':'new_headword','pronunciationSource':'https://www.collinsdictionary.com/dictionary/english/'+word})
    else:
        refs=pool[word.casefold()]
        # Decimal is an approved new grammatical use of an existing headword.
        chosen=[r for r in refs if r[3]['si']==selected_sense.get(word,1) and (r[3]['pos']==pos or word=='decimal')]
        chosen=[r for r in chosen if r[0]<46]
        assert len(chosen)==1,(word,chosen)
        L,e,i,w=chosen[0]
        card['ipa']=w['ipa']
        provenance.append({'word':word,'type':'existing_pool_review','source':{'lesson':L,'exercise':e,'index':i,'si':w['si'],'ko':w['ko'],'pos':w['pos']},'useNote':'어원 복습용 예문·해설을 새로 작성. 원래 카드는 유지.'})
    assert ex.count('{{BLANK}}')==1,word
    assert len(ex.replace('{{BLANK}}',word).split())<=10,(word,ex)
    assert len(c)<=70,(word,len(c))
    cards[word]=card
assert set(cards)=={c['word'] for u in plan['additionalUnitsAndCards'] for c in u['cards']}
assert len(cards)==160

metadata={}
for row in (HERE/'unit-history.txt').read_text(encoding='utf-8').splitlines():
    if not row or row.startswith('#'): continue
    uid,kind,forms,meaning,origin,route,limits,greek,romanization=row.split('|')
    history=dict(origin=origin,route=route,notes='전사는 고대 원형을 로마자로 옮긴 것이다. 현대 영어 발음은 각 카드의 IPA로 확인한다.')
    if greek:
        history.update(greek=greek,romanization=romanization,reading='위 원문 전사는 고대어 철자의 안내다. 현대 영어 결합형의 발음은 단어와 강세에 따라 달라진다.')
    metadata[uid]=dict(kind=kind,forms=[dict(form=forms,meaning=meaning,pronunciationNote='고정 IPA를 부여하지 않는 결합형 비교. 실제 단어의 IPA 참조.')],rule=meaning+'의 연결을 실제 단어의 뜻·용법과 함께 확인한다.',limits=limits,history=history)

morph=copy.deepcopy(before)
by_id={u['id']:u for u in morph['units']}
for proposed in plan['additionalUnitsAndCards']:
    uid=proposed['id']
    if uid not in by_id:
        u=dict(id=uid,title=proposed['title'],**metadata[uid],sources=[proposed['representativeSource']],cards=[])
        morph['units'].append(u);by_id[uid]=u
    else:
        u=by_id[uid]
        if proposed['representativeSource'] not in u['sources']: u['sources'].append(proposed['representativeSource'])
    u['cards'].extend(copy.deepcopy(cards[c['word']]) for c in proposed['cards'])

micro=by_id['gr-micro']
micro['title']='micro- / macro- · 미시와 거시'
micro['forms'].append({'form':'macro-','meaning':'큰 규모의','englishIpa':'/ˈmækroʊ/'})
micro['rule']='micro-는 작은 규모, macro-는 큰 규모를 나타낸다. 육안 관찰과 경제 분석에서 대비한다.'
micro['history'].update(origin='고대 그리스어 μικρός(작은), μακρός(긴·큰).',greek='μικρός; μακρός',romanization='mikros; makros',reading='원문 전사는 mikros/makros. 현대 영어 micro- /ˈmaɪkroʊ/, macro- /ˈmækroʊ/.',route='그리스계 결합형이 근대 과학어와 경제학 용어에 쓰였다. microbe는 프랑스어 조어를 거쳤다.')
micro['sources']+=['https://www.etymonline.com/word/macro-','https://www.bipm.org/en/measurement-units/si-prefixes']
by_id['add-half-units']['sources'].append('https://www.bipm.org/en/measurement-units/si-prefixes')
by_id['add-ten-hundred-thousand']['sources'].append('https://www.bipm.org/en/measurement-units/si-prefixes')
by_id['add-gen']['sources'].append('https://www.etymonline.com/word/genetics')
# Card-specific dictionary sources document the new pronunciations without
# carrying reference URLs into each on-screen explanation.
for u in morph['units']:
    for c in u['cards']:
        if c['word'] in new_ipa:
            u['sources'].append('https://www.collinsdictionary.com/dictionary/english/'+c['word'])
    u['sources']=list(dict.fromkeys(u['sources']))

notes=read(HERE/'existing-note-drafts.json')['changes']
notes['sympathy']='sym-(함께)+path-(감정) 계열. 남의 고통을 안타깝게 여김. empathy는 감정을 이해·공유함.'
notes['microscopic']='micro-(작은)+scope 계열(보기). macroscopic은 현미경 없이 볼 수 있는.'
notes['intracellular']='intra-(안쪽)+cellular(세포의). intercellular는 세포 사이의.'
seen=set()
for u in morph['units']:
    for c in u['cards']:
        if c['word'] in notes:
            assert c['word'] not in seen
            c['c']=notes[c['word']];seen.add(c['word'])
assert seen==set(notes)

group_text={47:'''부정과 되돌리기|affix-un-negative affix-un-reversal affix-in-negative affix-non
잘못·해제·다시·가능하게|affix-dis affix-mis affix-de affix-re add-en
앞뒤의 시간과 이동 방향|affix-pre-post add-fore-time add-in-out affix-trans
사이·안쪽·위아래·과도함|affix-inter-intra affix-sub-super affix-over-under add-hyper-hypo
함께하기·맞서기·대칭|affix-co add-together affix-anti add-counter add-symmetry
같음·다름·이로움·해로움|add-homo-hetero add-bene-mal affix-ful-less
성질·변화·상태를 명사로|affix-ness-ity affix-ment affix-ion affix-ance-ence
사람·관계·역할을 명사로|affix-agent affix-ist-ism add-hood-ship
가능성과 성질을 형용사로|affix-able-ible affix-al-ic-ical affix-ive-ous
방식·방향·변화와 영역|affix-ly affix-ize affix-ify-en add-dom-ward''',48:'''작은 규모와 큰 규모 · micro / macro|gr-micro gr-scope gr-tele gr-phon
하나·둘·여럿과 언어|add-one-many
숫자와 모양 · 달 이름의 숫자|add-number-shape add-number-calendar
10·100·1000 · 절반과 측정 단위|add-ten-hundred-thousand add-half-units
이끌고 나르고 움직이며 흐르기|lat-duc lat-fer lat-port add-mov add-flu
오고 가고 뒤따르기|lat-ced add-ven add-grad lat-sequ
던지고 보내고 놓고 세우기|lat-ject lat-mit lat-pon add-sta
만들고 잡고 담고 닫기|lat-fac lat-cap lat-ten add-clud
돌리고 접고 펼치고 뻗기|lat-vert add-volv add-plic add-tend
끌고 깨고 쌓고 매달기|lat-tract lat-rupt lat-struct add-frag add-pend
보고 쓰고 기록하기|lat-scrib lat-spec lat-vid gr-graph
믿고 말하고 알고 묻기|lat-cred lat-dict add-cogn add-sci add-quir
읽고 고르고 듣고 부르기|add-leg add-aud add-voc
감각·마음·공감과 신체|add-sens gr-psych gr-path add-phys
가치·균형·행동과 방향|add-val add-equ lat-reg lat-ag
생명·죽음·유전과 타고남|gr-bio add-viv add-mort add-gen add-nat
사람·사회·권력과 자유|gr-anthrop gr-dem add-crat add-soci add-liber
시간·해·기간과 끝|add-ann add-temp gr-chron add-fin add-termin
땅·열·물과 측정|gr-geo gr-therm add-hydr-aqua add-metr
학문·빛·자기와 지혜|gr-logy gr-photo gr-auto add-nom add-soph
손·기술·형태와 확인|add-manu add-techn add-morph add-form add-ver
영어에 남은 오래된 단어 가족|en-blood en-food en-strong en-broad en-long'''}
used=[]
for course in morph['courses']:
    lesson=course['lesson']
    course['progressId']=f'morphology-{lesson}-20260930'
    course['groups']=[]
    for line in group_text[lesson].splitlines():
        title,ids=line.split('|');ids=ids.split();used+=ids
        n=sum(len(by_id[i]['cards']) for i in ids)
        assert 8<=n<=15,(title,n)
        course['groups'].append(dict(name=title,unitIds=ids))
assert len(used)==len(set(used))==len(morph['units']) and set(used)==set(by_id),(len(used),len(by_id),set(by_id)-set(used))
assert len(morph['units'])==128
assert sum(len(u['cards']) for u in morph['units'])==327
morph['version']='2026-09-30'
morph['organizationNote']='2026-09-30 승인: 기존 167카드 보존, 기존 표제어 복습 123카드와 신규 표제어 37카드 추가. 47·48만 새 진도키를 쓰며 과거 저장 기록은 삭제하지 않는다. 개념 단위를 나누지 않고 8–15카드 범위로 구성한다.'
write(ROOT/'pipeline/morphology.json',morph)
subprocess.run([sys.executable,str(ROOT/'pipeline/assemble.py')],check=True)
after=data_from_html()
assert all(a==b for a,b in zip(after,baseline) if a['lesson'] not in (47,48))
findings={'date':'2026-09-30','completedDate':'2026-10-01','status':'implemented_local_not_deployed','authorization':'37개 모두 추가합시다! 필요하면 더 해도 됩니다!',
          'baselineDataSha256':digest(baseline),'afterDataSha256':digest(after),
          'baselineMorphologySha256':digest(before),'afterMorphologySha256':digest(morph),
          'statistics':plan['statistics'],'retainedCardExplanationUpdates':len(notes),
          'lessonChanges':[dict(lesson=n,old=baseline[n],new=after[n]) for n in (47,48)],
          'addedCardProvenance':provenance}
write(HERE/'findings.json',findings)
print(json.dumps({'cards':sum(len(u['cards']) for u in morph['units']),'units':len(morph['units']),'groups':{c['lesson']:[sum(len(by_id[i]['cards']) for i in g['unitIds']) for g in c['groups']] for c in morph['courses']}},ensure_ascii=False))
