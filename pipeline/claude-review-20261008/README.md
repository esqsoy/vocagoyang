# Claude 리뷰 반영 · 2026-10-08

## 무엇을 했나

Claude가 Codex 3주 작업(78커밋) 후의 최신판을 리뷰했다. 리뷰 범위는 테스트 32개, 폰 화면 플레이, 새로 만들거나 뜻·예문이 바뀐 카드 1,794장이다. 그중 영신이 승인한 수정을 반영했다.

- `review-findings.json`: 카드 검수 원결과. 4명이 찾고 4명이 반박 검증했다. 검증을 통과한 결함은 62건이다.
- `content-fixes-edits.json`: 실제로 바꾼 필드 목록(단어·필드·전·후). 결함 62건과 고양이 meow 12개다.
- `content-fixes.json`: 변경 원장. DATA와 원본 파일의 경로 단위 전후 값과 해시를 담았다.
- `restore.cjs`: 원장을 거꾸로 적용하는 복원 함수. Codex의 복원 체인 맨 위에 연결했다(`restore-player-feedback-20261007.cjs`, `restore-word-family-wording.cjs`). 그래서 이전 단계의 고정 해시 검사가 그대로 유지된다.
- `ledger-lib.cjs`: 원장 생성과 복원이 함께 쓰는 비교·되돌리기 규칙.

## 왜 이렇게 고쳤나

결함 52건이 빈칸 중의성이었다. 다른 영어 단어가 같은 글자 수로 들어가는데, 해설에도 허용 정답에도 그 단어가 없는 경우다. 학생은 맞는 영어를 치고도 틀린다. 9/19 이후 이 기준과 `collide.py`가 문서에서 빠진 뒤 만든 새 뜻 카드에서 치명 결함 9건이 나왔다.

- **고치는 순서:** 10/2 동의어 원칙대로 먼저 해설에 "이 뜻에서는 X와 바꿔 쓸 수 있다"를 넣었다. 예문은 해설로 막을 수 없을 때만 바꿨다. 그런 경우는 부자연스러운 영어, 사실 문제, 수준·어휘 이탈, 해설로 해결되지 않는 중의성이다.
- **해설 길이:** 47·48세트 해설은 70자 기준(Codex)을 지켰다. 0~45세트는 덧붙이면서 72자를 넘기지 않게 다듬었다.
- **영신이 승인한 역사 예문은 최대한 살렸다.** share는 문장을 그대로 두고 해설만 보강했다. death·power·space는 오늘 확정한 통제·3줄 기준에 걸려 지식 문장으로 다시 썼다. power의 해설 "demo-+-cracy"는 예문이 민주정 얘기가 아니게 되어 바꿨다.
- **in fifteen minutes의 허용 정답 after는 뺐다.** Codex는 "after fifteen minutes도 자연스럽다"며 허용했다. 하지만 이 카드가 가르치는 것은 "지금부터 ~후"는 in이라는 구별이다. after는 한국 학습자의 대표 오류다(Cambridge Grammar). 49·50세트는 허용 정답을 명시해야 하는 규칙이 있어 빈 배열로 두었다.
- **parameter 예문의 budget:** Fable 표제어 밖의 단어지만 사람 판단으로 허용했다. guideline과의 중의성을 막는 핵심 단어이고, 기본적인 단어다.
- **고양이:**
  - port·sting·robot은 영신이 승인했다. 나머지는 "더 찰지게"라는 허락을 받아 맛을 되살렸다. 말풍선은 390px에서 두 줄 안에 들어가게 맞췄다.
  - 동의어 대사는 영신 방향("맨날 똑같은 단어만 쓸 거냐고양! 새로운 걸 배우라고양!")을 따랐다. 동의어를 친 학생은 아는 말을 쓴 것이라 "도망"으로 몰지 않는다.

## 그림 법칙 사촌 쌍(`cousin-pairs.json`)

48세트 마지막 연습으로 「그림 법칙 · 아는 단어로 여는 사촌 단어」를 넣었다(영신 "넣자", lunar·oral 포함). 9/19 형태론 재설계 때 빠진 사촌 쌍을 되살린 것이다. 그때 cardiac·pedestrian·novel(소설) 같은 단어가 Fable에서 사라졌다.

- **자리:** 바로 앞 연습 "영어에 남은 오래된 word family"는 게르만계 고유어를 다룬다. 그 뒤에 두면 라틴·그리스 어근 → 고유 영어 → "둘은 사촌"의 순서로 48세트가 닫힌다. 짝이 되는 father·foot·heart·three·night·horn·star·new는 모두 0~12세트에서 이미 배운 단어다.
- **단위:** 소리 대응별로 5개다(p↔f / t↔th·d↔t / k↔h / 그 밖의 짝과 예외 / 가짜 사촌). 카드는 14장(신규 표제어 12, maternal 복습 1, novel 2뜻)이다.
- **정확성:** mother·father의 th는 그림 법칙이 바로 만든 게 아니다. 고대영어 mōdor·fæder의 d가 15세기 무렵 바뀐 것이라 단위 설명에 밝혔다. 『프랑켄슈타인』은 1818년에 '나왔다'(쓴 해가 아니다).
- **가짜 사촌 lunar·oral:** 법칙을 아무 데나 갖다 붙이는 것을 막는 예방주사다. 뜻이 같아도 소리 대응이 없으면 사촌이 아니다.
- **현재 개수:** 단위 141→146, 카드 358→372, FABLE 7,067→7,081카드, 623→624연습, 표제어 4,916→4,928. `morphology-content.test.cjs`의 현재 개수만 갱신했고, 이전 단계 검사는 이 원장으로 되돌려 그대로 유지한다.

## 함께 바뀐 테스트

- `test-answer-replay.cjs`: "다시 듣기 중에는 옛 소리가 끝나도 넘어가지 않는다"는 성질을 확인하는 테스트다. 원래는 0.3초에 시작한 다시 듣기가 해설 대기 내내 재생 중이라고 가정했다. 해설 읽을 시간을 원값으로 되돌리자 긴 해설(6초 초과)에서는 발음 안전 상한(시작 후 6초)이 먼저 발동해 30번 중 3번 실패했다. 실제 단어 발음은 1초 남짓이라 학생에게는 생기지 않는 상황이다. 그래서 다시 듣기를 자동 진행 직전에 시작하도록 바꿨다. 고친 테스트는 수정 전 main에서도 30번 모두 통과한다. 판정을 약하게 한 것이 아니다.

## 긴 예문 다시 쓰기(`long-examples.json`)

영신이 3줄 기준을 확정했다. 정답을 채운 문장은 3줄, 긴 정답 칸 때문에 늘어난 문제 화면은 4줄까지다. 근거는 [PRINCIPLES 2-2](../../PRINCIPLES.md#2-2-한계-한눈에-들어오는-길이). 이 기준을 넘던 예문과 영신이 지적한 카드들을 고쳤다(22카드, DATA 49곳·원본 15파일, 3790f5c 기준). 사람이 읽는 목록은 `long-examples-edits.json`이다.

- **power ③:** 3줄에 맞추려고 아테네 문장을 줄이다가 "남자만 가진 권력"의 예문이 됐다(영신 지적). 지금은 "In a democracy, all power comes from the people."(헌법 제1조의 표현)이다. 해설은 영신의 `demo-(민중) + -cracy(통치)`에 '권력'을 더했다. -cracy는 그리스어 kratos(힘·통치)에서 왔다.
- **역사 예문:** 영신이 승인한 문장의 뜻과 시기 표시(WORK_PLAN 26.10.07)를 지키며 줄였다. 예를 들어 1·2차 세계대전 연도, 몽골 13세기, 실크로드 '고대와 중세', 증기기관 1700~1800년대를 그대로 두었다.
- **photograph:** data 카드와 같은 문장에 빈칸만 옮긴 쌍이었다. "An X-ray photograph taken in 1952 gave a key clue to DNA's shape."로 바꿨다. 1952년은 사진을 찍은 해이고(Photo 51), 구조 규명(1953)과 구별된다.
- **experience ②:** 대공황 예문은 PRINCIPLES 2-4의 나쁜 예다. 단어가 중심인 경구로 바꿨다.
- **긴 정답 칸:** international·manufacturing은 문장이 3줄이다. 다만 13자 정답의 칸이 두 줄로 갈라져 화면은 5줄이었다. 72장에 같은 일이 있는 화면 문제라 문장을 비틀지 않았다. 영신 승인을 받아 세 교재 공통 CSS로 "그 단어의 칸만 함께 좁히기"를 넣었다.
- **영신 2차 지적(같은 날):**
  - democracy(24)의 여성 투표권 문장은 민주주의가 아니라 여성의 권리 이야기라 직접 민주주의 문장으로 바꿨다.
  - government는 법을 만드는 주체(의회)를 정부로 쓴 문장이라 입법·집행을 가르는 문장으로 바꿨다.
  - interaction은 더 좋은 지식 예문(아기의 언어 습득)으로 바꿨다.
  - 거시·미시경제학은 정의의 범위를 바로잡았다([PRINCIPLES 2-5](../../PRINCIPLES.md#2-5-학문-용어는-짧아도-철저하게)).

## 지식 예문(`knowledge-01.json`~`knowledge-12.json`)

영신 구상(26.10.08): 5,000단어를 다 보고 나면 세계사·과학사의 틀이 남게 예문을 쓰자. 지식 지도를 먼저 짜고 단어를 거는 방식은 [PRINCIPLES 2-6](../../PRINCIPLES.md#2-6-지식-예문은-지도부터-막히는-어휘는-더한다), 지도는 [MAP.md](../knowledge-map/MAP.md)에 있다.

- **1묶음(`knowledge-01`, 25카드):** 1세트 서수를 세기의 척추로 쓰고(fourth=로마 국교, fifth=서로마 멸망, seventh=이슬람), 달·하루·한 해와 1장 '인류의 시작'(human·stone·cave·wheat·corn·river·irrigation·history·clay·alphabet 등)을 걸었다. 영신 "tight!". 문장 목록: `../knowledge-map/batch-01-applied.json`.
- **2묶음(`knowledge-02`, 새 표제어 50개 + burial):** 지식 문장을 쓰다 막힌 단어를 더했다(영신 "어휘 제약은 … 추가해서 해결하자"). 16·26·34·42세트 끝에 '지식 어휘 Ⅰ~Ⅳ' 연습(14·14·11·11장)으로 붙였다. burial은 pyramid와 함께 쓸 수 있게 되어 21세트 예문을 고대 이집트 문장으로 바꿨다. 목록: `../knowledge-map/batch-02-new-words.json`.
  - 새 연습은 이름에 번호 범위가 없다. `assemble.py`의 세트 이름(예: 26세트 2484~2583)은 범위가 있는 연습만으로 계산한다.
  - 개수: FABLE 7,081→7,131카드, 624→628연습, 표제어 4,928→4,978. 테스트는 개수를 DATA에서 읽어 단언을 바꾸지 않고 32/32 통과했다.
- **3묶음(`knowledge-03`, 26카드):** 2장 고대 제국과 사상(그리스·로마·중국·세계 종교), 3장 중세와 교류(중세 유럽·이슬람 학문·바이킹). 영신 "tight!!!!!!". 예문·해석과 해설 8장만 바꿨다. 목록: `../knowledge-map/batch-03.json`.
  - 고유명사 안에 빈칸을 두지 않는다. 화면(`answerInSentence`)은 문장 첫머리만 대문자로 바꾸므로 "the Roman empire"처럼 소문자로 보인다.
- **4묶음(`knowledge-04`, 21카드 + 새 표제어 monarchy):** 4장 르네상스와 대항해(르네상스·인쇄술·항해·콜럼버스 교환·노예무역), 5장 종교개혁·절대왕정·의회 정치·계몽사상. 영신 "전부 동의". 목록: `../knowledge-map/batch-04.json`.
  - monarchy는 absolute·constitutional 예문이 쓰는 말이라 표제어로 더했다(42세트 지식 어휘 Ⅳ, monarch 다음). FABLE 7,132카드·표제어 4,979, 세 교재 합집합 8,310.
  - 영신 검토에서 해설 규칙이 생겼다(아래 '해설은 단어에 관한 것만'). 초안 해설의 마젤란·1689년·몽테스키외·말의 빙하기 소멸·대항해의 동기를 뺐고, 노예무역의 시기는 slave·plantation 예문으로 옮겼다.
  - parliament(18세트)는 "Many countries have an elected parliament…"로 바꿔 2-7 경계 사례도 정리했다. parliamentary와 congressional(13자)은 해설로 구별한다.
- **5~10묶음(`knowledge-05`~`knowledge-10`, 174카드):** 영신 "이제 예문작업을 완성해버리자! 전부!" 지도 6~14장을 모두 쓰고, 지도 밖에서 조사가 F(수정 필요)로 판정한 14장도 고쳤다. 지도의 노드는 이것으로 모두 끝났다.
  - 5묶음 26장: 시민혁명(미국·프랑스·아이티·1848·볼리바르·나폴레옹), 산업혁명(석탄·면직·철도·증기·동력 직기), 노동조합·노동 계급, 애덤 스미스·리카도, 노예제 폐지. F였던 lead·coal·slavery·abolish를 고쳤다.
  - 6묶음 28장: 민족주의·통일, 제국주의(해군·원료·유럽 이민 6천만·1857 인도), 메이지, 러시아 혁명과 공산주의, 불황, 홀로코스트, 유엔·인권선언, 냉전, 소금 행진·아파르트헤이트·만델라, 복지 국가, 세계화. 세계대전 카드는 9장으로 묶었다(아래).
  - 7묶음 36장: 과학사. 지동설·뉴턴·세포·돌턴·주기율표·유전자·세균과 백신·항생제 내성·원자로·전자기 유도·질량-에너지 등가·판게아·빅뱅·과학적 방법·유클리드·미적분. data는 티코 브라헤, field는 이븐 시나로 고쳤다.
  - 8묶음 56장: 핵심 개념(수능 독서 배경). 무게와 질량, 벡터·속도·빗면·마찰, 빛·소리, 계절·조석, 광합성·심장·면역, 기후·온실가스, 기회비용·수요·공급·균형·탄력성·독점, 무역 적자·최저임금, 헌법·주권·형평, 학문 이름, 생물 다양성. 예문만으로 정의가 완결되게 썼다(PRINCIPLES 2-5).
  - 9묶음 14장: 세계 지리 3장과 경구 11장. corrupt는 액턴의 실제 문구("power tends to corrupt")로 바로잡았다.
  - 10묶음 14장: 지도 밖 F 판정. international·scientific(포퍼)·nervous·invent·civilization·liberty(로크, 표제어 철자 en을 소문자로)·earthquake·capitalist·linguistics·inversion·locus·syntactic·industrialize·revolution(48).
  - **세계대전 쏠림 방지:** 영신이 앞서 세계대전 세부 날짜·전후 사건 쏠림을 지적했다. 그래서 전쟁 카드는 9장(last·eleventh·twentieth·invade·fifteenth·bomb·establish·treaty·Jew)으로 묶었다. 같은 1945년 종전을 담던 end는 1960년 '아프리카의 해'로 옮겼다. tank·precipitate·occupation·propaganda·tribunal은 두었다.
  - **만든 방법:** 지침(`../knowledge-map/BRIEF.md`)을 써서 하위 에이전트 6개가 장별로 초안을 썼다. Claude가 모든 카드를 다시 읽고 사실·축·중의성을 확인하고, 몇 장은 고쳐 썼다(예: French는 '당시 프랑스 식민지 아이티', season은 lean 대신 'the Earth leans as it goes around the Sun', 애덤 스미스 1776은 한 장에만). 묶음마다 exaudit·linecheck 390·360px·deepcheck·collide를 돌렸다. 묶음마다 원장을 만들었다.
  - **표제어 밖이라 막힌 단어 9개**는 표제어 안 단어로 먼저 썼고 제안으로 남겼다(`../knowledge-map/new-word-proposals-20261008.json`).
- **11묶음(`knowledge-11`, 26.10.09):** 영신 "smallpox 빼고 다 넣자". 8개(crown·mammal·policy·domestic·inspire·magnet·invisible·spinal)를 지식 어휘 Ⅰ~Ⅳ에 더했다. 연습 하나가 15장을 넘지 않게 나눴다(Ⅰ crown, Ⅱ mammal, Ⅲ policy·domestic·inspire·magnet, Ⅳ invisible·spinal).
  - 그 단어로 쓰려던 카드 8장을 바꿨다: honesty "Honesty is the best policy.", gross GDP, bat 유일하게 나는 포유류, induction 패러데이, nervous 중추 신경계, market 보이지 않는 손, emperor 나폴레옹 대관, American 영감.
  - 새 단어 카드의 예문은 바꾼 카드와 다른 사실을 담는다(예: magnet은 지구 자기장, mammal은 고래, inspire는 간디와 킹 목사). FABLE 7,140카드·표제어 4,987, 세 교재 합집합 8,311(7개는 마더텅·EBS에 이미 있었다).

- **12묶음(`knowledge-12`, 26.10.09 영신 검토 1차):** corn(예문은 멕시코 옥수수의 전파, 해설은 Indian corn→corn), academy(해설은 사관학교만), silk(비단이 무엇인지), plantation(수출용 단일 작물·노예 노동을 예문으로, 해설은 '식민지의 농장화'), communism(무엇인지 간결하게). 이유는 [PRINCIPLES 2-5](../../PRINCIPLES.md#2-5-학문-용어는-짧아도-철저하게).

## 해설은 단어에 관한 것만(`word-notes.json`)

영신 26.10.08: "이게 영단어장이니까 가급적이면 단어와 관련된 것만 해설로 하자. … 만약 필수적인 정보라면 예문화하는게 맞다고 봄". 원칙은 [PRINCIPLES 4](../../PRINCIPLES.md#4-해설은-꼭-필요한-것만).

- 1~3묶음과 지식 어휘 카드 해설 124개를 다시 읽고, 단어와 상관없는 사건·인물·연도·수치가 든 12장을 고쳤다. 목록과 이유: `word-notes-edits.json`.
- 바꾼 해설은 어원·파생어·연어·다른 뜻으로 채웠다(gravity '사태의 심각성', inertia '타성', plague 동사 '괴롭히다', acceleration→accelerator).
- 꼭 필요한 사실 두 개는 예문으로 옮겼다. unemployment "In the Great Depression, US unemployment hit 25 percent.", plague "…called the Black Death killed a third of Europe."
- 어원(March·volcano·November 등), 이름에 그 단어가 든 고유명사(the Great Wall of China 등), 속담의 유래(road)는 단어에 관한 것이라 남겼다.

## 고유명사 안 빈칸(`proper-nouns.json`)

영신 26.10.08: "이런 경우는 예문을 좀 변경하고 고유명사를 해설에 적시하면 어때?" 단어를 일반 명사로 쓰는 예문으로 바꾸고 정식 이름은 해설에 적는다([PRINCIPLES 2-7](../../PRINCIPLES.md#2-7-고유명사-안에-빈칸을-두지-않는다)). 0~50세트를 훑어 5장을 고쳤다. 목록: `proper-nouns-edits.json`.

- empire(27): "In 27 BC, Rome became an empire ruled by Augustus." 영신 예시의 '2세기'는 영토가 가장 넓던 때라, 제국이 된 해로 바로잡았다.
- pyramid(16): "Egypt's largest pyramid was built about 4,500 years ago." 해설에 the Great Pyramid of Giza.
- pole ②(17): "The Earth spins around a line between its two poles." 해설은 원래 the North Pole·South Pole을 담고 있었다.
- hemisphere(48): "The equator divides the Earth into two hemispheres." 해설에 the Northern Hemisphere. 34세트 equator와 이어진다.
- lunar(48): "Seollal is New Year's Day on the lunar calendar." 사촌 쌍 해설은 그대로다.
- 47·48세트의 두 예문은 형태론 검사(10단어 이내, 해설 70자 이내)를 지킨다.

