"""Build a reviewable curriculum proposal. Never writes game/canonical data."""
from pathlib import Path
import collections
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
if (HERE / 'findings.json').exists():
    raise SystemExit('Historical proposal is frozen after implementation. Edit morphology.json for later work; do not rebuild this baseline.')
html = (ROOT / 'vocagoyangfable.html').read_text(encoding='utf-8')
data = json.loads(re.search(r'const DATA = (\[.*?\]);\r?\n', html, re.S)[1])
morph = json.loads((ROOT / 'pipeline/morphology.json').read_text(encoding='utf-8'))
pool = collections.defaultdict(list)
for lesson in data:
    for exercise in lesson['exercises']:
        for i, card in enumerate(exercise['words']):
            pool[card['word'].casefold()].append({
                'lesson': lesson['lesson'], 'exercise': exercise['ex'],
                'index': i, 'word': card['word'], 'si': card.get('si'),
                'ko': card['ko'],
            })

# Order is our teaching sequence, not a publisher's chapter sequence.
# A row is a concept unit, NOT one exercise. Pack related units into ~10–12 cards.
rows = '''47|affix-in-negative|기존 부정 접사의 빠진 il- 보완|illegal|in- → il- / l 앞의 동화|illegal
47|affix-ful-less|기존 -ful / -less 대비 완성|harmful|harm + -ful / -less|harmful
47|affix-inter-intra|기존 inter- / intra- 대비 완성|intercellular|라틴어 inter(사이) / intra(안쪽)|@intercellular
47|add-in-out|안으로 / 밖으로|import export|라틴어 in / ex + portare(나르다)|import
47|add-fore-time|앞서 / 뒤로|forecast precede postpone|영어 fore-; 라틴어 prae / post|postpone
47|add-together|함께 결합하기|combine synthesis|라틴어 com-; 그리스어 syn- / sym-|synthesis
47|add-counter|맞서기 / 대응하기|counteract counterpart|라틴어 contra → 프랑스어 contre → counter-|counteract
47|add-en|그 상태로 만들기|enable|프랑스어 en- + able|enable
47|add-bene-mal|좋게 / 나쁘게|benefit beneficiary malfunction|라틴어 bene(잘) / male(나쁘게)|malfunction
47|add-symmetry|대칭 / 비대칭|symmetry asymmetry|그리스어 syn(함께) + metron(척도); a-(없음)|symmetry
47|add-homo-hetero|같은 / 다른|homogeneous heterogeneous|그리스어 homos(같은) / heteros(다른) + genos(종류)|homogeneous
47|add-hyper-hypo|기준보다 과함 / 낮음|hyperactive hypothermia|그리스어 hyper(위·넘어) / hypo(아래)|hypothermia
47|add-hood-ship|시기·상태 / 관계·역할|childhood neighborhood friendship leadership|영어 -hood / -ship|-hood
47|add-dom-ward|상태·영역 / 방향|freedom kingdom backward forward|영어 -dom / -ward|-dom
48|gr-micro|기존 micro-에 macro- 연결|macroscopic microeconomics macroeconomics|그리스어 mikros(작은) / makros(긴·큰)|macroscopic
48|add-one-many|하나 / 둘 / 여럿|unify uniform monologue monolingual bilingual multilingual monopoly polygon|라틴어 unus / bi- / multus; 그리스어 monos / polys|monolingual
48|add-number-shape|수와 모양|bicycle triangle quadrant pentagon hexagon octopus|bi=2, tri=3, quadr=4, penta=5, hexa=6, octo=8|hexagon
48|add-number-calendar|달 이름의 7·8·9·10|September October November December|라틴어 septem / octo / novem / decem|@calendar
48|add-ten-hundred-thousand|10 / 100 / 1000|decade decimal century percent millennium|그리스어 deka; 라틴어 decem / centum / mille|millennium
48|add-half-units|절반과 측정 단위|semicircle hemisphere centimeter millimeter kilometer kilogram|라틴어 semi-; 그리스어 hemi-; SI 배수는 별도 규칙|hemisphere
48|add-sta|서다 / 안정된 상태|state establish instability|라틴어 stare / stabilis|establish
48|add-mov|움직임 / 감정|move motion emotion|라틴어 movere / motus|emotion
48|add-ven|오다 / 일어나다|event invent prevent|라틴어 venire / ventus|prevent
48|add-clud|안에 넣기 / 밖에 두기 / 마무리|include exclude conclusion|라틴어 claudere / clausus, 합성형 clud / clus|exclude
48|add-tend|뻗다 / 향하다|intend extension tense|라틴어 tendere / tensus|intend
48|add-pend|매달림 / 의존 / 중단|depend suspension|라틴어 pendere(매달다)|suspension
48|add-plic|접힘 / 복잡함 / 드러냄|imply complicate explicitly|라틴어 plicare(접다)|imply
48|add-volv|말기 / 펼치기 / 회전|evolve involve revolution|라틴어 volvere / volutus|evolve
48|add-flu|흐르다 / 영향|flux influence|라틴어 fluere / fluxus|influence
48|add-grad|한 걸음 / 전진 / 후퇴|gradual progression regression|라틴어 gradus / gradi / gressus|gradual
48|add-cogn|알아보다 / 알지 못하다|recognize ignorant|라틴어 cognoscere / (g)noscere 계열|recognize
48|add-sci|지식 / 양심|science conscience|라틴어 scire(알다)|conscience
48|add-quir|찾다 / 묻다 / 요구하다|inquire require inquiry|라틴어 quaerere, 합성형 quir|require
48|add-leg|모으다 / 고르다 / 읽다|collect elect selective lecturer|라틴어 legere / lectus|collect
48|add-aud|듣다 / 청중 / 감사|audience audio audit|라틴어 audire / auditus|audit
48|add-voc|부르다 / 불러일으키다|vocal evoke provoke invoke|라틴어 vox / vocis / vocare|provoke
48|add-sens|느끼다 / 판단하다|sense sensation sensitive sensible|라틴어 sentire / sensus|sensation
48|add-val|힘 / 가치 / 효력|value valid equivalence|라틴어 valere(힘·효력이 있다)|valid
48|add-equ|같음 / 형평 / 균형|equilibrium equity inequality|라틴어 aequus(고른·같은)|equity
48|add-viv|살다 / 생명|revive vital survivor|라틴어 vivere / vita|revive
48|add-mort|죽음|mortality|라틴어 mors / mortis|mortality
48|add-gen|유전과 발생|gene genetics|그리스어 genea(세대) / genesis(발생) 계열; 근대 과학 조어|gene
48|add-nat|태어남 / 타고남|native nature|라틴어 nasci / natus|native
48|add-manu|손으로 다루기|manual manufacture|라틴어 manus(손)|manual
48|add-liber|자유 / 해방|liberty liberation|라틴어 liber(자유로운)|liberty
48|add-ver|참 / 확인 / 평결|verify verdict|라틴어 verus(참된)|verify
48|add-frag|깨짐 / 조각|fracture fragment|라틴어 frangere / fractus|fracture
48|add-fin|경계 / 한정 / 무한|definite infinity|라틴어 finis(끝·경계)|infinity
48|add-termin|경계 / 끝내기|terminate|라틴어 terminus(경계·끝)|terminate
48|add-temp|시간 / 같은 시대|temporary contemporary|라틴어 tempus / temporis|contemporary
48|add-ann|해와 기념일|anniversary|라틴어 annus(해)|anniversary
48|add-soci|사회 / 결합|society association|라틴어 socius(동료)|association
48|add-form|모양 / 형성|form information|라틴어 forma; informare(형태를 주다)|information
48|add-hydr-aqua|물의 그리스어·라틴어 계열|hydrogen dehydrate aquatic|그리스어 hydor / hydr-; 라틴어 aqua|dehydrate
48|add-metr|재다 / 척도|meter diameter metric|그리스어 metron(척도)|diameter
48|add-techn|기술 / 기법|technique technological|그리스어 tekhne(기술)|technique
48|add-morph|형태|morphology|그리스어 morphe(형태)|morphology
48|add-crat|통치 / 권력|bureaucracy democratic|그리스어 kratos(권력)|bureaucracy
48|add-nom|법·규칙 / 관리|economy astronomy|그리스어 nomos(규칙) / nemein(나누다·관리하다) 계열|economy
48|add-soph|지혜 / 의미 변화|philosopher sophisticate|그리스어 sophos(지혜로운); sophistes 계열|sophisticate
48|add-phys|자연 / 신체|physical|그리스어 physis(자연)|physical'''

units = []
for line in rows.splitlines():
    lesson, uid, title, words, origin, representative = line.split('|')
    cards = []
    for word in words.split():
        refs = pool.get(word.casefold(), [])
        cards.append({'word': word, 'status': 'existing_pool_review' if refs else 'new_headword_proposal',
                      'sourceRefs': refs})
    url = ('https://www.etymonline.com/word/' + representative) if not representative.startswith('@') else {
        '@calendar': 'https://www.britishmuseum.org/blog/whats-name-months-year',
        '@intercellular': 'https://www.collinsdictionary.com/us/dictionary/english/intercellular',
    }[representative]
    units.append({'lesson': int(lesson), 'id': uid, 'title': title, 'rootSummary': origin,
                  'cards': cards, 'representativeSource': url,
                  'sourceScope': '대표 어원의 검증 근거. 각 카드의 차용 경로·IPA·예문 검수는 적용 전에 별도로 완료한다.'})

existing_ids = {u['id'] for u in morph['units']}
for u in units:
    u['operation'] = 'extend_existing_unit' if u['id'] in existing_ids else 'new_teaching_unit'

selected = [c for u in units for c in u['cards']]
names = [c['word'].casefold() for c in selected]
assert len(names) == len(set(names)), 'Duplicate proposed card'
current_names = {c['word'].casefold() for u in morph['units'] for c in u['cards']}
assert not (set(names) & current_names), set(names) & current_names
new_words = [c['word'] for c in selected if c['status'] == 'new_headword_proposal']
stats = {'retainedCards': 167, 'retainedUnits': len(morph['units']),
         'additionalCards': len(selected), 'existingPoolReviewCards': len(selected)-len(new_words),
         'newHeadwords': len(new_words), 'proposedCardsTotal': 167+len(selected),
         'addedUnits': sum(u['operation']=='new_teaching_unit' for u in units),
         'extendedUnits': sum(u['operation']=='extend_existing_unit' for u in units),
         'courseCards': {str(l): sum(len(u['cards']) for u in units if u['lesson']==l)+n for l,n in [(47,71),(48,96)]}}

proposal = {
 'status': 'proposal_not_applied', 'date': '2026-09-30',
 'baselineDataSha256': hashlib.sha256(json.dumps(data,ensure_ascii=False,separators=(',',':')).encode()).hexdigest(),
 'baselineMorphologySha256': hashlib.sha256((ROOT/'pipeline/morphology.json').read_bytes()).hexdigest(),
 'statistics': stats,
 'keep': {'allExistingMorphologyCards': True, 'deleteHeadwords': [], 'courseNumbers':[47,48],
          'gameMechanics':'unchanged', 'exerciseTarget':'주제·어근 가족을 보존하며 10–12카드 중심, 자연스러운 대비묶음은 8–15카드 허용'},
 'newHeadwordsAwaitingApproval': new_words,
 'existingUnits': [{'id':u['id'],'title':u['title'],'words':[c['word'] for c in u['cards']]} for u in morph['units']],
 'additionalUnitsAndCards': units,
 'implementationGates': [
   '사용자에게 새 표제어와 복습 카드 확대 범위를 먼저 제시하고 승인받는다.',
   '현재 원본 카드의 뜻을 확인해 어원 학습 뜻과 일치하는 sourceRefs를 고른다. 첫 카드를 자동 복사하지 않는다.',
   '책 목차와 목록은 누락 점검용이다. 예문·번역·해설은 새로 작성하고 개별 사전으로 검수한다.',
   '숫자 어근·SI 배수·고대 원형·현대 영어 뜻을 구분한다. 같은 철자라는 이유만으로 묶지 않는다.',
   '그리스 원문·전사·영어 발음은 서로 다른 정보로 기록한다. 독립 발음이 일정하지 않은 결합형의 가짜 표준 IPA를 만들지 않는다.',
   '47·48의 원본 morphology.json 수정, 신규 진도키/과거 완료 처리, 보존원장과 검사 갱신 후 빌드한다.',
   'UI·정답 허용 범위를 바꾸지 않는다. 배포는 별도 요청 시 진행한다.'
 ]}
HERE.mkdir(parents=True, exist_ok=True)
(HERE/'curriculum.json').write_text(json.dumps(proposal,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

lines = ['# FABLE 어원 과정 재구성안 · 2026-09-30', '',
         '상태: **구성 제안, 게임 미반영**. 새 표제어는 사용자에게 먼저 제시한다. 기존 167카드의 삭제는 없다.', '',
         '## 확정 전 수량', '',
         f"- 기존 {stats['retainedCards']}카드 + 기존 풀 재학습 {stats['existingPoolReviewCards']}카드 + 새 표제어 {stats['newHeadwords']}카드 = 제안 {stats['proposedCardsTotal']}카드.",
         f"- 47세트 {stats['courseCards']['47']}카드, 48세트 {stats['courseCards']['48']}카드. 아래 행은 개념 단위이며 exercise 경계가 아니다.",
         '- 새 어휘는 한 뜻씩을 제안한 집계다. 후속 검수에서 뜻을 더 나누려면 수량을 갱신한다.', '',
         '## 새 표제어 제안', '', ', '.join(new_words), '',
         '## 보강할 구성', '', '| 세트 | 학습 묶음 | 어근·접사 연결 | 카드 (* 새 표제어) |', '| --- | --- | --- | --- |']
for u in units:
    ws = ', '.join(c['word']+('*' if c['status']=='new_headword_proposal' else '') for c in u['cards'])
    lines.append(f"| {u['lesson']} | {u['title']} | {u['rootSummary']} | {ws} |")
lines += ['', '기존 71개 개념 단위는 curriculum.json의 existingUnits에 전부 보존했다. 개별 출처와 출처를 확인한 범위는 SOURCES.md를 참고한다.', '',
          '## 학습 순서', '',
          '47: 부정·취소 → 방향·시간·함께하기 → 대비 접사 → 명사·형용사·동사·부사 접미사. 기존 단위와 새 단위를 뜻에 맞춰 합친다.', '',
          '48: 크기·수량·숫자 → 움직임·배치·결합 → 지각·표현·사고 → 가치·사회·생명·시간 → 과학 결합형 → 오래된 영어 단어 가족.', '',
          'micro/macro는 이미 있는 microscopic·microbe·microscope 등과 새 macroscopic·microeconomics·macroeconomics를 같은 연습 범위에서 연결한다. 같은 접사라도 단어 전체가 반의어인지 별도로 판별한다.', '',
          '## 적용 전 남은 일', '',
          '\n'.join('- '+s for s in proposal['implementationGates']), '']
(HERE/'PROPOSAL.md').write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps(stats,ensure_ascii=False,indent=2))
print('NEW:',', '.join(new_words))
