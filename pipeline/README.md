# 보카고양 인수인계 (26.9.9 · 데스크 세션 → 보카고양 전용 세션)

이 문서는 보카고양(Fable 5000) 개발·검수 역할을 새 세션으로 넘기기 위한 인수인계다. 원칙 하나: **이 문서 + GitHub의 HTML 하나만 있으면 작업이 완전히 재개돼야 한다.** 그래서 파이프라인 원본(JSON)은 HTML에서 복원하는 스크립트(`disassemble.py`)를 같이 넘긴다.

## 0-1. 고양고양이가 누구인가 (26.9.14 영신)

**적수가 아니다.** 학생을 이기려는 상대가 아니라 **츤데레 싸이코**이고, 영신 본인이다.
겉으로는 비웃고 놀려도 편이며, 가끔 진짜로 성질을 낸다.

표정을 붙이거나 meow·대사를 쓸 때 이 성격에서 벗어나면 안 된다. 틀렸을 때 고소해하는
얼굴(적수)과 놀리는 얼굴(츤데레)은 다르다 — 후자다. 힌트를 쓸 때 히죽하는 것도
약점을 잡아서가 아니라 결국 자기한테 기대는 게 재밌어서다.


## 0. 사람과 말투

- 영신(최영신, esqsoy@gmail.com) — 스터디원국어교습소 원장, 수능 국어 강사. 보카고양의 기획자이자 유일한 검수자. 대화는 반말. 아내 소연이 쓰는 채팅이면 최대한 상냥하게 존댓말.
- 영신의 작업 습관: 세부 지시는 짧게, 판단은 빠르게. 사용량(Fable 주간 %)을 스크린샷으로 보내 주며, 큰 작업 뒤엔 작업량을 찍어 준다고 했다. 예상치는 살짝 보수적으로 잡되 "스크린샷 두 장 사이 변화량엔 다른 작업이 섞여 있다"는 걸 함께 말할 것. 세트당 검토 비용 실측 ≈ 0.3%(10세트 ≈ 3%).
- 작업 규칙(영신이 정한 것):
  - 에이전트 분산은 **견적 + 승인 뒤에만**, 한 번에 3명 이하, 에이전트는 `model: "opus"`.
  - "도구 쓰지 말고 네가 직접 하나하나 읽어서"라고 하면 자동 탐지 없이 카드를 직접 읽고 판단한다.
  - 반복 작업은 10세트 묶음 단위로 처리하고 묶음마다 압축 보고(세트별 변경 목록 + 메모).
  - GitHub 푸시: 보카고양 전용 세션(26.9.9~)은 레포가 소스로 연결돼 있어 `claude/…` 작업 브랜치로 직접 push한다. 영신은 GitHub 웹에서 PR을 main에 머지하면 된다. (데스크 세션 시절엔 push 403이라 파일 전달 → 웹 업로드였음.)

## 0-1. 층 체계 (헌장 제1조 v2.4, 26.9.10 영신 확정)

Fable(0→4,639) + Mother Tongue(→약 8,200) = 95% 직독직해선. 그 위 **HoE(Heart of English, →12,000 — 콘래드 『Heart of Darkness』에서 딴 이름; 26.9.5까지는 Fable을 이렇게 불렀음)** → **GoE(Gift of English, →15,000, 나보코프 『재능』)**에서 종합 단어장 끝. 15,000→42,000(Brysbaert 2016 원어민 20세 수용 어휘)은 명작 한 권 = 단어장 한 권. 수특은 그 해 고3용이라 사다리 밖. 단위는 표제어. 인수인계 때 3층 이름이 빠져 데스크가 임시로 BoE라 부른 적 있음 — 폐기.

## 1. 제품

- 공개 주소: https://esqsoy.github.io/vocagoyang/ · 레포: https://github.com/esqsoy/vocagoyang
- 파일:
  - `index.html` — 교재 선택 화면(FABLE 5000 / MOTHERTONGUE 2027 / EBS 수특 2027 세 카드, 누적 단어수·직독직해선 95% 표기).
  - `vocagoyangfable.html` — **본체.** 단일 HTML(약 1.52MB), 안에 `const DATA = [...]` 블롭으로 48레슨 6,002카드(어휘 5,752 + 형태론 46·47세트 250)가 들어 있다.
  - `vocagoyangksat2027.html`, `vocagoyangebs2027.html` — 마더텅·EBS 옛 앱(별도 계보, 이번 인수인계 범위 밖).
  - `vocagoyanghoe.html` — 옛 이름의 리다이렉트 스텁. 영신이 GitHub에서 삭제하기로 함(26.9.9). 진행 저장 키(`goyang-hoe-seoul-v1`)는 그대로라 기존 진도는 보존된다.
- 설계 원본: 아티팩트 **보카고양 설계 헌장 v2.4(프로토타입 — 빠진 건 대화로 버전업)** https://claude.ai/code/artifact/51fbcefc-3a5a-4fcd-a75c-e7870698df5a (제0~7조 + 부록 A~G; 제7조 접사·어근·어족은 데스크 제안, 영신 결정 대기). 카드 규칙·말투·층 구조·미결 사항이 여기 있다. 헌장과 이 문서가 다르면 헌장이 원칙, 이 문서가 현재 상태.

## 2. 데이터 구조

레슨(세트) 48개(0~45 어휘 + 46 접사 + 47 어근), 카드 6,002장, 어휘 표제어 4,639개(+ 형태론 표제어 88: 접사 34·어근 36·사촌 쌍 18).

| 레슨 | 라벨 | 내용 | 배열 |
|---|---|---|---|
| 0 | 0세트 | 기초 결손 보강 179장(수사·요일·인사·사람·학교·생활·현대어·생활 구어) | 주제별 |
| 1~4 | 1~400 | 머리경(오푸스) 시절 400단어(전량 LDV) | 학습순서(빈도 아님) |
| 5~22 | 401~2183 | LDV 잔여 1,783단어 · 2,099카드 | NGSL 랭크순 |
| 23~45 | 2184~4458 (합집합 잔여를 통번호로 이음) | 핵심 리스트 합집합 잔여 2,275단어(+deduction −trillion) · 2,756카드 | COCA 빈도순 |
| 46 | 접사 | 접두사 11·접미사 23 = 34 표제어 · 103카드 (헌장 제7조 ①) | 기능별 |
| 47 | 어근 | 라틴·그리스 어근 36 표제어 · 129카드 + 사촌 쌍(그림 법칙) 18카드 (제7조 ②·④-1) | 어근별 |

**뜻 개수 규칙(26.9.9 영신 확정): 상한 없음.** 사용 빈도가 높은 뜻은 열 개라도 전부 카드로 세운다. SPEC.md의 옛 "1~3개(최대 4개)"는 삭제됨. 제외 기준은 빈도·층위뿐.

카드 필드: `en ko ex tr c ipa pos word si sn` (+ `meow` 있을 때만). `ex`엔 반드시 `{{BLANK}}`, 어미는 `{{BLANK}}s / {{BLANK}}d / {{BLANK}}ing / {{BLANK}}bed`처럼 붙여 쓴다. `si`=뜻 번호, `sn`=총 뜻 수. 한 레슨 = exercise 10개(10단어씩), 다의어는 같은 exercise 안에 카드로 나뉜다.

앱(JS) 쪽 핵심 상수·함수(모두 `vocagoyangfable.html` 안):
- `normalize()` — 소문자·구두점/어포스트로피 제거·하이픈→공백, 비교 시 공백 제거. `isCorrect()`가 이걸로 정답 판정.
- `isSpellingVariant()` — `variantKey`는 z→s만 본다. 그래서 -our/-re 같은 영미 철자는 별칭표로 처리해야 한다.
- `ALT` (별칭표, 현재 260키) + `isAliasHit(typed,w)` — 키는 `"표제어/뜻번호"`, 값은 정답으로 인정할 변형 배열. 맞으면 `correct=true; variantHit=true` → "‘X’도 맞다고양! 근데 이 책은 ‘Y’로 쓴다고양 ✦". **순수 변형만** 넣는다(지역 철자, 약칭/전체형, 지역 등가어 flat/apartment·queue/line, 호칭 mom/mum). 뜻이 겹칠 뿐인 동의어(start/begin)는 넣지 않는다.
- `GLOSS` + `isSynonymMiss()` + `SYNLINES` — 동의어를 쳤을 때 **오답 처리하되 안내 한 줄**을 붙이는 장치. 별칭표가 "정답+안내"라면 이건 "오답+안내". 동의어 판정은 자동이다: 전 카드의 ko를 `,`·`/`·`·`로 쪼갠 뜻조각 → 영단어 집합(`GLOSS`)을 만들고, 학생이 친 단어가 표적 카드의 뜻조각 하나를 공유하는 다른 표제어면 동의어로 본다. 그래서 ko 조각이 정확히 겹쳐야만 안내가 뜬다(start "시작하다" ↔ begin "시작하다" ✓ / "시작되다"만 있으면 ✗). `SYNLINES`는 그때 붙는 문장 4종.
- `GLOSS`/`HINTS`/`hintFor()` — 힌트, `LESSONCLEAR` — 세트 클리어 대사(0~45), `limitFor()` — 제한시간, `STORAGE/MODEKEY/UNIKEY` — localStorage 키(바꾸지 말 것).
- 별칭을 추가할 때 붙이는 자리: `ALT` 객체의 **마지막 항목 뒤**. 현재 마지막 항목 문자열은 `"skillfully/1":["skilfully"],"appall/1":["appal"]};` — 이 앞에 `,"새키":["값"]`를 끼워 넣는다(스크립트로 하면 안전: 정규식 `const ALT=\{(.*?)\};`로 잡아 재조립).

## 3. 파이프라인 (작업 공간 `/home/claude/hoe-prod`)

새 세션의 컨테이너에는 이 폴더가 없다. **첨부된 `vocagoyang-pipeline-260909.zip`을 `/home/claude/hoe-prod`로 풀면 그대로 복원된다.** zip이 없으면 아래 복원 절차(3-1)를 따른다.

파일:
- `out/lesson00~04.json`(dict: lesson/label/name/exercises), `out/set05~45.json`(exercises 리스트) — **카드 원본.** 편집은 여기에 하고 HTML은 조립해서 만든다. (`out/lesson00b.json`은 0세트 작업 중간본, 무시.)
- `assemble.py` — out/*.json → HTML의 DATA 블롭 교체. `cd /home/claude/hoe-prod && python3 assemble.py` (상대경로라 반드시 이 폴더에서). 출력 예: `lessons 48 cards 6002 words 4713 bytes 1519421` (words엔 형태론 표제어 88이 포함되니 어휘 표제어는 4,639).
- `disassemble.py` — 역연산. HTML → out/*.json. 왕복 검증 완료(46파일 동일).
- `audit.py out/setNN.json` — 기계 감사: 빈칸 유무, 예문 10단어 초과, 해설 72자 초과, meow 48자·'고양' 포함, **예문 어휘 통제**, ipa/tr/pos 누락, 단어 누락·순서, **중복(같은 단어·뜻 번호, 같은 뜻, 같은 예문)**. `audit.py --dups`는 전 세트 교차 중복(표제어가 여러 세트에, 같은 예문이 여러 카드에)을 보고한다. 파일명에 `set`이 있어야 한다(lesson 파일은 `audit.py`의 `tok_ok`를 import해서 따로 검사). 마지막 줄 `문제 0`이 통과.
- `seam.py` — 이음새 감사(헌장 제5조): 레포의 세 HTML에서 표제어를 뽑아 LDV↔Fable↔마더텅↔EBS 겹침·공백을 낸다. `--list 마더텅only` 등으로 목록 출력.
- `dump.py <json>` — 카드 한 줄씩 출력(`n [word/si] pos ko | ex | tr`). 검토용.
- `apply.py <json> <edits.json>` — 편집 적용. edits는 `{"word/si": {"ex": "...", "tr": "...", "c": "...", "ko": "..."}}`. 적용 후 빈칸 확인, 어휘 경고(`VOCAB`), 해설 74자 경고(`C>74`), 미적중 키 보고.
- `allowed.json` — `ldv`(2,183) · `used400` · `set0` · `fable`(23~45 단어 → 세트 번호). `whitelist.json` — 생활어 부록 50단어. `sets.json` — 5~22세트 단어 명단(순서 검사용). `fable/in/set23~45.json` — 23~45 입력 명단(순서 검사용). `fable_plan.json` — 합집합 배열 근거(COCA·votes·src).
- `SPEC.md` — 카드 생산 명세(헌장 요약). `fable/cat/style_guide.md` — 고양체 가이드, `fable/cat/*.json` — 대사·meow 원본.

어휘 통제 규칙(감사기의 실제 동작):
- 5~22세트: `ldv ∪ used400 ∪ set0 ∪ whitelist` + 불규칙형·수사 + 굴절 처리(s/es/ed/d/ing/er/est/ly). 대문자로 시작하는 토큰(고유명사)은 건너뜀.
- 23~45세트: 위에 더해 `allowed.fable` 중 **세트 번호 ≤ 현재 세트**인 단어(누적 학습). `apply.py`의 `VOCAB` 경고는 참고용(누적 규칙을 모름), **`audit.py`의 `문제`가 관문**이다.
- 예문 단어 수는 `[A-Za-z'{}]+` 토큰 기준 10개까지(빈칸 포함). 11개면 반려.

### 3-0. 형태론 세트(46 접사 · 47 어근, 헌장 제7조)
- 표제어 = 접사·어근 문자열(`un-`, `-ness`, `spect`). 앱은 하이픈을 지우고 비교하니 학생은 `un`을 친다. 빈칸엔 파생어의 나머지를 붙여 쓴다: `{{BLANK}}fair`, `kind{{BLANK}}`, `in{{BLANK}}or`.
- 변이형은 표제어를 나눈다(in-/im-, -tion/-sion, scrib/script). 답이 하나여야 하기 때문.
- 어휘 통제: 46·47세트는 Fable 전체 표제어 + `fable/in/setNN.json`의 `preview` 단어(마더텅에서 미리 당겨 온 단어) 허용. `audit.py`가 setno≥46이면 이 규칙을 쓴다. `assemble.py`는 out/set46·47.json이 있으면 붙인다(라벨 MORPH).
- 생산: 26.9.10 워크플로(opus 에이전트, 청크당 생성→반박 검증) → `post46.py`(scratchpad)로 세트 JSON·명단 조립 → audit → assemble.

### 3-1. HTML만 있을 때 복원
```
mkdir -p /home/claude/hoe-prod && cd /home/claude/hoe-prod
# (zip이 있으면 여기 풀기) 없으면:
git clone https://github.com/esqsoy/vocagoyang.git /home/claude/vocagoyang
python3 disassemble.py            # out/*.json 46개 생성
python3 assemble.py               # 재조립 → 바이트 수가 원본과 같아야 함
```
`audit.py`는 `allowed.json / whitelist.json / sets.json / fable/in/*.json`이 있어야 돈다 — 이 넷은 zip에 있고, 레포의 `pipeline/` 폴더에도 넣어 두었다(영신이 업로드했으면).

### 3-2. 표준 수정 절차 (카드 고치기)
```
cd /home/claude/hoe-prod
python3 dump.py out/set31.json                 # 읽기
# edits.json 작성: {"gross/1": {"tr": "…징그러워."}, "dot/1": {"ex": "Connect the {{BLANK}}s to draw a cat."}}
python3 apply.py out/set31.json /path/edits.json
python3 audit.py out/set31.json | tail -3      # 문제 0 확인
python3 assemble.py
cd /home/claude/vocagoyang && node -e "const h=require('fs').readFileSync('vocagoyangfable.html','utf8');const s=h.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/)[1];new Function(s);console.log('js ok')"
git add vocagoyangfable.html && git commit -m "…"
# SendUserFile로 vocagoyangfable.html 전달 → 영신이 GitHub 웹에서 덮어쓰기
```
함정: 셸 cwd가 호출 사이에 초기화된다 — 매번 `cd` 또는 절대경로. `audit.py`·`apply.py`는 `/home/claude/hoe-prod/`를, `assemble.py`·`disassemble.py`는 `/home/claude/vocagoyang/vocagoyangfable.html`을 절대경로로 박아 두었다 — 폴더 위치를 바꾸면 그 줄부터 고칠 것. `grep`으로 예문을 찾을 땐 빈칸 어미 때문에 원문이 끊긴다(`{{BLANK}}d to be`).

### 3-3. 플레이 검수 체제
영신이 앱을 하다 발견 → "단어+뜻번호" 보고 → 데스크 수정 → 재배포. 보고가 짧아도 `dump.py`로 그 카드를 찾아 문맥을 보고 고친다.

## 4. 검수 기준 — 빈칸 중의성 (26.9.7~9 전 세트 1회전 완료)

학생이 보는 것: 한국어 뜻(ko) + 빈칸 예문(ex) + 한국어 번역(tr). 이 셋으로 **다른 영단어도 들어갈 수 있으면** 결함.
해결 우선순위:
1. 예문 교체 — 그 단어에만 붙는 연어·관용구로("caught a ___ of" → glimpse, "double ___" → helix, "___ table" → periodic).
2. 번역 조이기 — 한국어 단서를 표적 단어에만 닿게(시합→match / 경기→game, 고맙게도→thankfully / 다행히→luckily, 자전→rotate).
3. ko 손질.
4. 별칭 — 순수 변형일 때만.
5. 그래도 남는 본질적 동의어 쌍은 `SYNLINES` 안내로 넘기고 메모에 남긴다.

메모(동의어라 SYNLINES 몫으로 남긴 쌍, 23~45 기준 — 0~22 목록은 이전 보고에 있음): start/begin, hard/difficult, right/correct, close/shut, almost/nearly, thus/therefore, gift/present, sure/certain, kind/type/sort, room/space, area/field, subject/topic, bear/stand, count/matter, while/when, rush/hurry, lately/recently, sum/total, fortunate/lucky, probable/likely, spoil/ruin, concerning/regarding, anxious/nervous, inquire/ask, role/part, particularly/especially, previous/former, moreover/furthermore/besides, fate/destiny, incredible/unbelievable, murderer/killer, holy/sacred, situated/located, excess/extra, velocity/speed, lethal/fatal, dislike/hate, awful/terrible, bump/hit, compel/force, authorize/allow/permit, prohibit/ban/forbid, gathering/meeting, sole/only, blend/mix, elder/older, ray/beam, tab/bill, workout/exercise, midst/middle, blast/explosion, brutal/cruel, synthetic/artificial, underneath/under, purely/only, charming/attractive, nationwide/national, utterly/completely, entitle/name, overly/too, wholly/completely, deliberate/intentional, memo/note, filthy/dirty, spicy/hot, reckon/think, tightly/tight, phenomenal/amazing, forthcoming/upcoming, expenditure/spending, contention/argument, pact/promise, onset/start, presently/currently·soon, litter/trash, compulsory/required, unwilling/reluctant, delegate/representative, wed/marry, noisy/loud, firearm/gun, seldom/rarely, commence/start, fetch/get, adhere/stick, circa/around, furry/fluffy, optimum/best, marvelous/wonderful, boast/brag, applaud/clap, gradient/slope, abolish/end, criterion/standard, plunge/dive, impolite/rude, terrify/scare, tidily/neatly, untie/undo, imprison/jail, evoke·invoke/trigger, escalate/grow, dissatisfied/unhappy, intriguing/interesting, vibrant/lively, computation/calculation, grammatical/grammar.
→ 위 113쌍을 자동 판정(`GLOSS`)에 대조해 보니(26.9.9) **55쌍은 ko 조각이 안 겹쳐 안내가 안 뜨고**, 12쌍은 친 단어가 표제어가 아니라 그냥 오답 처리된다.
안내 안 뜨는 55쌍: start/begin thus/therefore gift/present kind/type kind/sort area/field count/matter while/when sum/total fortunate/lucky probable/likely anxious/nervous role/part dislike/hate bump/hit compel/force authorize/allow authorize/permit gathering/meeting sole/only ray/beam tab/bill midst/middle underneath/under purely/only nationwide/national entitle/name overly/too filthy/dirty spicy/hot tightly/tight phenomenal/amazing contention/argument pact/promise onset/start presently/soon compulsory/required wed/marry noisy/loud firearm/gun seldom/rarely commence/start fetch/get adhere/stick circa/around optimum/best marvelous/wonderful gradient/slope abolish/end terrify/scare imprison/jail escalate/grow dissatisfied/unhappy intriguing/interesting grammatical/grammar.
표제어 아님(안내 없음): elder/older deliberate/intentional forthcoming/upcoming expenditure/spending litter/trash furry/fluffy boast/brag applaud/clap tidily/neatly evoke/trigger vibrant/lively computation/calculation.
→ 다음 개정 후보: 별칭표와 같은 꼴의 명시 동의어표 `SYN={"start/1":["begin"],…}`를 두고 `isSynonymMiss`가 GLOSS보다 먼저 이 표를 보게 하기(위 67쌍이 초기 값).

## 5. 미결 과제 (우선순위 순)

1. ~~**1차 완성 확인**~~ — 완료(26.9.9). `a941c48` 업로드 + hoe.html 삭제 확인.
2. ~~**order 권고 18건**~~ — 완료(26.9.9, 18/18, 신규 카드 18장, 5,672 → 5,690). 원문: (헌장 부록 C, "다음 개정") — okay 감탄사, credit 학점, tough 뜻 분리, tip 끝, program 동사 등 흔한 뜻이 누락된 표제어에 뜻 카드 신설·순서 교환. 목록 파일: `fable/review/order_recs.json`(set·word·si·problem·severity). 뜻 카드를 새로 만들면 `sn` 갱신, 같은 exercise 안에 넣기, 예문 어휘 통제 통과 필수. 처리 내역은 `order_recs.json`의 `fix` 필드. deduction(연역·공제)은 26.9.9 영신 승인으로 41세트 induction 뒤에 표제어 추가(명단 예외, src `pair:induction`). 헌장 E-3 잔여도 처리: get ④ 도착하다, address ②③ 연설·다루다, plain ③ 평이한, bitter ③ 원망하는 신설, rose ②(활용형) 삭제. 35세트 trillion은 0세트와 중복이라 제거.
3. ~~**0~22세트 meow 가이드 재정비**~~ — 완료(26.9.9, 299줄 전부). 기초 1~4세트 meow 60줄 + 0세트 8줄 신설(26.9.9 영신 결정). 현재 meow 총 595줄. 남은 건 영신 플레이 검수. — 23~45는 고양체 가이드(26.9.5, `fable/cat/style_guide.md`)로 썼지만 0~22의 299줄은 옛 톤. 가이드에 맞춰 다듬기(전부 수작업, 다섯 카드당 하나 이하 유지).
4. 명시 동의어표 `SYN` 신설(4절 끝의 67쌍이 초기 값). 26.9.9 추가 후보: address/handle(다루다), address/speech(연설), get/arrive(도착하다), kind/sort/type.
5. 접사·어근(헌장 제7조) — ① 접사 46세트·② 어근 47세트(사촌 쌍 포함) **완료(26.9.10)**. 남은 것: ③ 어족 묶어 돌리기 모드(앱, 단어 뷰와 함께), ④-2 불규칙 동사 패턴·④-3 구동사↔라틴 동사 대응(③의 갈래), ④-4 register(단어 뷰). 사양·후처리 스크립트는 `fable/morph/`.
6. 단어 뷰(한 단어의 모든 뜻을 층 배지와 함께 조망) — 설계 확정, 구현 시점 미정. 헌장 제7조 ③ 어족 묶어 돌리기와 같은 앱 작업.
9. ~~**직검수 구조 지적(뜻 누락) 45건**~~ — 완료(26.9.11, 45/45 신설, 5,957 → 6,002). 초안(Fable 워크플로)→반박·기계 검증(opus 4청크, 45/45 통과, 수정 20여 건: bear tr·poor ko·light sn·act/key/coin 중의성·delay/serve/raw/deal/rise/novel/keen 예문 소재 중복 교체·present 품사 분리·have pos 등)→`insert_cards.py`(형제 카드 뒤 삽입, sn 갱신, sibling_updates 적용). `fable/review/직검수_260911.json` structural 전 항목 done. 남은 메모: light ④ (색이) 연한 카드는 미신설(만들면 light 네 장 sn=4), bear '열매 맺다/명심하다'는 ③ c 연어로 흡수.
10. 기초 1~4세트 예문 어휘 경고(감사기 밖이라 미반려): lesson01 work② anymore, love③ endless, real① fake. LDV 밖 단어 — 교체 여부 결정.
11. **정답 효과의 꽃 — 보류 중, 차후 업데이트**(26.9.15 영신). 지금 게임에는 하트만 나간다(`FX.flowers=false`). 꽃 코드·여섯 연출·손잡이는 모두 살아 있고 한 줄로 돌아온다. 두 번 걸렸던 것: ① 크기 — 1.35배로 키웠다 ② 움직임 — 회전·시차·지속을 눌렀다(`calmFX`). 그래도 산만하다는 판단이라 끈 상태. 다시 볼 때 **크기 먼저, 그다음 움직임** 순서(영신). 손잡이판을 쓰면 화면 보면서 바로 돌릴 수 있다 — 상태줄 시계(00:00)를 1.5초 안에 네 번 탭, 또는 주소 끝에 `#fx`. 슬라이더를 움직이면 그 자리에서 다시 터지고, 맨 아랫줄이 그대로 코드에 넣을 값이다. **거리(`fly`)는 함부로 줄이지 말 것** — 실측으로 .68까지 내리면 꽃이 글자 위에 뭉쳐 앉아 가림이 평균 10%→27%(최대 121%)로 뛴다. 측정 스크립트는 세션 scratchpad의 `motion.js`·`occl.js`·`pkchk.js`.
7. 영/미 IPA 병기 — 보류(원하면 `ipa_uk` 필드).
8. 생활어 부록 추가 후보(crazy, toward·inward·backward) — 이미 카드로 존재하므로 whitelist 반영 여부만 확인.

## 6. 이력 요약 (git log 기준)

- 26.9.13~15 Fable 앱 다듬기 22커밋을 main 병합·배포(`0d7c5e7`). 하이픈·아포스트로피 단어 97장 오답 버그 수정, 큰 윤곽 하트 + 콤보 5단계, 정답 시 화면 흔들기 삭제(182px 순간이동 → 18px 계단), 카드 머리줄(힌트·남은 시간·고양이 한 줄)로 뜻 두 줄 비율 26%→6%, 고양고양이 표정 7종, 최고 기록 제거, 별칭·동의어 통과 이유 안내. 쥐 타이머는 만들었다가 롤백(시선을 뺏음). 꽃은 보류 — 5절 11번.

- 26.9.4 HoE 22세트 2,750카드 완성(LDV 2,183 완전 커버) → 검수 1·2차(1,282필드) → 구조 정비 → 0세트 신설.
- 26.9.4~5 HoE→Fable 개명, 23~45세트 2,275단어 추가, meow 표시, index 개편(FABLE 5000), 0세트 수사 통합·billion/trillion.
- 26.9.7~8 빈칸 중의성 점검 0~45 전 세트 1회전(예문 교체·번역 조이기 약 1,000필드) + 별칭표 ALT 신설·260키.
- 26.9.9 데스크 세션 마지막 커밋 `a941c48` → 영신이 웹 업로드(origin `122d2cd`). 이후 이력은 보카고양 전용 세션이 브랜치로 push.
- 26.9.9 order 권고 18건 처리(신규 18장, 카드 5,672 → 5,690). summit·stall은 뜻 순서 교환, induction은 ②③ 두 장.
- 26.9.11 직검수 전 세트(0~47) 1회전 — Fable 워크플로(세트별 통독 검수 → 반박·기계 검증), 확정 수정 1308건 적용(ko·tr·ex·c·meow·ipa·pos). 기초 1~4세트 해설 72자 초과 압축 175건 포함. 구조 지적(뜻 누락) 12건 신설, 45건 대기. 검수 기록 `fable/review/직검수_260911.json`.
- 26.9.10 형태론 세트 46(접사 103장)·47(어근 129장 + 사촌 쌍 18장) 생산 — opus 워크플로 50회(생성 25·반박 검증 25, 349만 토큰), 데스크 통독 후 5건 수정. 헌장 v2.4.
- 26.9.13 **꽃 효과 6종 순환**(영신: 유리꽃 화약만 빼고 전부 쓰자): 합본 · 겹꽃잎 다종 꽃다발(v1) · 두 번 뛰는 꽃비(v2) · 피어나는 하트꽃(v4) · 콤보 서사 꽃비(v6) · 하트 광휘의 층(v3)을 **연습 단위로 순환**한다(`BURSTS`, `burstStyle()` = `(state.li*7+state.ei) % 6`). 같은 연습은 언제 풀어도 같은 꽃이라 기억에 남고, 연습을 넘기면 바뀐다. 결과 화면에서 틀린 단어를 지울 때(`fxHeart`)는 합본 하트로 고정.
  - **`tameHeart(layer)`**: 여섯 안 중 다섯이 저마다 '속을 채운 하트'를 중앙에 깔아 문장을 덮었다. 효과를 만든 직후 그 요소(`.v1-glow,.v2-glow,.v3-core,.v4-glow,.v6-glow`)만 골라 레이아웃 크기를 78px로 자르고 그라데이션 stop-opacity를 0.4배로 낮춘다. 꽃·불티는 건드리지 않는다. 크기 판정은 `offsetWidth`로 한다(`getBoundingClientRect()`는 애니메이션 scale이 섞여 들어와 판정이 빗나간다).
  - 변형 코드의 주석에 `burst(layer,x,y,o);` 문자열이 들어 있어, fx()의 호출부 치환은 **변형 코드를 붙이기 전에** 해야 한다.
- 26.9.13 **하트는 채우지 말고 윤곽으로** (영신: "뭔가 엉망인데? 에러야"): 합본 1차에서 v3의 '속을 채운 반투명 하트 광원'을 그대로 옮겼더니 어두운 카드 위에서 빛이 아니라 **회색 덩어리**로 보였고, 터지는 자리가 곧 문장 한복판이라 그 덩어리가 글자를 덮었다. 실측(문장 영역을 불투명도로 가중해 덮는 비율): 콤보 1/6/20/40에서 31%/78%/165%/189%.
  - 고친 것: ① 채운 하트 광원(`.glowfx`, `heartGlowSVG`) **삭제** → 하트는 빛나는 윤곽(`.hwave`)만. 분홍 9 + 연분홍 4.5 + 흰 1.6 세 겹 선 + drop-shadow 한 겹이라 속이 비어 글자가 비친다. 겹수 1 / 5연속 2 / 20연속 3. ② 원형 링(`.ring2`) 삭제(하트 파동과 역할 중복). ③ 꽃 14~25px → 20~34px, 퍼지는 거리 70~150 → 92~180, 불투명 유지 구간 70%→55%로 당겨 글자 줄을 빨리 벗어나게.
  - 결과 실측: 31%→8% / 78%→25% / 165%→108% / 189%→124%. 높은 콤보의 수치는 겹치는 꽃을 중복으로 세는 지표의 한계이고, 실제 화면에서는 문장·정답 단어·해설이 모두 읽힌다(스크린샷 확인).
  - 원칙으로 남길 것: **어두운 배경 위에서 반투명 채움은 빛이 아니라 때가 된다.** 빛은 선·점·작고 밝은 코어로 표현한다.
- 26.9.13 꽃·하트 합본(영신이 고른 세 안을 합침): **장미(고양시 꽃)를 주인공으로 두고**, 하트는 '하트 광휘의 층'안에서, 꽃 종류가 콤보로 늘어나는 짜임은 '콤보 서사'안에서 가져왔다.
  - 하트 층: 중앙 하트 광원(`heartGlowSVG`, 그라데이션 id를 버스트마다 새로 발급해 연속 정답 시 충돌 방지) + 하트 파동 링 `.hwave` 1~3겹(두꺼운 분홍 아래층 + 얇은 흰 윗층 = 선만 있는 윤곽이라 글자를 덮지 않음). 겹 수는 콤보 6·20에서 늘어난다.
  - 꽃 층: `flowerPool(c)` — 1~2연속 장미만 / 3~5 +여섯잎 블로섬 / 6~9 +벚꽃 / 10+ +하트 꽃가루. 풀에 장미를 두 번 넣어 어느 단계에서도 장미가 절반 이상이다.
  - 색: `hue-rotate` 폐기(장미 줄기·잎까지 돌아 '빛나는 벌레'로 보이던 문제). 꽃잎만 `currentColor`로 칠하고 줄기·잎은 초록 고정. 어두운 보라에서 또렷한 여덟 색(`HUES`, 분홍에서 시작)을 쓰고 `hueSpan(c)`으로 콤보마다 색폭이 넓어진다.
  - **색 간격은 5**: 간격 3은 색폭 6에서 gcd가 3이라 두 색만 나온다(v1 심사에서 지적된 것과 같은 함정). 5는 2·4·6·8 모두와 서로소.
  - 중앙 하트에 금색 스톱을 넣으면 보라 배경에 겹쳐 갈색으로 탁해진다 → 흰빛·분홍만 쓰고 금색은 불티·가장자리가 맡는다.
- 26.9.12 꽃 효과 7안 비교판: https://claude.ai/code/artifact/e103427b-e63b-4e9a-a162-ed626f8fad02 — 같은 카드·같은 콤보(1~40)에서 기준(현재)과 여섯 안을 눌러 비교. 여섯 안은 워크플로(설계 6 + 심사 18 에이전트, 2.3M 토큰)로 만든 것이고 코드·심사 결과는 `scratchpad/flowers.json`, 진입 규약은 모두 `burstVN(layer,x,y,o)`. 주의: 심사 프롬프트에 코드를 6,000자로 잘라 넣은 탓에 v2·v3·v5·v6이 '코드가 잘렸다'며 감점됐다 — 실제 코드는 여섯 안 다 온전하니 순위는 참고만.
- 26.9.12 효과 버그 2건 수정(심사에서 발견): ① `fx()`가 `showReveal()`보다 먼저 불려 `#hoeCtx .fill`이 아직 없어 터지는 자리가 카드 중심으로 폴백했다 → `.fill || .blanks || card` 순으로 고침(빈칸 컨테이너는 공개 전에도 있다). ② `@keyframes rg2`가 width/height를 애니메이트해 링마다 레이아웃을 유발했다 → 200px 고정 + `transform:scale(.08→1)`로 교체.
- 26.9.12 콤보 숫자 제거·중앙 하트 광원(영신): 'N COMBO' 텍스트와 `.combo`/`comboPop` 삭제(꽃 개수가 콤보를 이미 표현). 중앙 광원을 원형 radial-gradient에서 하트 SVG(`heartGlowSVG()`, 그라데이션을 채운 하트 path, 104px, 0.55초)로 교체. 금색 그라데이션은 보라 배경에 겹치면 갈색으로 탁해져 흰빛·분홍 계열로 잡음. `mix-blend-mode:screen`은 `#fxLayer`가 z-index로 자체 합성층을 만들어 페이지 배경까지 닿지 않아 쓰지 않음.
- 26.9.12 색 연구(영신: 눈 피로·명시성 고려, 단 **흰 뜻 글자·노란 단어·흰 해설은 유지**): 채도만 낮추고 명암비는 올리는 방향. 예문 `--pinkpale` #ffd0e7→#f6e2ec(채도 1.00→.53, 13.5→14.9:1), 번역·라벨 `--muted` #cdbcef→#c6bcdd(채도 .61→.33, 10.2:1), 발음기호는 `--cyansoft` #a5dfef 신설(#5ce6ff의 채도 1.00→.70, 12.6:1 — `--cyan`은 다른 강조에 그대로 둠), 오답 글자는 `--bad2` #ff8a94(6.2→8.1:1, 테두리는 진한 `--bad` 유지), 경계 `--line` #5a2d7a→#6f3c95(1.83→2.41:1). 플레이 중 별 깜빡임 정지(`body.playing::before{animation:none}`) — 1.5초마다 화면 전체가 켜졌다 꺼지는 게 피로의 가장 큰 원인이었고 '움직이는 요소 없음' 원칙과도 맞음. 실측: 예문 14.86 / 뜻 18.35 / 단어 12.83 / IPA 12.59 / 번역 10.17 / 해설 18.35:1.
- 26.9.12 글자 확대·카드 폭(영신): 플레이 중 좌우 여백 13→6px, 카드 안쪽 14→10px로 테두리를 더 바깥으로. 뜻 1.55~2.2rem, 예문 1.42~1.8rem, 빈칸 22px·1.5rem, 공개 단어 2.1~3rem, IPA 1.3(강세 1.95), 번역 1.16, 해설 1.26rem. 공개 화면에선 이미 답한 뜻 줄을 1.05~1.3rem으로 줄이고 넘칠 때 카드 스크롤 — 390×380(작은 폰·키보드 올라옴)에서도 해설 끝 373px로 한 화면.
- 26.9.12 발음 목소리 고정(영신: 남녀 목소리가 번갈아 남 — 아이폰 사파리는 정상, 초반부·내장 브라우저에서 이상): 원인은 목소리 목록이 페이지 열 때 비어 있는데 `pickVoice()`를 한 번만 불러 초반엔 기기 기본(남성일 수 있음)으로 읽다가 목록이 차면 바뀌던 것. 수정 — ① 말할 때마다 목소리 확인, ② 한 번 정한 이름(`_voiceName`)을 세션 끝까지 유지, ③ 점수제(`voiceScore`: en-US 우선, 선호 여성 목소리 가점, male/Alex/Daniel/Fred/Aaron 등 감점, novelty 목소리 큰 감점, 내장 목소리 가점)로 선호 목록에 섞여 있던 Daniel(남성) 제거, ④ 목록이 아직 없으면 기기 기본으로 읽지 않고 최대 1.2초 대기, ⑤ WKWebView(앱 내장 브라우저)는 한 번 말해야 목록이 차므로 volume 0 무음 발화로 깨움(`primeVoices`). 세 기기 목록(iOS·WKWebView·안드로이드)을 재현해 첫 단어부터 한 목소리로 고정됨을 확인.
- 26.9.12 발음기호 위치 시험(영신): 단어 오른쪽 → 단어 아래 중앙(`.rv-word{flex-direction:column}`). 더 안 좋으면 `flex-direction:row;gap:10px`로 롤백. 카드 높이 349→371px.
- 26.9.12 무지개 꽃잎(영신): 꽃잎마다 `hue-rotate(i/P·360°)`로 색상환을 돌리고 빛도 같은 색(hsl). 장미 SVG 하나로 전 색 표현.
- 26.9.12 콤보 표현(영신): 꽃잎 수 = 연속 정답 수(1연속 1송이 … 최대 40), 불티는 4+연속 수(최대 24), 퍼지는 거리 1+연속×0.05(최대 1.75배). 3연속부터 'N COMBO', 5연속부터 링, 10연속부터 가장자리 금빛.
- 26.9.12 공개 순서(영신): 문장 → 해석 → 단어·발음 → 해설·meow (`rvTr`/`rvWord`/`rvBody`). 따라쓰기도 같은 순서.
- 26.9.12 그림자·광원 전면 제거(영신): 패널·지도·말풍선·버튼·타일·카드 테두리·뜻·공개 단어·빈칸 글자·제목·엔딩 카드의 box-shadow/text-shadow 전부 삭제(`--shadow:none`). 남긴 것은 고양이 이미지 drop-shadow, 정답 뒤 파티클·콤보 텍스트·카드 펄스, 퍼펙트 포효, 금색 버튼의 4px 하드 밑단뿐. 원칙: 화면 요소엔 그림자·광원 없음, 효과는 고양이와 정답 뒤에만.
- 26.9.12 명시성(영신: 단어 부분이 희뿌옇다): 공개 단어 `.rv-w`의 흰 블러 광원 제거(또렷한 그림자만), 빈칸 정답 글자 `.fill`·입력 글자 `.slot`의 text-shadow 번짐 제거, 뜻 `.meaning`의 청록 번짐 완화(0 0 6px .3).
- 26.9.12 효과 정리(영신): 매 정답은 꽃만(콤보가 오르면 꽃잎·불티 수와 퍼지는 거리 증가, 3연속부터 링, 10연속부터 가장자리 금빛), 콤보는 영어 숫자 텍스트 'N COMBO', 마무리(결과 화면 틀린 단어 지우기)는 하트, 퍼펙트는 MGM 고양이. 길이는 원래(1.1~1.9초)의 절반쯤: 꽃잎 0.9~1.2초·불티 0.7~0.9초·섬광 0.6초·링 0.8초·정리 1.4초. 0세트 grandparent ① ko '(한 분)' 삭제, c에 '한 분 = grandparent, 둘 다면 -s' 설명.
- 26.9.12 콤보·퍼펙트(영신): 연속 정답 수로 효과 단계(`comboTier`: 3~5 꽃잎·불티 증가+링, 6~9 하트 섞임, 10+ 화면 가장자리 금빛), 빈칸 위에 '×N' 콤보 수가 떠올랐다 사라짐, 정답음이 콤보마다 높아짐(`beep('ok',combo)`). 퍼펙트 클리어(오답 0·첫 시도 100%·부분 세션 아님)면 결과 화면 위에 `#roar` 오버레이 — 금빛 광선 회전 + 고양고양이 확대·포효 + 팡파르(`fanfare()`) + 진동, 2.2초 뒤 또는 탭으로 닫힘. 연속 정답 때 이전 정리 타이머가 새 파티클을 지우던 버그 → 세대 번호(`fxGen`).
- 26.9.12 광원 효과 교체(영신: 큰 하트+장미 14송이가 정답 글자를 가림): 정답은 빈칸(정답 글자) 자리에서 작은 장미 꽃잎 10 + 금색 불티 10 + 섬광이 바깥으로 터져 0.6초 안에 끝(`burst()`, `.pt/.dot/.glowfx`). 결과 화면 틀린 단어를 지울 땐 그 줄 자리에서 하트가 커지며 빛나고 꽃잎과 함께 사라짐(`fxHeart()`, `.hpop/.ring2`). 주의: 파티클 클래스 이름이 카드의 `flash`·버튼의 `ghost`와 충돌한 적 있음 → 새 클래스는 `glowfx`처럼 고유하게.
- 26.9.12 플레이 검수(영신): 0세트 spelling ①은 alphabet 관련 설명을 넣었다가 영신 지시로 되돌림(원래 c 유지). 0세트 note ① 뜻 '메모, 필기'가 memo를 부름 → 뜻 '필기, 적어 둔 것', c에 "한국어 '메모'는 영어로 note. memo는 회사·조직의 공지문". 0세트 topic ① 'What is the ___ of your speech?'에 title이 들어감 → 'Money is a hot ___ in our house these days.'(hot topic 굳은 표현). 0세트 player ① c의 'MP3 player'는 요즘 학생이 모름 → '게임 player, 동영상 player'로, ko '선수; 재생기'의 세미콜론 정리 → '선수, 플레이어'. 0세트 writer ① 예문 'She wants to be a ___.'에 author도 들어감 → 'She works as a ___ for a TV show.'(방송작가는 writer, 책의 저자는 author)로 교체, c에 'author' 대비 추가.
- 26.9.12 결과 화면 틀린 단어: 탭하면 발음 + 그 줄이 사라짐(`.wrow.gone`), 마지막 줄까지 사라지면 '다음 연습'과 같은 동작(없으면 연습 목록). 진행 패널 회독 알약 톤 다운, 힌트 전구 정중앙(버튼 좌우 여백 0).
- 26.9.12 소리 아이콘: 공개 화면의 🔊 버튼 제거 → 금색 단어(`.rv-w`)를 탭하면 다시 읽음(click은 stopPropagation으로 넘김과 분리). 상단바·진행 패널의 이모지 스피커는 선 SVG(`spkSvg(muted)`)로, 무음이면 ×표 스피커.
- 26.9.12 가독성: 입력창이 사라져 남은 공간을 글자에 씀 — 뜻 1.4~1.95rem, 예문 1.28~1.62rem(행간 1.7), 빈칸 칸 20px·1.35rem, 공개 단어 1.9~2.7rem, IPA 1.18(강세 1.75), 번역 1.06, 해설 1.14rem. 키보드 올라온 390×420 시야에서 공개 화면(단어·번역·해설)이 한 화면에 들어옴(카드 높이 약 350px). '뜻 1/2' 줄은 비면 숨김.
- 26.9.12 UI 3차(영신 폰 테스트: 둘째 카드부터 키보드 안 뜸·정답 다 쳐도 안 넘어감): 1px 숨김 입력창은 iOS가 탭으로 되살리지 못한다 → 입력창을 문장 영역(`.exwrap`) 전체에 투명하게 겹침(문장 탭 = 입력창 탭, 네이티브 포커스라 키보드 보장). 빈칸이 다 차면 자동 확인(`mirrorTyped` 끝에서 `submit()`; 맞으면 공개, 틀리면 따라쓰기) — Enter는 조기 제출용으로만 남음. 공개 중 문장 영역 탭도 다음 카드(`onRevealTap`이 `#ainput`은 예외 허용).
- 26.9.12 UI 2차(영신): 입력창을 화면에서 없앰 — DOM엔 카드 안 1px·투명 `#ainput`(`.hform`)으로 남겨 키보드를 잡아 둔다(font-size 16px: iOS 자동 확대 방지). 카드 첫 줄은 [💡][뜻][고양이](`.qtop`), 카드 좌상단 회독·진행 메타 삭제(아래 진행 패널과 중복), 🔥 스트릭은 진행 패널로. 반복 안내문 삭제: '빈칸에 들어갈 단어를 입력', 따라쓰기 '따라 쓰면 넘어간다고양'. nextCard는 focus()를 동기로 먼저 부른다(연습 타일 탭 제스처 안에서 불려야 iOS가 키보드를 띄움). 원칙: 한 화면에 같은 정보 두 번 없음, 반복 안내문 없음, 움직이는 요소 없음.
- 26.9.12 UI 개편(영신 승인 8건): ① 문제 화면 재배치 — 플레이 중 상단바·지도 숨김(`body.playing`), 입력 띠(입력창·💡·고양이) → 카드(회독·진행 메타, 뜻, 예문, 힌트줄, 제한 바) → 진행 패널(세트·연습·회독·시간·오답·소리·나가기) 순. 뜻 글자 축소, 예문 확대. ② 정답 공개를 제자리에서 — 오버레이 대신 빈칸이 정답으로 채워지고(`.fill`) 카드 아래에 단어·IPA·번역·해설·meow가 붙는다(`#reveal`, `rvWord/rvBody/openReveal`). 오답 따라쓰기도 같은 빈칸에(`renderCopyBlank`: 초록 맞음·빨강 오타·보라 남은 글자). `#quizOverlay`는 비워 둔 채 미사용. ③ 넘김 안내(줄어드는 바 + '탭 · Enter → 다음')는 넣었다가 뺌 — 움직이는 요소가 시선을 끌고 안내문은 반복되며 공간만 차지(영신, 전에도 뺐던 것). 공개 화면엔 움직이는 요소·안내문을 두지 않는다. ④ 발음 읽어주기 — `speak()`(SpeechSynthesis, en-US 음성 선호 순위, 무음이면 안 읽음), 정답·오답 공개 때 자동, 🔊 버튼·결과 화면 틀린 단어 탭으로 재생. ⑤ 홈 '이어 하기'(`goyang-hoe-last-v1`에 마지막 연습 저장, `resumeTarget()`이 그 뒤 첫 미클리어 연습을 고름) + 세트 타일 진행 바·클리어 수, 46·47 형태론 세트는 청록. ⑥ 연습 타일에 기록(첫 시도 %·최고 시간). 단어 미리보기는 넣었다가 뺌(보면 아는 단어로 착각 — 영신). ⑦ 결과 화면 틀린 단어 목록(탭하면 발음) + '틀린 것만 다시'(`startExercise(i, Set)`, `session.partial`이면 기록 저장 안 함). ⑧ 제목 한 줄 축약, 오답 진동(안드로이드), 3연속부터 🔥 표시. 주의: 슬롯 클래스에 `ghost`를 쓰면 버튼 `.ghost`와 충돌(→ `gh`).
- 26.9.12 UI: 입력창에 치는 글자가 예문의 빈칸 칸에 실시간으로 채워짐(`mirrorTyped`, 답 입력 단계만; 정답 길이 초과분은 붉은 칸). 카드 탭이 입력창 포커스를 되살림(키보드가 내려간 뒤 복귀용).
- 26.9.11 UI: 정답 확인 때 입력창을 disabled로 잠그던 것을 없앰(포커스가 빠져 폰 키보드가 내려가고, iOS는 터치 없이 부른 focus()로 키보드를 안 올려 줌). 게임 화면에서 입력창 밖 mousedown 기본동작(포커스 이동)을 막아 카드·오버레이·힌트·고양이 탭에도 키보드가 유지됨. 입력창 Enter는 답 확인 → 공개 중엔 다음 카드. enterkeyhint done→go(안드로이드 '완료'는 키보드를 닫음). 카드 넘어간 직후 400ms 안의 빈 Enter는 무시. 결과 화면 '첫 시도 정답률 (힌트 제외) · 힌트 N회'. 45장 신설 후 카드 6,002.
- 26.9.9 헌장 v2.1→v2.2(뜻 개수 상한 없음, 층 체계·표제어 단위 정리, 3층 이름은 v2.3에서 HoE(Heart of English, 콘래드 『Heart of Darkness』에서 딴 것)로 복원). deduction 예외 추가, E-3 잔여 5건, 중복 검사 신설(trillion 중복 제거, 예문 재사용 4건 교체), 발음 강세 강조 복구(fmtIpa), meow 0~22 재정비 299줄 + 1~4세트 신설 68줄. 카드 5,695 · 표제어 4,639 · meow 595.

## 7. 새 세션 첫 10분 체크리스트

1. 이 문서와 헌장 아티팩트 읽기.
2. `git clone https://github.com/esqsoy/vocagoyang.git /home/claude/vocagoyang` → `git push` 가능한지 시험(가능하면 앞으로 커밋·푸시 직접).
3. zip 풀기(또는 3-1 복원) → `python3 assemble.py`로 바이트 수 일치 확인 → `python3 audit.py out/set45.json`이 `문제 0`인지 확인.
4. 영신에게 한 줄: "복원 확인, 작업 가능. 뭐부터 할까?" — 미결 1번부터 제안.
