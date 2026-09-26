# Fable 해설 전수조사 · 2026-09-27

**상태: 2026-09-27 배포 변경에 포함. 배포 범위는 [DEPLOYMENT.md](../../DEPLOYMENT.md)에 기록한다.**

후속 강세 해설 수정 63개는 [강세 정리 보고서](../stress-review-20260927/report.md)에 기록했다. 아래 내용은 그 이전의 편집 이력이다.

기준 커밋: 4c993cca763be5f8deb688e06337352aa800fcb9. 전체 6,859카드, 해설 있는 카드 6,259개(서로 다른 문구 6,161개)를 모두 읽었다. 해설 없는 600개도 목록에 포함했다.

뜻·예문과 대조해 341개 카드의 해설을 수정했다. 314개는 축약했고, 27개는 해설 전체를 삭제했다. 단어 카드는 6,859개 모두 유지했다.

해설 문자 수는 265,896 → 261,290로 4,606자(1.7%) 감소했다. 수정 대상 해설만 보면 34.1% 감소했다. 공백·문장부호를 포함한 JavaScript 문자열 길이 기준이다.

## 판단 기준

- 뜻·예문에서 이미 알 수 있는 설명, 같은 전치사를 두 번 알리는 말, 학습 명령·빈도 표지·곁말을 줄인다.
- IPA와 음성으로 알 수 있는 단순 발음·강세 설명은 줄인다. 동형이음어, 품사별 강세 대조, 묵음, 구체적 오독 대조는 유지한다.
- 의미 구별, 구문·전치사·가산성, 사용역·방언, 어족·어원은 유지한다. 짧은 해설이나 긴 해설을 길이만으로 판단하지 않는다.
- 47·48세트의 어원 자료와 원어 표기는 변경하지 않는다. 개별 카드의 부수적인 학습 지시만 일부 줄인다.
- 과학·역사·어원·사전 정의 전체를 새로 사실 검증한 결과는 아니다. 이번 범위는 불필요한 해설을 덜어내는 편집 검토다.

## 유형별 건수

| 주된 사유 | 카드 수 |
|---|---:|
| 같은 정보·뜻·예문 반복 | 66 |
| 학습 지시·군더더기 표현 | 159 |
| 단순 발음·강세 중복 | 73 |
| 단어 학습 기여가 낮은 곁말 | 21 |
| 뜻·예문에 이미 있는 설명만 남음 | 22 |

복합 사유가 있는 카드도 주된 사유 하나로 집계했다.

## 삭제하지 않기로 한 후보

- **team** (1:8:4): 스포츠 밖 업무의 팀에도 쓰인다는 적용 범위가 추가된다.
- **deep** (8:8:15): depth라는 어족과 심호흡 구문 모두 새 정보다.
- **knee** (12:3:8): 묵음 k와 다른 kn- 단어의 연결을 유지한다.
- **northern** (13:3:1): th 발음의 구체적인 주의점은 이번 단순 강세 정리에서 제외한다.
- **row** (13:9:8): 가로 방향과 in a row의 연속 의미가 추가된다.
- **smoke** (14:9:7): 예문 자체가 속담이므로 한국어 대응은 비유 해석에 필요하다.
- **onion** (16:7:1): 한국어식 오독을 구체적으로 바로잡는 대조는 유지한다.
- **adjective** (21:1:7): 추상적 문법 용어를 실제 단어로 설명하므로 유지한다.
- **relate** (23:6:7): 구어라는 사용역 정보가 있으므로 유지한다.
- **absorb** (29:7:12): s의 유성음이라는 구체적인 오독 방지 정보는 유지한다.
- **trauma** (31:5:2): 정신적 충격과 신체 외상의 의미 구별에 기여한다.
- **vitamin** (31:7:6): 한국어 차용어와 다른 미국식 첫소리를 짚는 안내는 유지한다.
- **computing** (37:5:2): 한국어 컴퓨팅만으로 불명확할 수 있는 분야의 범위를 풀어 준다.
- **transparency** (39:3:9): 물질의 투명함과 정보 공개의 비유적 투명성을 구별한다.
- **complement** (40:7:7): to 결합과 compliment의 철자·의미 대조 모두 필요하다.
- **conquer** (40:7:8): quer의 읽기와 명사 conquest를 유지한다.
- **smoothly** (41:8:3): th의 유성음이라는 구체적 읽기 정보는 유지한다.
- **pint** (41:10:4): 액체 단위의 실제 크기와 i의 예외적인 읽기를 유지한다.
- **excerpt** (43:3:2): 명사라는 품사를 특정한 강세 설명은 이번 단순 강세 정리에서 제외한다.
- **computation** (44:2:9): 계산이라는 번역어의 사용 분야를 좁혀 준다.
- **unimportant** (44:6:6): in-과 un-의 실제 선택 대조는 유용하다.
- **utterance** (45:4:10): 발화라는 낯선 용어의 단위를 풀어 준다.
- **from** (49:3:2): from/to의 값과 by의 변화량을 숫자로 구별하는 연습에 기여한다.
- **cut down on** (50:6:3): 기존 reduce와 구동사의 뜻·목적어 연결을 유지한다.

## 전체 수정 내용

식별자는 원본 DATA의 `세트:원본 exercise:0부터 센 카드 위치`다. 화면에서 재분할된 exercise 번호와 다를 수 있다. 빈 수정안은 해설만 없애며 뜻·예문·발음은 유지한다.

### 0:1:13 · eleven (1)

- **뜻:** ① 열하나, 11
- **예문:** The game ends at {{BLANK}}.
- **원문:** 둘째 음절에 강세: e-LEV-en. 서수는 eleventh.
- **수정:** 서수는 eleventh.
- **이유:** 단순 발음·강세 중복

### 0:1:16 · fourteen (1)

- **뜻:** ① 열넷, 14
- **예문:** Our class has {{BLANK}} boys.
- **원문:** 강세는 teen에.
- **수정:** 해설 삭제
- **이유:** 단순 발음·강세 중복

### 0:2:12 · trillion (1)

- **뜻:** ① 조(10¹²)
- **예문:** The country's debt is over a {{BLANK}} dollars.
- **원문:** 1조. 천×billion=trillion(0 열두 개). 1 trillion=1조, 우리말 단위와 딱 맞는 자리.
- **수정:** 천×billion=trillion(0 열두 개).
- **이유:** 같은 정보·뜻·예문 반복

### 0:3:1 · Tuesday (1)

- **뜻:** ① 화요일
- **예문:** We have music class on {{BLANK}}.
- **원문:** 발음 [투즈데이]. 게르만 전쟁의 신 Tiw의 날.
- **수정:** 게르만 전쟁의 신 Tiw의 날.
- **이유:** 단순 발음·강세 중복

### 0:3:5 · Saturday (1)

- **뜻:** ① 토요일
- **예문:** Let's play soccer on {{BLANK}}.
- **원문:** Satur-: 토성 Saturn의 날. 주말은 Saturday와 Sunday.
- **수정:** Satur-: 토성 Saturn의 날.
- **이유:** 단어 학습 기여가 낮은 곁말

### 0:3:8 · February (1)

- **뜻:** ① 2월
- **예문:** It is very cold in {{BLANK}}.
- **원문:** 철자 함정: Feb-ru-ary, r이 두 개. 발음 [페뷰어리].
- **수정:** 철자 함정: Feb-ru-ary, r이 두 개.
- **이유:** 단순 발음·강세 중복

### 0:3:11 · July (1)

- **뜻:** ① 7월
- **예문:** We go to the beach in {{BLANK}}.
- **원문:** 강세 뒤: ju-LY. June과 구별.
- **수정:** 해설 삭제
- **이유:** 단순 발음·강세 중복

### 0:3:12 · August (1)

- **뜻:** ① 8월
- **예문:** It's hottest in {{BLANK}}.
- **원문:** 강세 앞: AU-gust. 줄임 Aug.
- **수정:** 줄임 Aug.
- **이유:** 단순 발음·강세 중복

### 0:3:16 · December (1)

- **뜻:** ① 12월
- **예문:** We have a party in {{BLANK}}.
- **원문:** decem=10. 줄임 Dec. 크리스마스의 달.
- **수정:** decem=10. 줄임 Dec.
- **이유:** 단어 학습 기여가 낮은 곁말

### 0:4:1 · hi (1)

- **뜻:** ① 안녕 (가벼운 인사)
- **예문:** {{BLANK}}, Amy! How are you?
- **원문:** hello보다 가볍고 친근하다. 친구에겐 hi.
- **수정:** hello보다 가볍고 친근하다.
- **이유:** 같은 정보·뜻·예문 반복

### 0:5:0 · I (1)

- **뜻:** ① 나는, 내가
- **예문:** {{BLANK}} am a student.
- **원문:** 항상 대문자 I. 문장 어디에 있어도 대문자.
- **수정:** 항상 대문자 I.
- **이유:** 같은 정보·뜻·예문 반복

### 0:5:5 · cousin (1)

- **뜻:** ① 사촌
- **예문:** My {{BLANK}} lives in Busan.
- **원문:** 발음 [커즌]. 남녀 구별 없이 cousin.
- **수정:** 남녀 구별 없이 cousin.
- **이유:** 단순 발음·강세 중복

### 0:6:4 · paragraph (1)

- **뜻:** ① 문단, 단락
- **예문:** Read the first {{BLANK}} again.
- **원문:** 문장이 모여 한 덩어리. 독해 지시문의 단골.
- **수정:** 문장이 모여 한 덩어리.
- **이유:** 학습 지시·군더더기 표현

### 0:6:5 · section (1)

- **뜻:** ① 부분, 구역
- **예문:** This {{BLANK}} of the book is easy.
- **원문:** 자른 한 부분. 신문의 스포츠 면도 section.
- **수정:** 신문의 스포츠 면도 section.
- **이유:** 같은 정보·뜻·예문 반복

### 0:6:6 · statement (1)

- **뜻:** ① 진술, 서술
- **예문:** Which {{BLANK}} is true?
- **원문:** state(말하다)+ment. 시험 문제의 '다음 진술 중'.
- **수정:** state(말하다)+ment.
- **이유:** 학습 지시·군더더기 표현

### 0:6:11 · reading (1)

- **뜻:** ① 읽기, 독서
- **예문:** {{BLANK}} is my favorite hobby.
- **원문:** 영어 시험의 '독해' 영역.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 0:6:12 · writing (1)

- **뜻:** ① 쓰기, 글
- **예문:** Her {{BLANK}} is clear and simple.
- **원문:** e가 빠진다: writing. 영어 시험의 '작문' 영역.
- **수정:** e가 빠진다: writing.
- **이유:** 학습 지시·군더더기 표현

### 0:6:14 · geography (1)

- **뜻:** ① 지리 (과목)
- **예문:** We learned about rivers in {{BLANK}} class.
- **원문:** geo(땅)+graphy(기록). 강세는 og에: ge-OG-raphy.
- **수정:** geo(땅)+graphy(기록).
- **이유:** 단순 발음·강세 중복

### 0:6:18 · career (1)

- **뜻:** ① 직업 경력, 진로
- **예문:** She wants a {{BLANK}} in music.
- **원문:** a career in+분야: 그 분야에서 쌓는 직업 경력. 강세는 뒤 음절.
- **수정:** a career in+분야: 그 분야에서 쌓는 직업 경력.
- **이유:** 단순 발음·강세 중복

### 0:6:20 · routine (1)

- **뜻:** ① 일과, 정해진 순서
- **예문:** Exercise is part of my morning {{BLANK}}.
- **원문:** 매일 반복하는 순서. 강세 뒤: rou-TINE.
- **수정:** 매일 반복하는 순서.
- **이유:** 단순 발음·강세 중복

### 0:7:7 · umbrella (1)

- **뜻:** ① 우산
- **예문:** Take an {{BLANK}}. It may rain.
- **원문:** 강세 가운데: um-BREL-la.
- **수정:** 해설 삭제
- **이유:** 단순 발음·강세 중복

### 0:7:12 · salad (1)

- **뜻:** ① 샐러드
- **예문:** I'll have a chicken {{BLANK}}.
- **원문:** 강세 앞: SAL-ad.
- **수정:** 해설 삭제
- **이유:** 단순 발음·강세 중복

### 0:7:14 · tomato (1)

- **뜻:** ① 토마토
- **예문:** Add a {{BLANK}} to the salad.
- **원문:** 복수 tomatoes(-es). 미국 발음 [터메이토].
- **수정:** 복수 tomatoes(-es).
- **이유:** 단순 발음·강세 중복

### 0:7:20 · passport (1)

- **뜻:** ① 여권
- **예문:** Don't forget your {{BLANK}}.
- **원문:** 해외에서 신원과 국적을 증명하는 여권. boarding pass는 비행기 탑승권.
- **수정:** boarding pass는 비행기 탑승권.
- **이유:** 같은 정보·뜻·예문 반복

### 0:7:22 · museum (1)

- **뜻:** ① 박물관, 미술관
- **예문:** The {{BLANK}} is closed on Mondays.
- **원문:** 강세 가운데: mu-SE-um.
- **수정:** 해설 삭제
- **이유:** 단순 발음·강세 중복

### 0:7:26 · video (1)

- **뜻:** ① 동영상
- **예문:** I watched a funny {{BLANK}} online.
- **원문:** 움직이는 그림. 강세 앞: VID-eo.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 0:7:33 · DVD (1)

- **뜻:** ① 디브이디
- **예문:** We watched a {{BLANK}} together.
- **원문:** 영상을 저장해 재생하는 디스크.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 0:8:3 · delicious (1)

- **뜻:** ① 아주 맛있는
- **예문:** This soup is {{BLANK}}!
- **원문:** 맛있다의 강한 말. 강세 가운데: de-LI-cious.
- **수정:** 맛있다의 강한 말.
- **이유:** 단순 발음·강세 중복

### 0:8:23 · design (2)

- **뜻:** ② 디자인, 설계
- **예문:** I like the {{BLANK}} of this building.
- **원문:** 모양·구조를 짜는 일이나 그 결과인 설계를 뜻해. 동사와 발음은 같아.
- **수정:** 모양·구조를 짜는 일이나 그 결과인 설계를 뜻해.
- **이유:** 단순 발음·강세 중복

### 0:9:11 · guitar (1)

- **뜻:** ① 기타
- **예문:** My brother plays the {{BLANK}} every night.
- **원문:** play the guitar가 흔해. play guitar도 써. 강세는 뒤 음절. 연주자는 guitarist.
- **수정:** play the guitar가 흔해. play guitar도 써. 연주자는 guitarist.
- **이유:** 단순 발음·강세 중복

### 0:9:14 · cafe (1)

- **뜻:** ① 카페, 찻집
- **예문:** We studied at a {{BLANK}} near school.
- **원문:** 미국식 발음은 뒤에 강세: [카페이]. café라고 쓰기도 해.
- **수정:** café라고 쓰기도 해.
- **이유:** 단순 발음·강세 중복

### 0:13:0 · solution (1)

- **뜻:** ① 해결책, 해답
- **예문:** We need a better {{BLANK}} to this problem.
- **원문:** a solution to+문제. solve(해결하다)와 연결해서 기억.
- **수정:** a solution to+문제. 동사는 solve(해결하다).
- **이유:** 학습 지시·군더더기 표현

### 1:2:18 · well (4)

- **뜻:** ④ 우물
- **예문:** The old {{BLANK}} still has clean water.
- **원문:** 물을 얻으려고 땅을 깊이 판 구멍. 명사로는 셀 수 있다.
- **수정:** 명사로는 셀 수 있다.
- **이유:** 같은 정보·뜻·예문 반복

### 1:3:23 · take (2)

- **뜻:** ② (시간이) 걸리다
- **예문:** It {{BLANK}}s an hour to get there.
- **원문:** 시간을 '잡아먹는다'는 감각. It takes + 시간은 통째로 익혀 둘 관용 표현이다.
- **수정:** 시간을 '잡아먹는다'는 감각. It takes + 시간.
- **이유:** 학습 지시·군더더기 표현

### 1:10:15 · god (1)

- **뜻:** ① 신
- **예문:** Long ago, people believed the sun was a {{BLANK}}.
- **원문:** 숭배의 대상인 신. god(소문자)은 여러 신 가운데 하나, God(대문자)은 유일신을 가리킨다. 첫 글자로 구별한다.
- **수정:** god(소문자)은 여러 신 가운데 하나, God(대문자)은 유일신을 가리킨다.
- **이유:** 같은 정보·뜻·예문 반복

### 2:1:12 · system (1)

- **뜻:** ① 체계, 시스템
- **예문:** The subway {{BLANK}} in Seoul is easy to use.
- **원문:** 짜임새 있게 맞물린 구조. 학술·기술 글의 단골이다.
- **수정:** 짜임새 있게 맞물린 구조.
- **이유:** 학습 지시·군더더기 표현

### 2:2:12 · change (1)

- **뜻:** ① 바꾸다, 변하다
- **예문:** You should {{BLANK}} your wet clothes.
- **원문:** 바꾸다·달라지다. change your mind(마음을 바꾸다), change into ~(~로 갈아입다)가 대표 연어다.
- **수정:** change your mind(마음을 바꾸다), change into ~(~로 갈아입다).
- **이유:** 학습 지시·군더더기 표현

### 2:3:11 · bad (1)

- **뜻:** ① 나쁜, 안 좋은 (↔ good)
- **예문:** Smoking is {{BLANK}} for your health.
- **원문:** 질·상태가 좋지 않은. 비교급 불규칙 bad-worse-worst — good-better-best와 짝으로 외운다.
- **수정:** 비교급 불규칙 bad-worse-worst. good-better-best.
- **이유:** 학습 지시·군더더기 표현

### 2:7:1 · law (1)

- **뜻:** ① 법, 법률
- **예문:** Everyone must follow the {{BLANK}}.
- **원문:** 지켜야 할 규칙. obey[break] the law(법을 지키다·어기다), against the law(불법인)가 대표 연어다.
- **수정:** obey[break] the law(법을 지키다·어기다), against the law(불법인).
- **이유:** 학습 지시·군더더기 표현

### 2:8:1 · hope (1)

- **뜻:** ① 바라다, 희망하다
- **예문:** I {{BLANK}} you get well soon.
- **원문:** 바라는 일이 일어나기를 기대할 때 쓴다. hope to go, hope (that) she comes처럼 쓴다.
- **수정:** hope to go, hope (that) she comes처럼 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 2:9:1 · social (1)

- **뜻:** ① 사회의, 사회적인
- **예문:** Humans are {{BLANK}} animals.
- **원문:** society(사회)의 형용사. social media, social problem처럼 학술·시사 글의 단골이다.
- **수정:** society(사회)의 형용사. social media, social problem.
- **이유:** 학습 지시·군더더기 표현

### 2:9:6 · fact (1)

- **뜻:** ① 사실 (↔ opinion)
- **예문:** It is a {{BLANK}} that the earth is round.
- **원문:** in fact(사실은). fact=사실(검증할 수 있음) / opinion=의견(주관적) — 학술 글은 이 둘을 가른다.
- **수정:** in fact(사실은). fact=사실(검증할 수 있음) / opinion=의견(주관적).
- **이유:** 학습 지시·군더더기 표현

### 3:6:1 · red (1)

- **뜻:** ① 빨간, 빨강
- **예문:** She painted the door {{BLANK}}.
- **원문:** 빨간색. 신호등의 red = 정지.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 4:2:2 · field (3)

- **뜻:** ③ 경기장, 운동장
- **예문:** The players ran onto the {{BLANK}}.
- **원문:** 운동 경기에 쓰는 넓은 땅. a football field = 축구 경기장.
- **수정:** a football field = 축구 경기장.
- **이유:** 같은 정보·뜻·예문 반복

### 4:10:12 · rate (3)

- **뜻:** ③ 평가하다
- **예문:** How would you {{BLANK}} this book?
- **원문:** 대상의 질이나 가치를 판단하다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 5:2:9 · he (1)

- **뜻:** ① 그가, 그 남자가
- **예문:** {{BLANK}} is my best friend, Minsu.
- **원문:** 주어 자리엔 he, 목적어면 him, '그의'는 his. 자리마다 옷을 갈아입는다.
- **수정:** 주어 자리엔 he, 목적어면 him, '그의'는 his.
- **이유:** 학습 지시·군더더기 표현

### 5:3:6 · his (1)

- **뜻:** ① 그의
- **예문:** I like {{BLANK}} new hair.
- **원문:** 명사 앞에 붙는 소유격. he-his-him 한 세트로 외워 둔다.
- **수정:** 명사 앞에 붙는 소유격. he-his-him.
- **이유:** 학습 지시·군더더기 표현

### 5:4:1 · as (2)

- **뜻:** ② (as soon as) ~하자마자
- **예문:** Call me {{BLANK}} soon as you arrive.
- **원문:** as soon as+문장 = ~하자마자. 도착 직후 바로 전화하라는 뜻이다.
- **수정:** as soon as+문장 = ~하자마자.
- **이유:** 같은 정보·뜻·예문 반복

### 5:9:12 · write (1)

- **뜻:** ① 쓰다, 적다
- **예문:** {{BLANK}} your name here, please.
- **원문:** write-wrote-written. 소리 안 나는 w까지 써야 진짜 쓰기.
- **수정:** write-wrote-written. w는 묵음.
- **이유:** 학습 지시·군더더기 표현

### 5:10:0 · without (1)

- **뜻:** ① ~없이
- **예문:** I went out {{BLANK}} my phone today.
- **원문:** with(함께)의 반대말로 기억하면 쉽다 — '~없이'. (원래는 '바깥쪽에'라는 뜻)
- **수정:** with(함께)의 반대 — '~없이'. (원래는 '바깥쪽에'라는 뜻)
- **이유:** 학습 지시·군더더기 표현

### 5:10:8 · under (2)

- **뜻:** ② ~미만의
- **예문:** Children {{BLANK}} five ride free.
- **원문:** 숫자 앞 under = ~미만. over(~넘게)와 짝으로 외운다.
- **수정:** 숫자 앞 under = ~미만. over는 ~넘게.
- **이유:** 학습 지시·군더더기 표현

### 5:10:16 · yet (3)

- **뜻:** ③ (접속사) 그런데도, 그렇지만
- **예문:** It's so cold, and {{BLANK}} she wears shorts.
- **원문:** 접속사 yet은 but보다 '놀랍게도'가 강한 그런데도. and yet, simple yet strong 꼴이 단골.
- **수정:** 접속사 yet은 but보다 '놀랍게도'가 강한 그런데도. and yet, simple yet strong.
- **이유:** 학습 지시·군더더기 표현

### 6:2:6 · door (1)

- **뜻:** ① 문
- **예문:** Someone is at the {{BLANK}}.
- **원문:** 옆집은 next door. 문 하나 옆이라는 그림.
- **수정:** 옆집은 next door.
- **이유:** 학습 지시·군더더기 표현

### 6:3:10 · across (1)

- **뜻:** ① 건너서, 맞은편에
- **예문:** My school is just {{BLANK}} the street.
- **원문:** cross(건너다)의 전치사 짝꿍. across from = ~의 맞은편.
- **수정:** cross(건너다)의 전치사. across from = ~의 맞은편.
- **이유:** 학습 지시·군더더기 표현

### 6:4:9 · pass (2)

- **뜻:** ② 건네주다
- **예문:** {{BLANK}} the ball to me!
- **원문:** 식탁 필수 문장 Pass me the ~. 손에서 손으로 지나가게 하기.
- **수정:** Pass me the ~.
- **이유:** 학습 지시·군더더기 표현

### 6:8:1 · yourself (1)

- **뜻:** ① 너 자신, 직접
- **예문:** Help {{BLANK}} to the pizza.
- **원문:** Help yourself(마음껏 드세요) — 손님 접대 단골 표현.
- **수정:** 손님에게 Help yourself(마음껏 드세요).
- **이유:** 학습 지시·군더더기 표현

### 6:9:5 · catch (2)

- **뜻:** ② (감기에) 걸리다
- **예문:** Stay away, or you'll {{BLANK}} my cold.
- **원문:** 감기는 '잡는' 것: catch a cold. 날아다니는 병이 나한테 잡히는 그림.
- **수정:** 감기는 '잡는' 것: catch a cold.
- **이유:** 학습 지시·군더더기 표현

### 7:5:11 · protect (1)

- **뜻:** ① 보호하다, 지키다
- **예문:** This coat {{BLANK}}s you from the cold.
- **원문:** protect A from B: B로부터 A를 지키다. from이 단짝.
- **수정:** protect A from B: B로부터 A를 지키다.
- **이유:** 같은 정보·뜻·예문 반복

### 7:7:1 · vote (1)

- **뜻:** ① 투표하다
- **예문:** Who will you {{BLANK}} for this time?
- **원문:** vote for+사람/안: ~에 찬성표를 던지다. for가 단짝.
- **수정:** vote for+사람/안: ~에 찬성표를 던지다.
- **이유:** 같은 정보·뜻·예문 반복

### 7:7:17 · worry (1)

- **뜻:** ① 걱정하다
- **예문:** Don't {{BLANK}} about the test result.
- **원문:** worry about+~: ~에 대해 걱정하다. about이 단짝.
- **수정:** worry about+~: ~에 대해 걱정하다.
- **이유:** 같은 정보·뜻·예문 반복

### 7:10:1 · sign (1)

- **뜻:** ① 표지판, 간판
- **예문:** The {{BLANK}} says the store is closed.
- **원문:** 표지판은 말을 한다: The sign says ~. 자주 나오는 그림.
- **수정:** 표지판은 말을 한다: The sign says ~.
- **이유:** 학습 지시·군더더기 표현

### 8:4:3 · sun (1)

- **뜻:** ① 해, 태양
- **예문:** Don't look at the {{BLANK}}!
- **원문:** 태양을 말할 때는 보통 the sun. the moon, the sky도 함께 기억.
- **수정:** 태양을 말할 때는 보통 the sun. the moon, the sky도 마찬가지.
- **이유:** 학습 지시·군더더기 표현

### 9:1:4 · fly (2)

- **뜻:** ② 파리
- **예문:** A {{BLANK}} is on my pizza!
- **원문:** 날아다니는 벌레라서 이름이 fly. 파리채로 잡는 그 파리 맞다.
- **수정:** 날아다니는 벌레라서 이름이 fly.
- **이유:** 학습 지시·군더더기 표현

### 9:3:2 · sea (1)

- **뜻:** ① 바다
- **예문:** The {{BLANK}} is calm today.
- **원문:** see(보다)와 발음이 같다[si]. 철자로 구별할 것.
- **수정:** see(보다)와 발음이 같다[si].
- **이유:** 같은 정보·뜻·예문 반복

### 9:4:7 · sexual (1)

- **뜻:** ① 성적인, 성의
- **예문:** We learned about {{BLANK}} health in class.
- **원문:** sex(성)+ual. 보건·법 지문에서 만나는 격식어.
- **수정:** sex(성)+ual.
- **이유:** 학습 지시·군더더기 표현

### 9:4:9 · prevent (1)

- **뜻:** ① 막다, 예방하다
- **예문:** Wash your hands to {{BLANK}} colds.
- **원문:** prevent A from -ing: A가 못 하게 막다. from이 세트.
- **수정:** prevent A from -ing: A가 못 하게 막다.
- **이유:** 같은 정보·뜻·예문 반복

### 9:9:11 · restaurant (1)

- **뜻:** ① 식당
- **예문:** This {{BLANK}} is famous for its soup.
- **원문:** restore(되살리다)와 한 뿌리: 먹고 기운 차리는 곳. 철자 주의.
- **수정:** restore(되살리다)와 한 뿌리: 먹고 기운 차리는 곳.
- **이유:** 학습 지시·군더더기 표현

### 11:2:6 · shop (2)

- **뜻:** ② 쇼핑하다, 물건을 사다
- **예문:** We {{BLANK}} for food on Sundays.
- **원문:** shop for ~: ~을 사러 다니다. go shopping도 함께 기억.
- **수정:** shop for ~: ~을 사러 다니다. go shopping.
- **이유:** 학습 지시·군더더기 표현

### 11:2:14 · enemy (1)

- **뜻:** ① 적
- **예문:** He doesn't have a single {{BLANK}} at school.
- **원문:** friend의 반대. 만화 속 '숙적'이 enemy다.
- **수정:** friend의 반대.
- **이유:** 단어 학습 기여가 낮은 곁말

### 11:3:9 · female (1)

- **뜻:** ① 여성의
- **예문:** A {{BLANK}} voice answered the phone.
- **원문:** male(남성의)↔female(여성의). 서류 성별 칸의 그 단어.
- **수정:** male(남성의)↔female(여성의).
- **이유:** 단어 학습 기여가 낮은 곁말

### 11:4:4 · lord (1)

- **뜻:** ① 군주, 영주
- **예문:** The {{BLANK}} lived in a great castle.
- **원문:** 성과 땅의 주인. 게임·판타지 속 '영주·군주'가 lord.
- **수정:** 성과 땅의 주인.
- **이유:** 단어 학습 기여가 낮은 곁말

### 12:3:5 · male (1)

- **뜻:** ① 남성의, 수컷의
- **예문:** The {{BLANK}} bird sings to attract a mate.
- **원문:** male(남) ↔ female(여). 사람과 동물 모두에 쓰는 담백한 말.
- **수정:** male(남) ↔ female(여). 사람과 동물 모두에 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 12:7:7 · profit (1)

- **뜻:** ① 이익, 수익
- **예문:** The store made a big {{BLANK}} last month.
- **원문:** make a profit(이익을 내다) ↔ loss(손해). 장사의 두 얼굴.
- **수정:** make a profit(이익을 내다) ↔ loss(손해).
- **이유:** 학습 지시·군더더기 표현

### 12:8:8 · request (2)

- **뜻:** ② 요청하다
- **예문:** You can {{BLANK}} more time to finish.
- **원문:** request+명사: ~을 요청하다. 명사와 철자·발음이 같다.
- **수정:** request+명사: ~을 요청하다.
- **이유:** 단순 발음·강세 중복

### 12:8:9 · appearance (1)

- **뜻:** ① 외모, 겉모습
- **예문:** Don't judge people by their {{BLANK}}.
- **원문:** 겉으로 '보이는' 모든 것.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 12:9:7 · shirt (1)

- **뜻:** ① 셔츠
- **예문:** Your {{BLANK}} is inside out!
- **원문:** 발음 [셔트] 주의. t-shirt(티셔츠)도 shirt 가족.
- **수정:** t-shirt(티셔츠)도 shirt 가족.
- **이유:** 단순 발음·강세 중복

### 12:9:14 · meat (1)

- **뜻:** ① 고기
- **예문:** I eat more vegetables than {{BLANK}} these days.
- **원문:** meet(만나다)와 발음이 같다[미트]. 철자로 구분.
- **수정:** meet(만나다)와 발음이 같다[미트].
- **이유:** 같은 정보·뜻·예문 반복

### 13:6:6 · slip (1)

- **뜻:** ① 미끄러지다
- **예문:** She {{BLANK}}ped on the ice and fell.
- **원문:** 과거형 slipped: p 두 개. 쭉 미끄러지는 그림.
- **수정:** 과거형 slipped: p 두 개.
- **이유:** 학습 지시·군더더기 표현

### 14:1:10 · engineer (1)

- **뜻:** ① 기술자, 엔지니어
- **예문:** My uncle is an {{BLANK}} at a car company.
- **원문:** 기계·건축·소프트웨어 등을 설계·개발하는 기술 전문가. 강세는 뒤 [엔지니어].
- **수정:** 기계·건축·소프트웨어 등을 설계·개발하는 기술 전문가.
- **이유:** 단순 발음·강세 중복

### 14:7:9 · advance (2)

- **뜻:** ② 전진하다, 진출·발전하다
- **예문:** Korea {{BLANK}}d to the final again!
- **원문:** 동사도 강세는 뒤(ad-VANCE). 앞으로 나아가다 → 진출·발전. advance to the final.
- **수정:** 앞으로 나아가다 → 진출·발전. advance to the final.
- **이유:** 단순 발음·강세 중복

### 14:8:3 · severe (1)

- **뜻:** ① 심각한, 극심한
- **예문:** She is in bed with a {{BLANK}} cold.
- **원문:** 아픔·날씨·처벌이 '심한' 것. 발음은 [서비어].
- **수정:** 아픔·날씨·처벌이 '심한' 것.
- **이유:** 단순 발음·강세 중복

### 14:8:8 · entertainment (1)

- **뜻:** ① 오락, 연예
- **예문:** The hotel offers music and other {{BLANK}}.
- **원문:** entertain(즐겁게 하다)+ment. 연예 기획사 이름의 그 단어.
- **수정:** entertain(즐겁게 하다)+ment.
- **이유:** 단어 학습 기여가 낮은 곁말

### 15:8:2 · wire (1)

- **뜻:** ① 철사, 전선
- **예문:** The fence is made of thin {{BLANK}}.
- **원문:** 금속으로 만든 가는 줄. 전선에는 구리도 쓰인다. wireless는 선 없는, 무선의.
- **수정:** 금속으로 만든 가는 줄. wireless는 선 없는, 무선의.
- **이유:** 단어 학습 기여가 낮은 곁말

### 16:1:4 · calculate (1)

- **뜻:** ① 계산하다
- **예문:** {{BLANK}} the total cost of the trip.
- **원문:** 수를 따져 계산하다. calculator(계산기)가 하는 일이 바로 이것.
- **수정:** calculator는 계산기.
- **이유:** 같은 정보·뜻·예문 반복

### 16:2:8 · electricity (1)

- **뜻:** ① 전기
- **예문:** Turn off the lights to save {{BLANK}}.
- **원문:** 강세는 -tric-에 있다. save electricity는 전기를 절약하다, electricity bill은 전기 요금 청구서.
- **수정:** save electricity는 전기를 절약하다, electricity bill은 전기 요금 청구서.
- **이유:** 단순 발음·강세 중복

### 16:2:13 · laughter (1)

- **뜻:** ① 웃음, 웃음소리
- **예문:** Loud {{BLANK}} came from the next room.
- **원문:** laugh(웃다)의 명사형. 철자에 gh가 숨어 있다: laughter.
- **수정:** laugh(웃다)의 명사형.
- **이유:** 학습 지시·군더더기 표현

### 16:3:5 · tube (1)

- **뜻:** ① 관, 튜브
- **예문:** The doctor put a thin {{BLANK}} in his nose.
- **원문:** 속이 빈 관. 치약 튜브, 몸속 관 다 tube. 미국 발음은 [투브].
- **수정:** 속이 빈 관. 치약 튜브, 몸속 관 다 tube.
- **이유:** 단순 발음·강세 중복

### 16:3:15 · wise (1)

- **뜻:** ① 지혜로운, 현명한
- **예문:** Asking for help was a {{BLANK}} choice.
- **원문:** 상황을 잘 이해하고 올바르게 판단하는. a wise choice는 현명한 선택.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 16:6:5 · funeral (1)

- **뜻:** ① 장례식
- **예문:** He wore black to the {{BLANK}}.
- **원문:** 죽은 사람을 보내는 장례식. attend a funeral은 장례식에 참석하다.
- **수정:** attend a funeral은 장례식에 참석하다.
- **이유:** 같은 정보·뜻·예문 반복

### 16:9:5 · acid (1)

- **뜻:** ① 산(酸)
- **예문:** This {{BLANK}} can even burn through metal.
- **원문:** 신맛 나고 녹이는 성질. acid rain: 산성비.
- **수정:** acid rain: 산성비.
- **이유:** 단어 학습 기여가 낮은 곁말

### 17:3:0 · garage (1)

- **뜻:** ① 차고, 정비소
- **예문:** Dad parked the car in the {{BLANK}}.
- **원문:** 차를 넣는 곳, 고치는 곳. 발음은 [거라지].
- **수정:** 차를 넣는 곳, 고치는 곳.
- **이유:** 단순 발음·강세 중복

### 17:5:5 · delay (2)

- **뜻:** ② 지연, 지체
- **예문:** The bus had a twenty-minute {{BLANK}}.
- **원문:** 명사 delay: a two-hour delay, without delay = 지체 없이. 강세는 뒤 -lay.
- **수정:** 명사 delay: a two-hour delay, without delay = 지체 없이.
- **이유:** 단순 발음·강세 중복

### 17:6:12 · stroke (2)

- **뜻:** ② 뇌졸중
- **예문:** Grandfather had a {{BLANK}} last spring.
- **원문:** have a stroke 뇌졸중이 오다. 갑자기 '탁' 치는 병.
- **수정:** have a stroke 뇌졸중이 오다.
- **이유:** 학습 지시·군더더기 표현

### 17:7:13 · rent (2)

- **뜻:** ② 집세, 임대료
- **예문:** The {{BLANK}} for this room is high.
- **원문:** pay the rent 집세를 내다. 매달 나가는 그 돈.
- **수정:** pay the rent 집세를 내다.
- **이유:** 학습 지시·군더더기 표현

### 17:8:4 · monthly (1)

- **뜻:** ① 매달의, 월 1회의
- **예문:** She reads a {{BLANK}} fashion magazine.
- **원문:** weekly 매주, monthly 매달, yearly 매년. ly 삼형제.
- **수정:** weekly 매주, monthly 매달, yearly 매년.
- **이유:** 학습 지시·군더더기 표현

### 17:10:10 · eager (1)

- **뜻:** ① 열심인, 간절히 바라는
- **예문:** The new student is {{BLANK}} to learn.
- **원문:** be eager to ~하고 싶어 못 참다. 눈빛이 반짝이는 상태.
- **수정:** be eager to ~하고 싶어 못 참다.
- **이유:** 학습 지시·군더더기 표현

### 18:1:13 · swallow (2)

- **뜻:** ② 제비
- **예문:** A {{BLANK}} built its nest under our roof.
- **원문:** 긴 날개로 빠르게 나는 작은 새.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 18:2:6 · govern (1)

- **뜻:** ① 다스리다, 통치하다
- **예문:** The president {{BLANK}}s the country.
- **원문:** 명사는 government(정부). '정부'가 하는 일이 govern.
- **수정:** 명사는 government(정부).
- **이유:** 같은 정보·뜻·예문 반복

### 18:4:3 · peaceful (1)

- **뜻:** ① 평화로운
- **예문:** The village looked calm and {{BLANK}}.
- **원문:** peace(평화)+ful(가득한). -ful은 '~가 가득한'.
- **수정:** peace(평화)+ful(가득한).
- **이유:** 같은 정보·뜻·예문 반복

### 18:6:3 · probability (1)

- **뜻:** ① 확률, 가능성
- **예문:** What is the {{BLANK}} of winning the game?
- **원문:** 수학 시간의 '확률'이 이 단어.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 18:6:8 · horn (2)

- **뜻:** ② 경적
- **예문:** The driver sounded the {{BLANK}}.
- **원문:** 차량에서 경고 소리를 내는 장치.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 18:7:8 · mud (1)

- **뜻:** ① 진흙
- **예문:** My shoes are covered in {{BLANK}}.
- **원문:** 형용사는 muddy(진흙투성이의). 비 온 날 흙길 그림.
- **수정:** 형용사는 muddy(진흙투성이의).
- **이유:** 학습 지시·군더더기 표현

### 18:8:3 · declaration (1)

- **뜻:** ① 선언, 선포
- **예문:** The {{BLANK}} of war shocked the whole world.
- **원문:** 동사는 declare(선언하다). 3·1 독립 선언서의 '선언'.
- **수정:** 동사는 declare(선언하다).
- **이유:** 단어 학습 기여가 낮은 곁말

### 19:1:2 · chin (1)

- **뜻:** ① 턱, 턱 끝
- **예문:** He rested his {{BLANK}} on his hand.
- **원문:** chin은 턱 끝, jaw는 턱 전체(턱뼈). 턱 괴는 자세가 chin.
- **수정:** chin은 턱 끝, jaw는 턱 전체(턱뼈).
- **이유:** 같은 정보·뜻·예문 반복

### 19:4:3 · envelope (1)

- **뜻:** ① 봉투
- **예문:** Write her address on the {{BLANK}}.
- **원문:** 편지를 감싸는 봉투. 우표(stamp)를 붙여서 보낸다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 19:5:2 · delicate (1)

- **뜻:** ① 연약한, 섬세한
- **예문:** Be careful; the glass is very {{BLANK}}.
- **원문:** 깨지기 쉽고 조심스러운 것. 발음은 [델리컷].
- **수정:** 깨지기 쉽고 조심스러운 것.
- **이유:** 단순 발음·강세 중복

### 19:5:7 · excite (1)

- **뜻:** ① 들뜨게 하다
- **예문:** The concert news {{BLANK}}d all my friends.
- **원문:** 남을 들뜨게 하면 exciting, 내가 들뜨면 excited. 방향 주의.
- **수정:** 남을 들뜨게 하면 exciting, 내가 들뜨면 excited.
- **이유:** 학습 지시·군더더기 표현

### 19:7:13 · drawer (1)

- **뜻:** ① 서랍
- **예문:** Your pens are in the top {{BLANK}}.
- **원문:** draw(당기다)+er=당겨서 여는 서랍. 발음은 [드로어].
- **수정:** draw(당기다)+er=당겨서 여는 서랍.
- **이유:** 단순 발음·강세 중복

### 20:1:1 · sensible (1)

- **뜻:** ① 분별 있는, 현명한
- **예문:** Be {{BLANK}} and save your money.
- **원문:** sensible은 '분별 있는', sensitive는 '예민한'. 뜻이 완전 다르니 주의.
- **수정:** sensible은 '분별 있는', sensitive는 '예민한'.
- **이유:** 학습 지시·군더더기 표현

### 20:4:4 · determined (1)

- **뜻:** ① 굳게 결심한
- **예문:** She is {{BLANK}} to win the game.
- **원문:** be determined to+동사=꼭 ~하기로 마음먹다. 눈빛이 굳은 상태.
- **수정:** be determined to+동사=꼭 ~하기로 마음먹다.
- **이유:** 학습 지시·군더더기 표현

### 20:10:3 · parcel (1)

- **뜻:** ① (영) 소포
- **예문:** A {{BLANK}} arrived for you this morning.
- **원문:** 영국식 소포. 미국은 package. 우체국에서 부치는 상자.
- **수정:** 영국식 소포. 미국은 package.
- **이유:** 같은 정보·뜻·예문 반복

### 20:10:5 · rubber (1)

- **뜻:** ① 고무
- **예문:** Car tires are made of {{BLANK}}.
- **원문:** 고무 재질. 타이어나 고무줄처럼 잘 늘어나는 물건을 만드는 데 쓴다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 21:3:2 · amusing (1)

- **뜻:** ① 재미있는, 웃긴
- **예문:** She told an {{BLANK}} story about her cat.
- **원문:** 이야기가 amusing(웃긴), 듣는 나는 amused. -ing/-ed 구분!
- **수정:** 이야기가 amusing(웃긴), 듣는 나는 amused.
- **이유:** 학습 지시·군더더기 표현

### 21:4:6 · careless (1)

- **뜻:** ① 부주의한
- **예문:** A {{BLANK}} mistake cost me ten points.
- **원문:** care+less(~이 없는). 반대는 careful(-ful=가득한). 접미사 짝!
- **수정:** care+less(~이 없는). 반대는 careful(-ful=가득한).
- **이유:** 학습 지시·군더더기 표현

### 21:9:5 · harmless (1)

- **뜻:** ① 무해한
- **예문:** This insect is ugly but quite {{BLANK}}.
- **원문:** harm+less(없는)=무해한. -ful↔-less 대표 짝.
- **수정:** harm+less(없는)=무해한. -ful↔-less.
- **이유:** 학습 지시·군더더기 표현

### 21:10:2 · hopeless (1)

- **뜻:** ① 가망 없는
- **예문:** The game looked {{BLANK}}, but we never stopped.
- **원문:** hope+less: 희망이 빠져나간. -ful/-less 짝의 대표선수.
- **수정:** hope+less: 희망이 빠져나간.
- **이유:** 학습 지시·군더더기 표현

### 22:5:5 · senseless (1)

- **뜻:** ① 무의미한, 분별없는
- **예문:** It is {{BLANK}} to fight over such things.
- **원문:** sense(분별)+-less(없는)=분별없는. -less='~ 없는' 접미사.
- **수정:** sense(분별)+-less(없는)=분별없는.
- **이유:** 같은 정보·뜻·예문 반복

### 22:7:9 · thirsty (1)

- **뜻:** ① 목마른
- **예문:** After soccer I always get so {{BLANK}}.
- **원문:** thirst(갈증)+-y=목마른. hungry(배고픈)와 짝꿍.
- **수정:** thirst(갈증)+-y=목마른.
- **이유:** 단어 학습 기여가 낮은 곁말

### 22:9:2 · wrongdoing (1)

- **뜻:** ① 나쁜 짓, 비행(非行)
- **예문:** The police found no {{BLANK}} in this case.
- **원문:** wrong(잘못된)+doing(행함)=잘못 저지르기. 뉴스 단골 명사.
- **수정:** wrong(잘못된)+doing(행함)=잘못 저지르기.
- **이유:** 학습 지시·군더더기 표현

### 23:7:5 · unless (1)

- **뜻:** ① ~하지 않으면, ~가 아닌 한
- **예문:** We'll be late {{BLANK}} we leave right now.
- **원문:** if~not(~하지 않으면)으로 기억하자. 보통 부정을 중복하지 않고, 미래 조건도 현재형.
- **수정:** if~not(~하지 않으면). 보통 부정을 중복하지 않고, 미래 조건도 현재형.
- **이유:** 학습 지시·군더더기 표현

### 23:7:7 · crazy (2)

- **뜻:** ② 열광하는, 푹 빠진
- **예문:** My sister is {{BLANK}} about that singer.
- **원문:** be crazy about ~(~에 푹 빠지다). 전치사는 about이다.
- **수정:** be crazy about ~(~에 푹 빠지다).
- **이유:** 같은 정보·뜻·예문 반복

### 23:10:2 · due (2)

- **뜻:** ② ~에 기인하는(due to)
- **예문:** The delay was {{BLANK}} to heavy rain.
- **원문:** be due to+명사=~때문이다. 원인을 설명하는 표현으로 익힌다.
- **수정:** be due to+명사=~때문이다.
- **이유:** 학습 지시·군더더기 표현

### 24:1:6 · planet (1)

- **뜻:** ① 행성, (the ~) 지구
- **예문:** Which {{BLANK}} is closest to the sun?
- **원문:** the planet은 흔히 '지구'를 뜻한다. 첫음절에 강세가 온다.
- **수정:** the planet은 흔히 '지구'를 뜻한다.
- **이유:** 단순 발음·강세 중복

### 24:2:8 · attitude (1)

- **뜻:** ① 태도, 자세
- **예문:** His {{BLANK}} toward homework is really bad.
- **원문:** attitude to[toward] ~ 가 짝. '마음가짐'을 뜻한다.
- **수정:** attitude to[toward] ~. '마음가짐'을 뜻한다.
- **이유:** 학습 지시·군더더기 표현

### 24:2:9 · seriously (1)

- **뜻:** ① 심각하게, 진지하게
- **예문:** You should take this test more {{BLANK}}.
- **원문:** serious+-ly. take ~ seriously(진지하게 받아들이다)가 대표 짝.
- **수정:** serious+-ly. take ~ seriously(진지하게 받아들이다).
- **이유:** 학습 지시·군더더기 표현

### 24:3:4 · link (2)

- **뜻:** ② 연결하다, 관련짓다
- **예문:** Some studies {{BLANK}} sleep to better grades.
- **원문:** link A to[with] B가 짝. 두 가지를 이어 준다는 뜻.
- **수정:** link A to[with] B. 두 가지를 이어 준다는 뜻.
- **이유:** 학습 지시·군더더기 표현

### 24:3:9 · poll (1)

- **뜻:** ① 여론 조사
- **예문:** A class {{BLANK}} showed most students want pizza.
- **원문:** 여론 조사. 동사로 '조사하다'도 된다. [폴]로 발음한다.
- **수정:** 동사로 '조사하다'도 된다.
- **이유:** 단순 발음·강세 중복

### 24:4:5 · mental (1)

- **뜻:** ① 정신의, 마음의
- **예문:** Sleep is important for your {{BLANK}} health.
- **원문:** mental health(정신 건강)가 대표 짝. 반대는 physical.
- **수정:** mental health(정신 건강). 반대는 physical.
- **이유:** 학습 지시·군더더기 표현

### 24:6:4 · native (1)

- **뜻:** ① 태어난 곳의, 모국의
- **예문:** My {{BLANK}} language is not English.
- **원문:** native language[speaker]가 대표 짝. '타고난'이란 뜻도 있다.
- **수정:** native language[speaker]. '타고난'이란 뜻도 있다.
- **이유:** 학습 지시·군더더기 표현

### 24:6:7 · growing (1)

- **뜻:** ① 늘어나는, 커지는
- **예문:** There is a {{BLANK}} number of cats here.
- **원문:** grow+-ing. a growing number of ~(점점 늘어나는)가 대표 짝.
- **수정:** grow+-ing. a growing number of ~(점점 늘어나는).
- **이유:** 학습 지시·군더더기 표현

### 24:7:1 · via (1)

- **뜻:** ① ~를 통해, ~를 거쳐
- **예문:** We flew to Paris {{BLANK}} London.
- **원문:** 라틴어에서 온 전치사로 [바이어]. 수단이나 경유지를 나타낸다.
- **수정:** 라틴어에서 온 전치사. 수단이나 경유지를 나타낸다.
- **이유:** 단순 발음·강세 중복

### 24:7:6 · solve (1)

- **뜻:** ① 풀다, 해결하다
- **예문:** I cannot {{BLANK}} the last science problem.
- **원문:** solve a problem(문제를 풀다)이 대표 짝. 명사는 solution.
- **수정:** solve a problem(문제를 풀다). 명사는 solution.
- **이유:** 학습 지시·군더더기 표현

### 24:7:9 · democracy (1)

- **뜻:** ① 민주주의
- **예문:** In a {{BLANK}}, people choose their leaders.
- **원문:** 그리스어 demos(민중)+kratia(지배). 강세는 -moc-에 있다.
- **수정:** 그리스어 demos(민중)+kratia(지배).
- **이유:** 단순 발음·강세 중복

### 24:9:10 · circumstance (1)

- **뜻:** ① 상황, 사정
- **예문:** Under the {{BLANK}}s, she did really well.
- **원문:** 보통 복수. under the circumstances(그런 상황에서)가 대표 짝.
- **수정:** 보통 복수. under the circumstances(그런 상황에서).
- **이유:** 학습 지시·군더더기 표현

### 24:10:3 · rely (1)

- **뜻:** ① 의지하다, 믿다
- **예문:** You can {{BLANK}} on me for the group project.
- **원문:** rely on[upon]이 짝. 전치사 없이 목적어를 쓰지 못한다.
- **수정:** rely on[upon]. 전치사 없이 목적어를 쓰지 못한다.
- **이유:** 학습 지시·군더더기 표현

### 25:1:3 · investor (1)

- **뜻:** ① 투자자
- **예문:** The company needs one more big {{BLANK}} this year.
- **원문:** invest(투자하다)+-or. 사람 명사다. invest in ~에 투자하다.
- **수정:** invest(투자하다)+-or. invest in ~에 투자하다.
- **이유:** 같은 정보·뜻·예문 반복

### 25:1:10 · catholic (1)

- **뜻:** ① 가톨릭의, 천주교의
- **예문:** My friend goes to a {{BLANK}} church downtown.
- **원문:** 대문자로 씀. 명사로 '가톨릭 신자'도 된다. [캐설릭].
- **수정:** 대문자로 씀. 명사로 '가톨릭 신자'도 된다.
- **이유:** 단순 발음·강세 중복

### 25:2:7 · accuse (1)

- **뜻:** ① 비난하다, 고발하다
- **예문:** They {{BLANK}}d me of copying his homework.
- **원문:** accuse A of B가 짝. of 뒤에 잘못이 온다. blame A for B와 구별.
- **수정:** accuse A of B. of 뒤에 잘못이 온다. blame A for B와 구별.
- **이유:** 학습 지시·군더더기 표현

### 25:2:14 · speaker (2)

- **뜻:** ② 스피커, 확성기
- **예문:** Turn the {{BLANK}}s down or Dad will shout.
- **원문:** 소리를 밖으로 내보내는 장치. 이어폰과 달리 여럿이 함께 듣는다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 25:3:4 · expose (1)

- **뜻:** ① 드러내다, 노출시키다
- **예문:** Don't {{BLANK}} your skin to strong sun.
- **원문:** expose A to B가 짝. be exposed to(~에 노출되다)로 많이 쓴다.
- **수정:** expose A to B. be exposed to(~에 노출되다)로 많이 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 25:5:3 · revolution (1)

- **뜻:** ① 혁명
- **예문:** The phone started a {{BLANK}} in how we talk.
- **원문:** the French Revolution처럼 대문자로도 쓴다. 세상을 한 바퀴 뒤집는 그림.
- **수정:** the French Revolution처럼 대문자로도 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 25:8:6 · column (2)

- **뜻:** ② 기둥
- **예문:** Tall stone {{BLANK}}s hold up the old building.
- **원문:** 건물을 받치는 기둥. 돌뿐 아니라 다른 재료로 만들 수도 있다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 25:8:12 · deficit (1)

- **뜻:** ① 적자, 부족액
- **예문:** The club has a big {{BLANK}} this month.
- **원문:** 돈이 모자란 상태. 반대말은 surplus(흑자). [데퍼싯].
- **수정:** 반대말은 surplus(흑자).
- **이유:** 단순 발음·강세 중복

### 25:9:1 · capable (1)

- **뜻:** ① ~할 수 있는, 유능한
- **예문:** She is {{BLANK}} of running ten miles.
- **원문:** be capable of -ing가 짝. of 뒤에 동사원형을 쓰면 틀린다.
- **수정:** be capable of -ing. of 뒤에 동사원형을 쓰면 틀린다.
- **이유:** 학습 지시·군더더기 표현

### 25:10:12 · commander (1)

- **뜻:** ① 지휘관, 사령관
- **예문:** The army {{BLANK}} spoke to the whole town.
- **원문:** command(명령하다)+-er. 명령을 내리는 사람이다.
- **수정:** command(명령하다)+-er.
- **이유:** 같은 정보·뜻·예문 반복

### 26:1:0 · championship (1)

- **뜻:** ① 선수권 대회, 우승
- **예문:** Our school won the {{BLANK}} again this year.
- **원문:** champion(챔피언)+-ship. win the championship이 대표 연어다.
- **수정:** champion(챔피언)+-ship. win the championship.
- **이유:** 학습 지시·군더더기 표현

### 26:1:8 · recovery (1)

- **뜻:** ① 회복
- **예문:** The doctor said her {{BLANK}} would take months.
- **원문:** make a full recovery가 대표 연어.
- **수정:** make a full recovery.
- **이유:** 학습 지시·군더더기 표현

### 26:3:4 · mode (1)

- **뜻:** ① 방식, 방법
- **예문:** Walking is my usual {{BLANK}} of travel here.
- **원문:** 격식 있는 말. a mode of ~처럼 of와 짝으로 쓴다.
- **수정:** 격식 있는 말. a mode of ~.
- **이유:** 같은 정보·뜻·예문 반복

### 26:3:8 · scenario (1)

- **뜻:** ① 상황, 시나리오
- **예문:** The worst {{BLANK}} is that it rains tomorrow.
- **원문:** the worst-case scenario가 대표 연어. 영화 대본 뜻도 있다.
- **수정:** the worst-case scenario. 영화 대본 뜻도 있다.
- **이유:** 학습 지시·군더더기 표현

### 26:4:0 · spanish (1)

- **뜻:** ① 스페인의, 스페인어의
- **예문:** We visited a {{BLANK}} city last year.
- **원문:** 대문자로 씀. Spain+-ish이며 span(기간)과는 무관하다.
- **수정:** 대문자로 씀. Spain+-ish.
- **이유:** 단어 학습 기여가 낮은 곁말

### 26:5:3 · license (1)

- **뜻:** ① 면허(증), 허가증
- **예문:** My sister got her driver's {{BLANK}} last month.
- **원문:** (영)licence. a driver's license가 대표 연어다.
- **수정:** (영)licence. a driver's license.
- **이유:** 학습 지시·군더더기 표현

### 26:5:7 · investigator (1)

- **뜻:** ① 수사관, 조사관
- **예문:** The {{BLANK}}s looked for the cause of the fire.
- **원문:** investigate(조사하다)+-or. -er가 아니라 -or로 끝난다.
- **수정:** investigate(조사하다)+-or.
- **이유:** 같은 정보·뜻·예문 반복

### 26:5:11 · communicate (1)

- **뜻:** ① 의사소통하다, 전하다
- **예문:** We {{BLANK}} with our cousins by video call.
- **원문:** communicate with + 사람이 짝. 목적어 없이도 쓴다.
- **수정:** communicate with + 사람. 목적어 없이도 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 26:6:11 · mood (1)

- **뜻:** ① 기분
- **예문:** Mom is in a good {{BLANK}} this morning.
- **원문:** in a good/bad mood처럼 in을 짝으로 쓴다.
- **수정:** in a good/bad mood.
- **이유:** 같은 정보·뜻·예문 반복

### 26:7:11 · fishing (1)

- **뜻:** ① 낚시
- **예문:** We went {{BLANK}} with my uncle last Sunday.
- **원문:** fish+-ing. go fishing처럼 go+-ing 놀이 표현으로 익힌다.
- **수정:** fish+-ing. go fishing.
- **이유:** 학습 지시·군더더기 표현

### 26:9:6 · delivery (2)

- **뜻:** ② 분만, 출산
- **예문:** She had a safe {{BLANK}} at the hospital.
- **원문:** 아기를 낳는 과정. 배달 의미와 구별한다.
- **수정:** 배달뿐 아니라 출산도 뜻한다.
- **이유:** 같은 정보·뜻·예문 반복

### 26:9:8 · junior (1)

- **뜻:** ① 손아래의, 하급의
- **예문:** She started as a {{BLANK}} editor at the paper.
- **원문:** junior to + 사람이 짝. than을 쓰지 않는 데 주의한다.
- **수정:** junior to + 사람. than을 쓰지 않는다.
- **이유:** 학습 지시·군더더기 표현

### 26:10:7 · symbol (1)

- **뜻:** ① 상징
- **예문:** A red rose is a {{BLANK}} of love.
- **원문:** a symbol of ~가 대표 연어다.
- **수정:** a symbol of ~.
- **이유:** 학습 지시·군더더기 표현

### 27:1:9 · missile (1)

- **뜻:** ① 미사일
- **예문:** The news showed a {{BLANK}} test on TV.
- **원문:** [미슬]에 가깝게 읽는다. 쏘는 것은 launch a missile.
- **수정:** launch a missile은 미사일을 쏘다.
- **이유:** 단순 발음·강세 중복

### 27:2:3 · elite (1)

- **뜻:** ① 엘리트층, 정예
- **예문:** Only the {{BLANK}} can join that tennis club.
- **원문:** [일리트]로 읽는다. 명사·형용사 둘 다. elite school(명문교).
- **수정:** 명사·형용사 둘 다. elite school(명문교).
- **이유:** 단순 발음·강세 중복

### 27:7:7 · refugee (1)

- **뜻:** ① 난민, 피난민
- **예문:** Her family came here as {{BLANK}}s.
- **원문:** refuge(피난처)+-ee. 강세가 맨 뒤에 오는 점에 주의.
- **수정:** refuge(피난처)+-ee.
- **이유:** 단순 발음·강세 중복

### 28:1:14 · naked (2)

- **뜻:** ② 맨-, 그대로 드러난
- **예문:** You can see the star with the {{BLANK}} eye.
- **원문:** the naked eye(육안)가 대표 짝. '도구 없이 맨-'의 뜻.
- **수정:** the naked eye(육안). '도구 없이 맨-'의 뜻.
- **이유:** 학습 지시·군더더기 표현

### 28:2:2 · measurement (2)

- **뜻:** ② 치수, 크기
- **예문:** Take my {{BLANK}}s before you make the shirt.
- **원문:** 잰 '결과'를 뜻할 땐 보통 복수형. take measurements 짝.
- **수정:** 잰 '결과'를 뜻할 땐 보통 복수형. take measurements.
- **이유:** 학습 지시·군더더기 표현

### 28:2:9 · acre (1)

- **뜻:** ① 에이커(넓이 단위)
- **예문:** His farm covers about ten {{BLANK}}s of land.
- **원문:** 약 4,047㎡로 축구장 절반쯤. 발음 [에이커]에 주의.
- **수정:** 약 4,047㎡.
- **이유:** 단어 학습 기여가 낮은 곁말

### 28:3:2 · bench (1)

- **뜻:** ① 벤치, 긴 의자
- **예문:** We sat on a {{BLANK}} near the river.
- **원문:** 여럿이 앉는 긴 의자. sit on a bench처럼 on과 짝짓는다.
- **수정:** 여럿이 앉는 긴 의자. sit on a bench.
- **이유:** 같은 정보·뜻·예문 반복

### 28:3:5 · odds (2)

- **뜻:** ② 역경, 불리한 조건
- **예문:** She won against all {{BLANK}}.
- **원문:** against (all) the odds가 대표 짝. '불리함을 무릅쓰고'.
- **수정:** against (all) the odds: 불리함을 무릅쓰고.
- **이유:** 학습 지시·군더더기 표현

### 28:4:4 · politically (1)

- **뜻:** ① 정치적으로
- **예문:** That word is not {{BLANK}} correct.
- **원문:** political(정치의)+-ly. politically correct가 대표 짝.
- **수정:** political(정치의)+-ly. politically correct.
- **이유:** 학습 지시·군더더기 표현

### 28:5:1 · running (1)

- **뜻:** ① 달리기
- **예문:** {{BLANK}} every morning keeps me awake in class.
- **원문:** run의 굴절꼴. go running(달리러 가다)이 흔한 짝.
- **수정:** run의 굴절꼴. go running(달리러 가다).
- **이유:** 학습 지시·군더더기 표현

### 28:5:3 · divorce (1)

- **뜻:** ① 이혼
- **예문:** Her parents got a {{BLANK}} last spring.
- **원문:** get a divorce가 대표 짝. 동사로는 divorce him처럼 쓴다.
- **수정:** get a divorce. 동사로는 divorce him처럼 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 28:5:5 · canadian (1)

- **뜻:** ① 캐나다의, 캐나다인의
- **예문:** My {{BLANK}} friend moved here two years ago.
- **원문:** 항상 대문자로 씀. Canada+-ian이고 강세는 na에 온다.
- **수정:** 항상 대문자로 씀. Canada+-ian.
- **이유:** 단순 발음·강세 중복

### 28:6:0 · economist (1)

- **뜻:** ① 경제학자
- **예문:** The {{BLANK}} said prices will rise next year.
- **원문:** economy(경제)+-ist. 강세는 con에 온다: [이카너미스트].
- **수정:** economy(경제)+-ist.
- **이유:** 단순 발음·강세 중복

### 28:7:5 · physically (2)

- **뜻:** ② 물리적으로, 실제로
- **예문:** It's {{BLANK}} impossible to be in both places.
- **원문:** physically impossible이 대표 짝. 자연 법칙상 안 된다는 뜻.
- **수정:** physically impossible: 자연 법칙상 안 된다는 뜻.
- **이유:** 학습 지시·군더더기 표현

### 28:8:8 · oven (1)

- **뜻:** ① 오븐
- **예문:** Put the bread in the {{BLANK}} for ten minutes.
- **원문:** 발음 [어븐]으로 o를 [오]로 읽지 않는다. in the oven이 짝.
- **수정:** 발음 [어븐]으로 o를 [오]로 읽지 않는다. in the oven.
- **이유:** 학습 지시·군더더기 표현

### 28:9:3 · restriction (1)

- **뜻:** ① 제한, 규제
- **예문:** There is a {{BLANK}} on phone use at school.
- **원문:** restrict(제한하다)+-ion. a restriction on ~처럼 on과 짝.
- **수정:** restrict(제한하다)+-ion. a restriction on ~.
- **이유:** 같은 정보·뜻·예문 반복

### 28:10:8 · pizza (1)

- **뜻:** ① 피자
- **예문:** Let's order {{BLANK}} after the test.
- **원문:** a slice of pizza로 한 조각을 센다. 발음 [피짜]에 주의.
- **수정:** a slice of pizza로 한 조각을 센다.
- **이유:** 단순 발음·강세 중복

### 28:10:13 · treaty (1)

- **뜻:** ① 조약
- **예문:** The two countries signed a peace {{BLANK}}.
- **원문:** 나라끼리 맺는 공식 약속. sign a treaty가 대표 짝.
- **수정:** 나라끼리 맺는 공식 약속. sign a treaty.
- **이유:** 학습 지시·군더더기 표현

### 29:1:7 · operator (1)

- **뜻:** ① (기계) 기사, 조작하는 사람
- **예문:** The machine {{BLANK}} showed us how to start it.
- **원문:** operate(조작하다)+or. 사람 명사를 만드는 -or에 주의.
- **수정:** operate(조작하다)+or.
- **이유:** 같은 정보·뜻·예문 반복

### 29:2:0 · vaccine (1)

- **뜻:** ① 백신
- **예문:** I got a {{BLANK}} at the health center yesterday.
- **원문:** get[have] a vaccine. 동사는 vaccinate. 강세는 뒤에 [백씬].
- **수정:** get[have] a vaccine. 동사는 vaccinate.
- **이유:** 단순 발음·강세 중복

### 29:2:7 · nomination (1)

- **뜻:** ① 지명, 후보 지명
- **예문:** Her movie got three {{BLANK}}s this year.
- **원문:** nominate(지명하다)+ion. 원형은 nominate이고 nominee는 '지명된 사람'.
- **수정:** nominate(지명하다)+ion. nominee는 '지명된 사람'.
- **이유:** 같은 정보·뜻·예문 반복

### 29:3:1 · robot (1)

- **뜻:** ① 로봇
- **예문:** Our school club built a small {{BLANK}}.
- **원문:** 체코어 '노동'에서 온 말. 강세는 앞에 [로밧].
- **수정:** 체코어 '노동'에서 온 말.
- **이유:** 단순 발음·강세 중복

### 29:4:11 · uncomfortable (1)

- **뜻:** ① 불편한
- **예문:** These new shoes are really {{BLANK}}.
- **원문:** comfortable(편안한)에 un-을 붙였다. 강세는 -com-에.
- **수정:** comfortable(편안한)에 un-을 붙였다.
- **이유:** 단순 발음·강세 중복

### 29:4:13 · execute (1)

- **뜻:** ① 실행하다, 수행하다
- **예문:** The team {{BLANK}}d the plan very well.
- **원문:** 명사는 execution. 강세가 앞이라 [엑시큐트]로 읽는다.
- **수정:** 명사는 execution.
- **이유:** 단순 발음·강세 중복

### 29:6:9 · minimum (2)

- **뜻:** ② 최소한의, 최저의
- **예문:** Is $10 the {{BLANK}} wage around here?
- **원문:** 명사와 같은 꼴·같은 강세. 뒤에 명사가 오면 형용사: minimum wage 최저 임금, minimum age 최소 연령.
- **수정:** 뒤에 명사가 오면 형용사: minimum wage 최저 임금, minimum age 최소 연령.
- **이유:** 단순 발음·강세 중복

### 29:8:9 · poster (1)

- **뜻:** ① 포스터, 벽보
- **예문:** I put a band {{BLANK}} on my wall.
- **원문:** post(붙이다)+er. 붙이는 종이라서 poster다.
- **수정:** post(붙이다)+er.
- **이유:** 같은 정보·뜻·예문 반복

### 29:8:12 · lemon (1)

- **뜻:** ① 레몬
- **예문:** Put some {{BLANK}} in your tea.
- **원문:** 한 조각은 a slice of lemon. 강세는 앞에 [레먼].
- **수정:** 한 조각은 a slice of lemon.
- **이유:** 단순 발음·강세 중복

### 29:9:0 · bankruptcy (1)

- **뜻:** ① 파산
- **예문:** The store closed after its {{BLANK}}.
- **원문:** bankrupt(파산한)+cy. go into bankruptcy가 대표 짝이다.
- **수정:** bankrupt(파산한)+cy. go into bankruptcy.
- **이유:** 학습 지시·군더더기 표현

### 29:9:3 · sacred (1)

- **뜻:** ① 신성한, 성스러운
- **예문:** This mountain is {{BLANK}} to many people.
- **원문:** sacred to ~에게 신성한. 첫소리를 [세이]로 읽는 데 주의.
- **수정:** sacred to ~에게 신성한.
- **이유:** 단순 발음·강세 중복

### 29:9:13 · cabin (1)

- **뜻:** ① 오두막, 통나무집
- **예문:** We stayed in a log {{BLANK}} in the woods.
- **원문:** 나무로 지은 작고 소박한 집. log cabin이 대표 짝이다.
- **수정:** 나무로 지은 작고 소박한 집. log cabin.
- **이유:** 학습 지시·군더더기 표현

### 30:2:4 · helicopter (1)

- **뜻:** ① 헬리콥터
- **예문:** A {{BLANK}} landed on the hospital roof.
- **원문:** helico(나선)+pter(날개). 줄여서 chopper라고도 한다. [헬리캅터]
- **수정:** helico(나선)+pter(날개). 줄여서 chopper라고도 한다.
- **이유:** 단순 발음·강세 중복

### 30:3:10 · basement (1)

- **뜻:** ① 지하실
- **예문:** Our band practices in his {{BLANK}} on Fridays.
- **원문:** base(바닥)+-ment. 건물 맨 아래층. in the basement로 쓴다.
- **수정:** base(바닥)+-ment. in the basement로 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 30:4:2 · driving (2)

- **뜻:** ② 추진하는, 몰아붙이는
- **예문:** Money was the {{BLANK}} force behind his plan.
- **원문:** driving force(원동력)가 대표 짝. 뒤에서 밀어붙이는 힘이다.
- **수정:** driving force(원동력).
- **이유:** 같은 정보·뜻·예문 반복

### 30:5:3 · tackle (1)

- **뜻:** ① (문제와) 씨름하다, 달려들다
- **예문:** Let's {{BLANK}} the hardest math problem first.
- **원문:** tackle a problem이 대표 짝. 어려운 일에 맞붙는다는 뜻이다.
- **수정:** tackle a problem. 어려운 일에 맞붙는다는 뜻이다.
- **이유:** 학습 지시·군더더기 표현

### 30:5:8 · kit (1)

- **뜻:** ① (도구) 세트, 키트
- **예문:** Dad keeps a tool {{BLANK}} under the car seat.
- **원문:** tool kit, first aid kit처럼 앞말과 짝을 이룬다. 한 벌의 도구.
- **수정:** 한 벌의 도구. tool kit, first aid kit.
- **이유:** 학습 지시·군더더기 표현

### 30:6:9 · rhythm (1)

- **뜻:** ① 리듬, 박자
- **예문:** Move your body to the {{BLANK}} of the song.
- **원문:** 반복되는 소리·움직임의 일정한 흐름. the rhythm of a song은 노래의 리듬.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 30:8:2 · spill (2)

- **뜻:** ② 유출, 쏟아진 것
- **예문:** The oil {{BLANK}} killed fish along the coast.
- **원문:** an oil spill(기름 유출)이 대표 짝. 사고로 쏟아진 것을 뜻한다.
- **수정:** an oil spill(기름 유출). 사고로 쏟아진 것을 뜻한다.
- **이유:** 학습 지시·군더더기 표현

### 30:8:7 · slam (1)

- **뜻:** ① 쾅 닫다, 세게 놓다
- **예문:** Don't {{BLANK}} the door when you leave.
- **원문:** slam the door가 대표 짝. 소리 나게 세게 닫는다는 뜻이다.
- **수정:** slam the door. 소리 나게 세게 닫는다는 뜻이다.
- **이유:** 학습 지시·군더더기 표현

### 30:9:11 · genre (1)

- **뜻:** ① 장르, 갈래
- **예문:** Horror is my favorite movie {{BLANK}}.
- **원문:** 문학·음악·영화 등의 종류나 갈래. a film genre는 영화 장르.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 30:10:13 · warming (1)

- **뜻:** ① 온난화, 따뜻해짐
- **예문:** {{BLANK}} is melting ice at the North Pole.
- **원문:** warm+-ing. global warming(지구 온난화)이 대표 짝이다.
- **수정:** warm+-ing. global warming(지구 온난화).
- **이유:** 학습 지시·군더더기 표현

### 31:1:12 · spouse (1)

- **뜻:** ① 배우자
- **예문:** Each teacher may bring one {{BLANK}} to the party.
- **원문:** 남편·아내를 함께 가리키는 격식어. 발음은 [스파우스].
- **수정:** 남편·아내를 함께 가리키는 격식어.
- **이유:** 단순 발음·강세 중복

### 31:2:16 · hint (2)

- **뜻:** ② 넌지시 말하다, 암시하다
- **예문:** She {{BLANK}}ed at a surprise party for me.
- **원문:** hint at ~처럼 at과 짝을 이룬다. 대놓고 말하지 않는 것.
- **수정:** hint at ~. 대놓고 말하지 않는 것.
- **이유:** 같은 정보·뜻·예문 반복

### 31:4:5 · apology (1)

- **뜻:** ① 사과
- **예문:** I owe you an {{BLANK}} for yesterday.
- **원문:** owe/make an apology로 쓴다. 짝은 an apology for ~.
- **수정:** owe/make an apology. an apology for ~.
- **이유:** 학습 지시·군더더기 표현

### 31:7:3 · homeland (1)

- **뜻:** ① 조국, 고국
- **예문:** He missed his {{BLANK}} after ten years abroad.
- **원문:** 태어나 자란 나라.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 31:7:4 · technological (1)

- **뜻:** ① 기술의, 과학 기술의
- **예문:** {{BLANK}} change makes some old jobs go away.
- **원문:** technology(기술)+ical. 짝은 technological change.
- **수정:** technology(기술)+ical. technological change.
- **이유:** 학습 지시·군더더기 표현

### 31:9:5 · immune (1)

- **뜻:** ① 면역이 있는
- **예문:** Some people are naturally {{BLANK}} to this disease.
- **원문:** 짝은 be immune to ~. immune system은 면역 체계.
- **수정:** be immune to ~. immune system은 면역 체계.
- **이유:** 학습 지시·군더더기 표현

### 31:9:9 · quest (1)

- **뜻:** ① 탐구, 추구
- **예문:** Her {{BLANK}} for the perfect pizza never ends.
- **원문:** 가치 있는 목표를 찾아 나서는 긴 탐구. a quest for는 ~을 향한 탐구·추구. 게임의 퀘스트도 같은 말이다.
- **수정:** 가치 있는 목표를 찾아 나서는 긴 탐구. a quest for는 ~을 향한 탐구·추구.
- **이유:** 단어 학습 기여가 낮은 곁말

### 32:1:3 · courtesy (1)

- **뜻:** ① 예의, 공손함
- **예문:** He held the door open out of {{BLANK}}.
- **원문:** out of courtesy(예의상)가 흔한 짝. 형용사는 courteous.
- **수정:** out of courtesy(예의상). 형용사는 courteous.
- **이유:** 학습 지시·군더더기 표현

### 32:3:6 · iranian (1)

- **뜻:** ① 이란의, 이란인의
- **예문:** My {{BLANK}} friend taught me a few words.
- **원문:** 항상 대문자로 씀. Iran+ian. [이레이니언]으로 읽는다.
- **수정:** 항상 대문자로 씀. Iran+ian.
- **이유:** 단순 발음·강세 중복

### 32:4:6 · whale (1)

- **뜻:** ① 고래
- **예문:** We saw a huge {{BLANK}} jump out of the sea.
- **원문:** 고래는 물고기가 아니라 젖먹이 동물. wh는 [w]로 읽는다.
- **수정:** wh는 [w]로 읽는다.
- **이유:** 단어 학습 기여가 낮은 곁말

### 32:4:7 · credibility (1)

- **뜻:** ① 신뢰성, 신빙성
- **예문:** That excuse cost him all his {{BLANK}} with us.
- **원문:** credible(믿을 만한)+ity. lose/gain credibility가 흔한 짝.
- **수정:** credible(믿을 만한)+ity. lose/gain credibility.
- **이유:** 학습 지시·군더더기 표현

### 32:6:12 · theology (1)

- **뜻:** ① 신학
- **예문:** My cousin studies {{BLANK}} at a church college.
- **원문:** theo(신)+logy(학문). 신을 연구하는 학문이다.
- **수정:** theo(신)+logy(학문).
- **이유:** 같은 정보·뜻·예문 반복

### 32:9:5 · patrol (1)

- **뜻:** ① 순찰하다
- **예문:** Police cars {{BLANK}} the streets at night.
- **원문:** on patrol(순찰 중). 강세는 뒤에 있어 [퍼트롤].
- **수정:** on patrol(순찰 중).
- **이유:** 단순 발음·강세 중복

### 32:10:8 · syndrome (1)

- **뜻:** ① 증후군
- **예문:** The doctor explained the strange {{BLANK}} to us.
- **원문:** 함께 나타나는 여러 증상이나 특징의 묶음. [신드롬].
- **수정:** 함께 나타나는 여러 증상이나 특징의 묶음.
- **이유:** 단순 발음·강세 중복

### 33:2:4 · likelihood (1)

- **뜻:** ① 가능성, 개연성
- **예문:** There's little {{BLANK}} of snow this week.
- **원문:** likely(있음 직한)+-hood. the likelihood of ~ 로 of와 짝.
- **수정:** likely(있음 직한)+-hood. the likelihood of ~.
- **이유:** 같은 정보·뜻·예문 반복

### 33:3:0 · believer (1)

- **뜻:** ① 믿는 사람, 신자
- **예문:** I'm a big {{BLANK}} in getting enough sleep.
- **원문:** believe(믿다)+-er. a believer in ~ 처럼 in과 짝을 이룬다.
- **수정:** believe(믿다)+-er. a believer in ~.
- **이유:** 같은 정보·뜻·예문 반복

### 33:5:11 · harassment (1)

- **뜻:** ① 희롱, (집요한) 괴롭힘
- **예문:** The school has clear rules about {{BLANK}}.
- **원문:** harass(괴롭히다)+-ment. 발음은 [허래스먼트]가 흔하다.
- **수정:** harass(괴롭히다)+-ment.
- **이유:** 단순 발음·강세 중복

### 33:8:12 · juror (1)

- **뜻:** ① 배심원
- **예문:** Each {{BLANK}} listened to both sides carefully.
- **원문:** 배심원단 jury의 구성원 한 사람. 양쪽의 증거와 주장을 듣고 사건의 사실을 판단하는 데 참여한다.
- **수정:** 배심원단 jury의 구성원 한 사람.
- **이유:** 단어 학습 기여가 낮은 곁말

### 33:10:13 · shortage (1)

- **뜻:** ① 부족, 모자람
- **예문:** Our town had a water {{BLANK}} last summer.
- **원문:** short(부족한)+-age. a shortage of ~ 로 of와 짝을 이룬다.
- **수정:** short(부족한)+-age. a shortage of ~.
- **이유:** 같은 정보·뜻·예문 반복

### 34:1:13 · sodium (1)

- **뜻:** ① 나트륨
- **예문:** Fast food is full of {{BLANK}} and fat.
- **원문:** 원소 기호는 Na. 식염인 염화나트륨(NaCl)을 이루는 원소 중 하나이며 영양 표시에 나트륨 함량이 나온다.
- **수정:** 원소 기호는 Na. 식염인 염화나트륨(NaCl)을 이루는 원소 중 하나.
- **이유:** 단어 학습 기여가 낮은 곁말

### 34:4:7 · halloween (1)

- **뜻:** ① 핼러윈
- **예문:** We wore costumes to the {{BLANK}} party.
- **원문:** 대문자로 씀. 10월 31일 밤이고 trick or treat이 대표 표현이다.
- **수정:** 대문자로 씀. 10월 31일 밤. trick or treat.
- **이유:** 학습 지시·군더더기 표현

### 34:4:11 · technically (2)

- **뜻:** ② 기술적으로
- **예문:** This song is {{BLANK}} hard to sing well.
- **원문:** 기술이나 기법의 면에서라는 뜻. technically difficult가 흔한 짝.
- **수정:** 기술이나 기법의 면에서라는 뜻. technically difficult.
- **이유:** 학습 지시·군더더기 표현

### 34:5:2 · midst (1)

- **뜻:** ① 한가운데
- **예문:** She called me in the {{BLANK}} of dinner.
- **원문:** 거의 늘 in the midst of 꼴로 쓴다. middle의 문어체 사촌이다.
- **수정:** 거의 늘 in the midst of 꼴로 쓴다. middle의 문어체.
- **이유:** 학습 지시·군더더기 표현

### 35:1:1 · ray (1)

- **뜻:** ① 광선, 빛줄기
- **예문:** A {{BLANK}} of sunlight came through the window.
- **원문:** a ray of sunlight처럼 of와 짝을 이룬다. X-rays는 엑스선이다.
- **수정:** a ray of sunlight. X-rays는 엑스선이다.
- **이유:** 같은 정보·뜻·예문 반복

### 35:1:2 · ray (2)

- **뜻:** ② 한 줄기(희망)
- **예문:** Her smile was a {{BLANK}} of hope for us.
- **원문:** a ray of hope(한 줄기 희망)가 대표 연어다. 비유로만 쓴다.
- **수정:** a ray of hope(한 줄기 희망). 비유로만 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 35:1:4 · depressed (2)

- **뜻:** ② (경기가) 침체된
- **예문:** Shops are closing in this {{BLANK}} town.
- **원문:** 경제나 지역이 가라앉은 상태. a depressed economy가 흔한 짝이다.
- **수정:** 경제나 지역이 가라앉은 상태. a depressed economy.
- **이유:** 학습 지시·군더더기 표현

### 35:2:7 · streak (2)

- **뜻:** ② 연속 기록
- **예문:** Our team is on a five-game winning {{BLANK}}.
- **원문:** a winning[losing] streak(연승·연패). on a streak가 짝이다.
- **수정:** a winning[losing] streak(연승·연패). on a streak.
- **이유:** 학습 지시·군더더기 표현

### 35:3:3 · warrant (1)

- **뜻:** ① 영장
- **예문:** The police showed a search {{BLANK}} at the door.
- **원문:** 법원이 내주는 서류. a search[arrest] warrant가 대표 연어다.
- **수정:** 법원이 내주는 서류. a search[arrest] warrant.
- **이유:** 학습 지시·군더더기 표현

### 35:3:5 · tattoo (1)

- **뜻:** ① 문신
- **예문:** My cousin got a small {{BLANK}} on her arm.
- **원문:** get a tattoo(문신을 하다)로 쓴다. 강세는 뒤쪽 -too에 있다.
- **수정:** get a tattoo(문신을 하다)로 쓴다.
- **이유:** 단순 발음·강세 중복

### 35:4:10 · merchant (1)

- **뜻:** ① 상인
- **예문:** The {{BLANK}} sold silk from a small boat.
- **원문:** 물건을 사고파는 사람. 요즘은 판매업자라는 뜻으로도 쓴다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 35:5:3 · stunning (2)

- **뜻:** ② 놀라운, 충격적인
- **예문:** That was a {{BLANK}} win for our school.
- **원문:** 예상 밖의 일에도 쓴다. a stunning victory[defeat]가 흔한 짝이다.
- **수정:** 예상 밖의 일에도 쓴다. a stunning victory[defeat].
- **이유:** 학습 지시·군더더기 표현

### 35:5:12 · make-up (1)

- **뜻:** ① 화장, 화장품
- **예문:** My sister puts on {{BLANK}} before school.
- **원문:** 미국식은 makeup으로 붙여 쓴다. wear[put on] make-up이 짝이다.
- **수정:** 미국식은 makeup으로 붙여 쓴다. wear[put on] make-up.
- **이유:** 학습 지시·군더더기 표현

### 35:6:8 · well-known (1)

- **뜻:** ① 잘 알려진
- **예문:** This street is {{BLANK}} for its cheap food.
- **원문:** well+known. be well-known for(~로 유명하다)가 대표 연어다.
- **수정:** well+known. be well-known for(~로 유명하다).
- **이유:** 학습 지시·군더더기 표현

### 35:9:2 · connected (1)

- **뜻:** ① 연결된, 관련된
- **예문:** My phone isn't {{BLANK}} to the internet.
- **원문:** be connected to[with]가 짝이다. 사람 사이의 인연에도 쓴다.
- **수정:** be connected to[with]. 사람 사이의 인연에도 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 35:9:3 · accepted (1)

- **뜻:** ① 널리 인정되는, 받아들여지는
- **예문:** It's an {{BLANK}} fact that plants need light.
- **원문:** a widely accepted fact[idea]가 대표 연어다. 명사 앞에 쓴다.
- **수정:** a widely accepted fact[idea]. 명사 앞에 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 36:3:2 · impressed (1)

- **뜻:** ① 감명받은, 감탄한
- **예문:** I was {{BLANK}} by how fast she learned.
- **원문:** impress(감동시키다)+-ed. 짝은 by 또는 with를 쓴다.
- **수정:** impress(감동시키다)+-ed. 뒤에는 by/with.
- **이유:** 학습 지시·군더더기 표현

### 36:4:3 · bass (2)

- **뜻:** ② 배스, 농어류의 물고기
- **예문:** Dad caught a big {{BLANK}} at the lake.
- **원문:** 물고기 뜻일 땐 [배스]로 읽는다. 철자가 같아 헷갈리기 쉽다.
- **수정:** 물고기 뜻일 땐 [배스]로 읽는다.
- **이유:** 학습 지시·군더더기 표현

### 36:6:11 · excess (1)

- **뜻:** ① 과다, 지나침
- **예문:** An {{BLANK}} of sugar is bad for you.
- **원문:** 「an excess of+명사」로 '~의 과다'. 짝은 of를 쓴다.
- **수정:** 「an excess of+명사」로 '~의 과다'.
- **이유:** 같은 정보·뜻·예문 반복

### 36:6:12 · excess (2)

- **뜻:** ② 초과한, 여분의
- **예문:** We paid for our {{BLANK}} bags at the airport.
- **원문:** 명사 앞에서 '기준을 넘는'. excess baggage가 대표 짝이다.
- **수정:** 명사 앞에서 '기준을 넘는'. excess baggage.
- **이유:** 학습 지시·군더더기 표현

### 36:8:5 · balanced (1)

- **뜻:** ① 균형 잡힌
- **예문:** A {{BLANK}} meal keeps you healthy.
- **원문:** balance(균형)+-ed. balanced diet가 대표 짝이다.
- **수정:** balance(균형)+-ed. balanced diet.
- **이유:** 학습 지시·군더더기 표현

### 36:8:6 · parliamentary (1)

- **뜻:** ① 의회의
- **예문:** The {{BLANK}} vote is next Tuesday.
- **원문:** parliament(의회)+-ary. 영국 정치 기사에 자주 나온다.
- **수정:** parliament(의회)+-ary.
- **이유:** 학습 지시·군더더기 표현

### 36:8:8 · contrary (1)

- **뜻:** ① 반대되는, 반대의
- **예문:** His plan is {{BLANK}} to what we agreed.
- **원문:** 「contrary to+명사」로 '~와 반대로'. 짝 전치사는 to.
- **수정:** 「contrary to+명사」로 '~와 반대로'.
- **이유:** 같은 정보·뜻·예문 반복

### 36:9:1 · preliminary (1)

- **뜻:** ① 예비의, 예선의
- **예문:** We passed the {{BLANK}} round last week.
- **원문:** 본 경기·본 조사 앞에 오는 것. 대표 짝은 round와 test.
- **수정:** 본 경기·본 조사 앞에 오는 것. round·test와 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 36:10:0 · vertical (1)

- **뜻:** ① 수직의, 세로의
- **예문:** Draw a {{BLANK}} line down the middle.
- **원문:** 위아래 방향. 가로는 horizontal이니 짝으로 외운다.
- **수정:** 위아래 방향. 가로는 horizontal.
- **이유:** 학습 지시·군더더기 표현

### 36:10:4 · applicable (1)

- **뜻:** ① 해당되는, 적용되는
- **예문:** This rule is not {{BLANK}} to first-year students.
- **원문:** apply(적용하다)+-able. 짝은 to를 쓴다.
- **수정:** apply(적용하다)+-able. 뒤에는 to.
- **이유:** 학습 지시·군더더기 표현

### 37:1:2 · adjacent (1)

- **뜻:** ① 인접한, 바로 옆의
- **예문:** We booked two {{BLANK}} rooms at the hotel.
- **원문:** adjacent to ~와 인접한. 전치사 to와 짝을 이룬다.
- **수정:** adjacent to ~와 인접한.
- **이유:** 같은 정보·뜻·예문 반복

### 37:2:3 · harmony (1)

- **뜻:** ① 조화, 화합
- **예문:** The two colors are in perfect {{BLANK}}.
- **원문:** in harmony with ~와 조화를 이루어. 전치사 with와 짝을 이룬다.
- **수정:** in harmony with ~와 조화를 이루어.
- **이유:** 같은 정보·뜻·예문 반복

### 37:2:6 · molecular (1)

- **뜻:** ① 분자의
- **예문:** Water has a simple {{BLANK}} structure.
- **원문:** molecule(분자)의 형용사. 명사와 철자가 다르니 주의.
- **수정:** molecule(분자)의 형용사.
- **이유:** 학습 지시·군더더기 표현

### 37:3:11 · smash (1)

- **뜻:** ① 박살내다, 부수다
- **예문:** He {{BLANK}}ed the window with a ball.
- **원문:** break보다 훨씬 세다. 산산조각 나는 그림을 떠올려라.
- **수정:** break보다 훨씬 세다. 산산조각 나다.
- **이유:** 학습 지시·군더더기 표현

### 37:4:12 · warehouse (1)

- **뜻:** ① 창고
- **예문:** The store keeps extra shoes in a {{BLANK}}.
- **원문:** ware(상품)+house(집). 물건을 크게 쌓아 두는 곳이다.
- **수정:** ware(상품)+house(집).
- **이유:** 같은 정보·뜻·예문 반복

### 37:6:11 · martial (1)

- **뜻:** ① 무술의, 군사의
- **예문:** My brother learns {{BLANK}} arts after school.
- **원문:** [마셜]. martial arts 무술, martial law 계엄령으로 외운다.
- **수정:** martial arts 무술, martial law 계엄령.
- **이유:** 단순 발음·강세 중복

### 37:9:2 · badge (1)

- **뜻:** ① 배지, 명찰
- **예문:** Every worker wears a name {{BLANK}} here.
- **원문:** [배지]. 옷에 다는 표식. 경찰 신분증도 badge라 한다.
- **수정:** 경찰 신분증도 badge라 한다.
- **이유:** 단순 발음·강세 중복

### 37:9:7 · gauge (1)

- **뜻:** ① 계기, 측정기
- **예문:** The car's gas {{BLANK}} is broken.
- **원문:** [게이지]. gas gauge(연료 계기). 미국 영어에서 gage로 쓰기도 한다.
- **수정:** gas gauge(연료 계기). 미국 영어에서 gage로 쓰기도 한다.
- **이유:** 단순 발음·강세 중복

### 37:10:5 · orchestra (1)

- **뜻:** ① 관현악단, 오케스트라
- **예문:** Our school {{BLANK}} plays every spring.
- **원문:** [오케스트라]. 원래 그리스 극장의 무대 앞 공간을 뜻했다.
- **수정:** 원래 그리스 극장의 무대 앞 공간을 뜻했다.
- **이유:** 단순 발음·강세 중복

### 38:2:0 · insult (1)

- **뜻:** ① 모욕하다
- **예문:** Don't {{BLANK}} my cooking in front of Mom.
- **원문:** 동사는 뒤 음절, 명사는 앞 음절에 강세가 온다. 뜻은 같다.
- **수정:** 동사는 뒤 음절, 명사는 앞 음절에 강세가 온다.
- **이유:** 같은 정보·뜻·예문 반복

### 38:6:5 · polar (2)

- **뜻:** ② 정반대의
- **예문:** My sister and I are {{BLANK}} opposites.
- **원문:** polar opposites가 통째로 쓰이는 짝이다. 성격 대비에 자주.
- **수정:** polar opposites. 성격 대비에 쓴다.
- **이유:** 학습 지시·군더더기 표현

### 38:6:7 · superb (1)

- **뜻:** ① 최고의, 훌륭한
- **예문:** Our team played a {{BLANK}} game last night.
- **원문:** good보다 훨씬 센 칭찬. 강세는 뒤에 있어 [수퍼브].
- **수정:** good보다 훨씬 센 칭찬.
- **이유:** 단순 발음·강세 중복

### 38:6:9 · absurd (1)

- **뜻:** ① 터무니없는, 어이없는
- **예문:** That excuse sounds totally {{BLANK}} to me.
- **원문:** 말이 안 될 만큼 우스울 때 쓴다. 강세는 뒤 [업서드].
- **수정:** 말이 안 될 만큼 우스울 때 쓴다.
- **이유:** 단순 발음·강세 중복

### 38:8:3 · robust (1)

- **뜻:** ① 튼튼한, 탄탄한
- **예문:** My old bike is still pretty {{BLANK}}.
- **원문:** 사람·물건·체계에 두루 쓴다. 강세는 뒤 [로버스트].
- **수정:** 사람·물건·체계에 두루 쓴다.
- **이유:** 단순 발음·강세 중복

### 39:1:1 · velocity (1)

- **뜻:** ① 속도
- **예문:** The ball's {{BLANK}} was too high to catch.
- **원문:** speed의 과학 용어. 방향까지 따지는 속도라 물리 지문에 나온다.
- **수정:** speed의 과학 용어. 방향까지 따지는 속도.
- **이유:** 학습 지시·군더더기 표현

### 39:2:2 · massacre (1)

- **뜻:** ① 대학살
- **예문:** The book describes a terrible {{BLANK}} in that village.
- **원문:** 많은 사람을 한꺼번에 죽임. [매서커]로 읽고 동사로도 쓴다.
- **수정:** 동사로도 쓴다.
- **이유:** 단순 발음·강세 중복

### 39:3:3 · discretion (1)

- **뜻:** ① 재량, 판단에 맡김
- **예문:** The final grade is at the teacher's {{BLANK}}.
- **원문:** at your discretion(네 재량대로)이 핵심 짝. 판단할 권한을 뜻한다.
- **수정:** at your discretion(네 재량대로). 판단할 권한을 뜻한다.
- **이유:** 학습 지시·군더더기 표현

### 39:5:6 · sadness (1)

- **뜻:** ① 슬픔
- **예문:** I heard the {{BLANK}} in her voice.
- **원문:** sad(슬픈)+-ness. 형용사를 명사로 만드는 -ness다. 셀 수 없다.
- **수정:** sad(슬픈)+-ness. 셀 수 없다.
- **이유:** 같은 정보·뜻·예문 반복

### 39:7:8 · scroll (1)

- **뜻:** ① 스크롤하다, 화면을 밀다
- **예문:** I {{BLANK}} down my feed before bed.
- **원문:** scroll down/up이 짝. 두루마리를 펴듯 화면을 미는 것이다.
- **수정:** scroll down/up. 두루마리를 펴듯 화면을 미는 것이다.
- **이유:** 학습 지시·군더더기 표현

### 39:7:11 · symbolic (1)

- **뜻:** ① 상징적인
- **예문:** The white bird is {{BLANK}} of peace.
- **원문:** symbol(상징)+-ic. be symbolic of ~(~을 상징하다)로 외운다.
- **수정:** symbol(상징)+-ic. be symbolic of ~(~을 상징하다).
- **이유:** 학습 지시·군더더기 표현

### 39:8:3 · allowance (2)

- **뜻:** ② 참작, 고려
- **예문:** Make {{BLANK}}s for how young he is.
- **원문:** make allowances for ~(~을 참작하다)가 핵심 짝이다.
- **수정:** make allowances for ~(~을 참작하다).
- **이유:** 학습 지시·군더더기 표현

### 39:9:2 · exile (1)

- **뜻:** ① 망명, 추방
- **예문:** The writer lived in {{BLANK}} for twenty years.
- **원문:** in exile(망명 중인)이 핵심 짝. 동사로 '추방하다'도 된다.
- **수정:** in exile(망명 중인). 동사로 '추방하다'도 된다.
- **이유:** 학습 지시·군더더기 표현

### 39:9:7 · urine (1)

- **뜻:** ① 소변
- **예문:** The doctor asked for a {{BLANK}} test.
- **원문:** 의학·과학의 격식체다. [유린]으로 읽고 셀 수 없이 쓴다.
- **수정:** 의학·과학의 격식체다. 셀 수 없이 쓴다.
- **이유:** 단순 발음·강세 중복

### 39:10:2 · cone (1)

- **뜻:** ① 원뿔
- **예문:** Draw a {{BLANK}} next to the circle.
- **원문:** 밑면이 둥글고 끝이 뾰족한 도형. 수학 지문에 자주 나온다.
- **수정:** 밑면이 둥글고 끝이 뾰족한 도형.
- **이유:** 학습 지시·군더더기 표현

### 40:1:12 · broadly (2)

- **뜻:** ② 활짝(웃다)
- **예문:** Grandpa smiled {{BLANK}} when I called him.
- **원문:** smile broadly = 입을 크게 벌려 활짝 웃다. smile과 짝지어 쓴다.
- **수정:** smile broadly = 입을 크게 벌려 활짝 웃다.
- **이유:** 같은 정보·뜻·예문 반복

### 40:1:13 · calcium (1)

- **뜻:** ① 칼슘
- **예문:** Milk gives you {{BLANK}} for strong bones.
- **원문:** 물질 이름이라 셀 수 없다. 발음은 [캘시엄]에 가깝다.
- **수정:** 물질 이름이라 셀 수 없다.
- **이유:** 단순 발음·강세 중복

### 40:3:3 · surge (1)

- **뜻:** ① 급증, 급등
- **예문:** There was a {{BLANK}} in ticket sales today.
- **원문:** a surge in A(A의 급증). 전치사 in과 짝지어 쓴다.
- **수정:** a surge in A(A의 급증).
- **이유:** 같은 정보·뜻·예문 반복

### 40:4:7 · sausage (1)

- **뜻:** ① 소시지
- **예문:** I put two {{BLANK}}s in my lunch box.
- **원문:** 고기를 갈아 넣어 만든 것. 발음은 [사시지]에 가깝다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 40:5:14 · faction (1)

- **뜻:** ① 파벌, 분파
- **예문:** Our class split into two {{BLANK}}s over the trip.
- **원문:** 한 집단 안에서 갈라진 무리. 정치 기사에 자주 나온다.
- **수정:** 한 집단 안에서 갈라진 무리.
- **이유:** 학습 지시·군더더기 표현

### 40:7:3 · lick (1)

- **뜻:** ① 핥다
- **예문:** My dog likes to {{BLANK}} my hand.
- **원문:** 혀로 핥다. 아이스크림을 먹을 때도 lick을 쓴다.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 40:9:7 · nitrogen (1)

- **뜻:** ① 질소
- **예문:** Most of the air around us is {{BLANK}}.
- **원문:** 공기의 약 78%를 차지하는 기체다. 물질명이라 셀 수 없다.
- **수정:** 물질명이라 셀 수 없다.
- **이유:** 단어 학습 기여가 낮은 곁말

### 41:1:2 · frightened (1)

- **뜻:** ① 겁먹은, 무서워하는
- **예문:** The {{BLANK}} cat hid under the bed all day.
- **원문:** frighten(겁주다)의 형용사. 짝은 be frightened of[about] ~.
- **수정:** frighten(겁주다)의 형용사. be frightened of[about] ~.
- **이유:** 학습 지시·군더더기 표현

### 41:1:3 · expenditure (1)

- **뜻:** ① 지출, 경비
- **예문:** Our club cut its {{BLANK}} on snacks.
- **원문:** 격식체. 짝은 expenditure on ~. 동사는 expend(쓰다)다.
- **수정:** 격식체. expenditure on ~. 동사는 expend(쓰다)다.
- **이유:** 학습 지시·군더더기 표현

### 41:1:4 · allocation (1)

- **뜻:** ① 할당(량), 배분
- **예문:** Each team got an equal {{BLANK}} of time.
- **원문:** 짝은 allocation of ~.
- **수정:** allocation of ~.
- **이유:** 학습 지시·군더더기 표현

### 41:1:11 · scrutiny (1)

- **뜻:** ① 면밀한 조사, 정밀 검토
- **예문:** Our school rules are under close {{BLANK}}.
- **원문:** under scrutiny(조사받는 중), close scrutiny가 흔한 짝이다.
- **수정:** under scrutiny(조사받는 중), close scrutiny.
- **이유:** 학습 지시·군더더기 표현

### 41:3:3 · confrontation (1)

- **뜻:** ① 대립, 대치
- **예문:** I want to avoid a {{BLANK}} with my dad.
- **원문:** confront(맞서다)+-ation. 짝은 confrontation with[between].
- **수정:** confront(맞서다)+-ation. confrontation with[between].
- **이유:** 학습 지시·군더더기 표현

### 41:3:7 · philosopher (1)

- **뜻:** ① 철학자
- **예문:** That Greek {{BLANK}} asked what a good life is.
- **원문:** philosophy(철학)의 사람 명사. 강세는 둘째 음절 [필라서퍼].
- **수정:** philosophy(철학)의 사람 명사.
- **이유:** 단순 발음·강세 중복

### 41:4:8 · proudly (1)

- **뜻:** ① 자랑스럽게
- **예문:** She {{BLANK}} showed us her new bike.
- **원문:** proud(자랑스러운)+-ly. 형용사 짝은 be proud of ~.
- **수정:** proud(자랑스러운)+-ly. be proud of ~.
- **이유:** 학습 지시·군더더기 표현

### 41:5:17 · tract (2)

- **뜻:** ② (몸속의) 관, 계통
- **예문:** Air goes down the respiratory {{BLANK}} to your lungs.
- **원문:** 몸속 통로. digestive[respiratory] tract처럼 앞말과 짝짓는다.
- **수정:** 몸속 통로. digestive[respiratory] tract.
- **이유:** 학습 지시·군더더기 표현

### 41:7:4 · broadband (1)

- **뜻:** ① 초고속 인터넷
- **예문:** Our {{BLANK}} is slow when everyone is home.
- **원문:** 빠른 인터넷 연결.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 41:8:0 · takeover (1)

- **뜻:** ① (기업) 인수
- **예문:** A bigger company tried a hostile {{BLANK}} last year.
- **원문:** take over(인수하다)를 붙여 만든 명사. 강세는 앞에 있다.
- **수정:** take over(인수하다)를 붙여 만든 명사.
- **이유:** 단순 발음·강세 중복

### 41:8:2 · smoothly (1)

- **뜻:** ① 순조롭게
- **예문:** The show went {{BLANK}} from start to end.
- **원문:** go[run] smoothly(순조롭게 진행되다)가 가장 흔한 짝이다.
- **수정:** go[run] smoothly(순조롭게 진행되다).
- **이유:** 학습 지시·군더더기 표현

### 42:3:7 · fuss (1)

- **뜻:** ① 야단법석, 호들갑
- **예문:** Don't make a {{BLANK}} over one bad grade.
- **원문:** make a fuss about/over ~: ~로 소란을 피우다. 대표 연어다.
- **수정:** make a fuss about/over ~: ~로 소란을 피우다.
- **이유:** 학습 지시·군더더기 표현

### 42:6:1 · congratulate (1)

- **뜻:** ① 축하하다
- **예문:** I want to {{BLANK}} you on your new job.
- **원문:** congratulate 사람 on 일. 사람이 목적어라는 점을 꼭 기억해라.
- **수정:** congratulate 사람 on 일.
- **이유:** 같은 정보·뜻·예문 반복

### 42:6:5 · wicket (1)

- **뜻:** ① (크리켓) 위킷, 삼주문
- **예문:** He knocked down the {{BLANK}} with one ball.
- **원문:** 크리켓에서 공으로 맞히는 세 기둥. 영국 글에 자주 나온다.
- **수정:** 크리켓에서 공으로 맞히는 세 기둥.
- **이유:** 학습 지시·군더더기 표현

### 42:6:7 · cushion (2)

- **뜻:** ② 충격을 줄이다, 덜어 주다
- **예문:** The thick grass {{BLANK}}ed my fall.
- **원문:** cushion the blow/fall: 충격을 덜어 주다. 대표 연어다.
- **수정:** cushion the blow/fall: 충격을 덜어 주다.
- **이유:** 학습 지시·군더더기 표현

### 42:7:2 · potassium (1)

- **뜻:** ① 칼륨, 포타슘
- **예문:** Bananas are full of {{BLANK}}, my mom says.
- **원문:** 원소 기호 K. 셀 수 없는 명사다. 신경과 근육에 꼭 필요하다.
- **수정:** 원소 기호 K. 셀 수 없는 명사다.
- **이유:** 단어 학습 기여가 낮은 곁말

### 42:7:5 · brightness (1)

- **뜻:** ① 밝기
- **예문:** Turn down the {{BLANK}} on your phone at night.
- **원문:** bright(밝은)+-ness. 형용사를 명사로 바꾸는 흔한 꼬리다.
- **수정:** bright(밝은)+-ness.
- **이유:** 같은 정보·뜻·예문 반복

### 42:7:6 · mummy (1)

- **뜻:** ① 미라
- **예문:** We saw a real {{BLANK}} at the museum.
- **원문:** 건조나 방부 처리 등으로 보존된 시신. 이집트 미라는 천으로 감싼 모습이 유명하다. 복수는 mummies.
- **수정:** 건조나 방부 처리 등으로 보존된 시신. 복수는 mummies.
- **이유:** 단어 학습 기여가 낮은 곁말

### 42:7:10 · windy (1)

- **뜻:** ① 바람이 센
- **예문:** It was too {{BLANK}} to ride our bikes.
- **원문:** wind(바람)+-y. 날씨는 It를 주어로 쓴다. [윈디]로 읽는다.
- **수정:** wind(바람)+-y. 날씨는 It를 주어로 쓴다.
- **이유:** 단순 발음·강세 중복

### 43:1:5 · quota (1)

- **뜻:** ① 할당량, 몫
- **예문:** I finished my daily {{BLANK}} of math problems.
- **원문:** meet[fill] a quota(할당량을 채우다)가 짝. [쿼우터]로 읽는다.
- **수정:** meet[fill] a quota(할당량을 채우다).
- **이유:** 단순 발음·강세 중복

### 43:1:6 · residue (1)

- **뜻:** ① 잔여물, 찌꺼기
- **예문:** There was soap {{BLANK}} left in the cup.
- **원문:** leave a residue(찌꺼기를 남기다). 과학·요리 글에 자주 나온다.
- **수정:** leave a residue(찌꺼기를 남기다).
- **이유:** 학습 지시·군더더기 표현

### 43:1:7 · watershed (1)

- **뜻:** ① 분수령, 전환점
- **예문:** That win was a {{BLANK}} for our team.
- **원문:** a watershed moment(중대한 전환점)가 짝. 물길이 양쪽으로 갈리는 산등성이에서 온 비유다.
- **수정:** a watershed moment(중대한 전환점). 물길이 양쪽으로 갈리는 산등성이에서 온 비유다.
- **이유:** 학습 지시·군더더기 표현

### 43:2:2 · hepatitis (1)

- **뜻:** ① 간염
- **예문:** He got a shot to guard against {{BLANK}}.
- **원문:** hepat-(간)+-itis(염증). [헤퍼타이티스] 강세는 ti에.
- **수정:** hepat-(간)+-itis(염증).
- **이유:** 단순 발음·강세 중복

### 43:3:0 · boast (1)

- **뜻:** ① 자랑하다, 뽐내다
- **예문:** He likes to {{BLANK}} about his game skills.
- **원문:** boast about[of]와 짝. 부정적 느낌이라 show off와 비슷.
- **수정:** boast about[of]. 부정적 느낌이라 show off와 비슷.
- **이유:** 학습 지시·군더더기 표현

### 43:3:7 · nuisance (1)

- **뜻:** ① 성가신 것, 골칫거리
- **예문:** My younger brother is such a {{BLANK}} at night.
- **원문:** [누선스]. What a nuisance!(참 성가시네!) 사람에게도 쓴다.
- **수정:** What a nuisance!(참 성가시네!) 사람에게도 쓴다.
- **이유:** 단순 발음·강세 중복

### 43:4:4 · swimmer (1)

- **뜻:** ① 수영하는 사람, 수영 선수
- **예문:** She is the fastest {{BLANK}} on our team.
- **원문:** swim+m+er. m을 겹쳐 쓴다. 철자에 주의한다.
- **수정:** swim+m+er. m을 겹쳐 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 43:6:0 · motorway (1)

- **뜻:** ① (영) 고속도로
- **예문:** We drove north on the {{BLANK}} all morning.
- **원문:** (영) 영국말. 미국에서는 freeway·expressway를 쓴다.
- **수정:** 영국말. 미국에서는 freeway·expressway를 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 43:7:2 · biscuit (1)

- **뜻:** ① (영) 비스킷, 과자
- **예문:** She ate two chocolate {{BLANK}}s with her tea.
- **원문:** (영) 영국의 biscuit은 미국의 cookie를 가리킨다.
- **수정:** 영국의 biscuit은 미국의 cookie를 가리킨다.
- **이유:** 같은 정보·뜻·예문 반복

### 43:7:3 · biscuit (2)

- **뜻:** ② (미) 비스킷(부드러운 빵)
- **예문:** We had warm {{BLANK}}s and soup for lunch.
- **원문:** (미) 미국의 biscuit은 단맛 없는 부드러운 빵이다.
- **수정:** 미국의 biscuit은 단맛 없는 부드러운 빵이다.
- **이유:** 같은 정보·뜻·예문 반복

### 43:8:0 · daft (1)

- **뜻:** ① (영) 어리석은, 멍청한
- **예문:** Don't be {{BLANK}}; just ask the teacher.
- **원문:** (영) informal. 영국 구어. 미국에서는 silly·dumb를 쓴다.
- **수정:** 영국 구어. 미국에서는 silly·dumb를 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 43:9:7 · embarrass (1)

- **뜻:** ① 창피하게 하다, 당황하게 하다
- **예문:** Don't {{BLANK}} me in front of my friends.
- **원문:** r 둘, s 둘. 철자 주의. '내가 창피하다'는 be embarrassed.
- **수정:** r 둘, s 둘. '내가 창피하다'는 be embarrassed.
- **이유:** 학습 지시·군더더기 표현

### 43:10:3 · seeker (1)

- **뜻:** ① 찾는 사람, 추구자
- **예문:** The room was full of young job {{BLANK}}s.
- **원문:** seek(찾다)+-er. job seeker(구직자)처럼 앞말과 짝을 이룬다.
- **수정:** seek(찾다)+-er. job seeker(구직자).
- **이유:** 학습 지시·군더더기 표현

### 44:1:1 · soar (2)

- **뜻:** ② 날아오르다, 솟구치다
- **예문:** We watched an eagle {{BLANK}} over the hill.
- **원문:** 새·비행기가 높이 떠오르다. watch+목적어+원형 구조에 주의.
- **수정:** 새·비행기가 높이 떠오르다.
- **이유:** 단어 학습 기여가 낮은 곁말

### 44:1:8 · designate (1)

- **뜻:** ① 지정하다
- **예문:** They {{BLANK}}d this room as a study area.
- **원문:** designate A as B(A를 B로 지정하다) 짝을 함께 외운다.
- **수정:** designate A as B(A를 B로 지정하다).
- **이유:** 학습 지시·군더더기 표현

### 44:3:0 · grammatical (1)

- **뜻:** ① 문법의
- **예문:** Our teacher wrote three {{BLANK}} rules on the board.
- **원문:** grammar의 형용사인데 t가 들어간다. 철자에 주의한다.
- **수정:** grammar의 형용사인데 t가 들어간다.
- **이유:** 학습 지시·군더더기 표현

### 44:3:8 · lunchtime (1)

- **뜻:** ① 점심시간
- **예문:** School {{BLANK}} is only forty minutes long.
- **원문:** lunch+time. 전치사는 at을 써서 at lunchtime으로 쓴다.
- **수정:** lunch+time. at lunchtime으로 쓴다.
- **이유:** 같은 정보·뜻·예문 반복

### 44:6:7 · converge (1)

- **뜻:** ① 모여들다, 한데 모이다
- **예문:** Fans {{BLANK}}d on the stage after the show.
- **원문:** con(함께)+verge(향하다). converge on(~로 모여들다) 짝이다.
- **수정:** con(함께)+verge(향하다). converge on(~로 모여들다).
- **이유:** 학습 지시·군더더기 표현

### 44:8:0 · amaze (1)

- **뜻:** ① (감탄할 만큼) 깜짝 놀라게 하다
- **예문:** Her singing will {{BLANK}} the whole school.
- **원문:** be amazed at/by(~에 놀라다) 짝. 감탄에 가까운 놀람이다.
- **수정:** be amazed at/by(~에 놀라다). 감탄에 가까운 놀람이다.
- **이유:** 학습 지시·군더더기 표현

### 44:8:1 · deprive (1)

- **뜻:** ① 박탈하다, 빼앗다
- **예문:** Games {{BLANK}} me of sleep every night.
- **원문:** deprive A of B(A에게서 B를 빼앗다). of를 꼭 기억한다.
- **수정:** deprive A of B(A에게서 B를 빼앗다).
- **이유:** 같은 정보·뜻·예문 반복

### 45:4:7 · secrete (1)

- **뜻:** ① 분비하다
- **예문:** Your skin {{BLANK}}s oil when it's hot.
- **원문:** 몸에서 액체를 내보내다. 명사는 secretion. 강세가 뒤에 있다.
- **수정:** 명사는 secretion.
- **이유:** 단순 발음·강세 중복

### 45:4:12 · photocopy (2)

- **뜻:** ② (복사기로) 복사하다
- **예문:** I'll {{BLANK}} the map at the library.
- **원문:** 명사와 같은 꼴. copy와 뜻이 같지만 '복사기로 뜬다'는 게 분명한 말. 강세는 pho-.
- **수정:** 명사와 같은 꼴. copy와 뜻이 같지만 '복사기로 뜬다'는 게 분명한 말.
- **이유:** 단순 발음·강세 중복

### 45:5:4 · confound (2)

- **뜻:** ② (예상을) 뒤엎다
- **예문:** The team {{BLANK}}ed all predictions and won the game.
- **원문:** confound expectations(예상을 뒤엎다)가 대표 연어다.
- **수정:** confound expectations(예상을 뒤엎다).
- **이유:** 학습 지시·군더더기 표현

### 45:7:6 · sixtieth (1)

- **뜻:** ① 예순 번째의, 60번째의
- **예문:** We celebrated my grandpa's {{BLANK}} birthday together.
- **원문:** sixty의 서수. 예순 번째 생일을 우리말로는 환갑이라고 한다.
- **수정:** sixty의 서수.
- **이유:** 단어 학습 기여가 낮은 곁말

### 46:8:10 · unless (1)

- **뜻:** ① ~하지 않으면, ~가 아닌 한
- **예문:** We'll be late {{BLANK}} we leave right now.
- **원문:** if~not(~하지 않으면)으로 기억하자. 보통 부정을 중복하지 않고, 미래 조건도 현재형.
- **수정:** if~not(~하지 않으면). 보통 부정을 중복하지 않고, 미래 조건도 현재형.
- **이유:** 학습 지시·군더더기 표현

### 47:1:5 · inactive (1)

- **뜻:** 활동하지 않는, 비활성의
- **예문:** The account is {{BLANK}} now.
- **원문:** in-(아닌)+active(활동하는). active와 inactive를 한 쌍으로 기억해.
- **수정:** in-(아닌)+active(활동하는).
- **이유:** 학습 지시·군더더기 표현

### 47:3:7 · postwar (1)

- **뜻:** 전후의, 전쟁 이후의
- **예문:** The book examines {{BLANK}} society.
- **원문:** post-(이후)+war(전쟁). 문맥에서 어떤 전쟁 이후인지 확인해.
- **수정:** post-(이후)+war(전쟁).
- **이유:** 학습 지시·군더더기 표현

### 47:6:5 · adaptation (1)

- **뜻:** 적응, 적응 과정
- **예문:** The change requires {{BLANK}}.
- **원문:** adapt(적응하다)→adaptation(적응). 행동을 명사로 바꾸어 문장의 주제·대상으로 삼아.
- **수정:** adapt(적응하다)→adaptation(적응).
- **이유:** 학습 지시·군더더기 표현

### 47:6:6 · expansion (1)

- **뜻:** 확장, 팽창
- **예문:** The city plans further {{BLANK}}.
- **원문:** expand(확장하다)→expansion(확장). 철자와 발음이 함께 바뀌어.
- **수정:** expand(확장하다)→expansion(확장).
- **이유:** 학습 지시·군더더기 표현

### 47:6:7 · observation (1)

- **뜻:** 관찰
- **예문:** Careful {{BLANK}} can show small differences.
- **원문:** observe(관찰하다)→observation(관찰). 명사가 된 행동이 문장의 주어로 쓰였어.
- **수정:** observe(관찰하다)→observation(관찰).
- **이유:** 학습 지시·군더더기 표현

### 47:7:6 · capitalism (1)

- **뜻:** 자본주의
- **예문:** The article discusses modern {{BLANK}}.
- **원문:** capital(자본)+-ism(체계). 단어의 구체적 경제적 뜻은 접미사만으로 결정되지 않아.
- **수정:** capital(자본)+-ism(체계).
- **이유:** 학습 지시·군더더기 표현

### 47:8:4 · accessible (1)

- **뜻:** 접근하거나 이용할 수 있는
- **예문:** The information is {{BLANK}} to everyone.
- **원문:** access(접근)+-ible로 연결해 기억해. accessible to로 이용 가능한 대상을 이어.
- **수정:** access(접근)+-ible. accessible to로 이용 가능한 대상을 이어.
- **이유:** 학습 지시·군더더기 표현

### 47:9:1 · protective (1)

- **뜻:** 보호하는, 보호용의
- **예문:** Workers must wear {{BLANK}} clothing.
- **원문:** protect(보호하다)+-ive. 옷이 보호하는 기능을 한다는 뜻이야.
- **수정:** protect(보호하다)+-ive.
- **이유:** 같은 정보·뜻·예문 반복

### 47:10:2 · simplify (1)

- **뜻:** 단순하게 하다, 간소화하다
- **예문:** The diagram can {{BLANK}} the explanation.
- **원문:** simple(단순한)→simplify(단순하게 하다). 철자가 바뀌는 어형을 함께 익혀.
- **수정:** simple(단순한)→simplify(단순하게 하다).
- **이유:** 학습 지시·군더더기 표현

### 48:1:1 · reduce (1)

- **뜻:** 줄이다, 감소시키다
- **예문:** We must {{BLANK}} the time we spend online.
- **원문:** reducere는 본래 도로 이끌다. 현대의 ‘줄이다’는 별도로 익혀.
- **수정:** reducere는 본래 도로 이끌다. 현대 뜻은 ‘줄이다’.
- **이유:** 학습 지시·군더더기 표현

### 48:2:3 · permit (1)

- **뜻:** 허락하다, 허용하다
- **예문:** We do not {{BLANK}} smoking in this room.
- **원문:** permit 뒤에는 명사나 -ing가 올 수 있어. permit someone to do도 익혀.
- **수정:** permit+명사/-ing. permit someone to do도 가능해.
- **이유:** 학습 지시·군더더기 표현

### 48:6:1 · extract (1)

- **뜻:** 추출하다, 뽑아내다
- **예문:** We can {{BLANK}} oil from these seeds.
- **원문:** ex-는 밖으로, tract-는 끌다 계열. extract A from B로 익혀.
- **수정:** ex-는 밖으로, tract-는 끌다 계열. extract A from B.
- **이유:** 학습 지시·군더더기 표현

### 48:7:0 · proceed (1)

- **뜻:** 진행하다, 계속하다
- **예문:** We cannot {{BLANK}} until everyone is ready.
- **원문:** proceed는 앞으로 나아가 진행하다. proceed with a plan도 함께 익혀.
- **수정:** proceed는 앞으로 나아가 진행하다. proceed with a plan.
- **이유:** 학습 지시·군더더기 표현

### 48:10:2 · telephone (1)

- **뜻:** 전화기, 전화
- **예문:** The {{BLANK}} lets us speak across long distances.
- **원문:** tele-(멀리)와 phon-(소리). 전화라는 완성 단어로 익혀.
- **수정:** tele-(멀리)와 phon-(소리).
- **이유:** 학습 지시·군더더기 표현

### 48:14:2 · democracy (1)

- **뜻:** 민주주의, 민주 정치
- **예문:** Free elections are an important part of {{BLANK}}.
- **원문:** demo-(민중)와 -cracy(통치). 제도의 뜻을 어근 두 개만으로 축소하지 않아.
- **수정:** demo-(민중)와 -cracy(통치).
- **이유:** 학습 지시·군더더기 표현

### 48:15:1 · bleed (1)

- **뜻:** 피를 흘리다, 출혈하다
- **예문:** A deep cut can {{BLANK}} heavily.
- **원문:** blood와 연결해 기억해. 과거·과거분사는 bled이고 /bled/로 읽어.
- **수정:** blood와 연결돼. 과거·과거분사는 bled이고 /bled/로 읽어.
- **이유:** 학습 지시·군더더기 표현

### 49:7:3 · as opposed to (1)

- **뜻:** ~와 달리, ~가 아니라
- **예문:** We need evidence {{BLANK}} guesses.
- **원문:** A as opposed to B는 B와 대비되는 A. 여기서는 guesses 대신 evidence가 필요해.
- **수정:** A as opposed to B는 B와 대비되는 A.
- **이유:** 같은 정보·뜻·예문 반복

### 49:9:1 · except for (1)

- **뜻:** ~을 제외하면
- **예문:** The room was empty {{BLANK}} one chair.
- **원문:** except for는 전체 진술에서 예외를 덜어내. 여기서는 의자 하나만 남아 있었어.
- **수정:** except for는 전체 진술에서 예외를 덜어내.
- **이유:** 같은 정보·뜻·예문 반복

### 49:9:2 · apart from (1)

- **뜻:** ~을 제외하고
- **예문:** Everyone understood {{BLANK}} one student.
- **원문:** apart from이 예외를 빼면 except for와 같은 뜻. 여기서는 한 학생만 이해하지 못했어.
- **수정:** apart from이 예외를 빼면 except for와 같은 뜻.
- **이유:** 같은 정보·뜻·예문 반복

### 50:2:0 · account for (1)

- **뜻:** ~의 이유를 설명하다
- **예문:** Can luck alone {{BLANK}} her success?
- **원문:** account의 설명 뜻을 떠올려. account for는 이유를 설명해.
- **수정:** 해설 삭제
- **이유:** 뜻·예문에 이미 있는 설명만 남음

### 50:2:10 · shed light on (1)

- **뜻:** 문제를 더 잘 이해하게 해 주다
- **예문:** New evidence may {{BLANK}} the cause.
- **원문:** evidence가 빛을 비추듯 문제를 밝혀 줘. explain과 연결해서 기억해.
- **수정:** evidence가 빛을 비추듯 문제를 밝혀 줘. explain과 연결돼.
- **이유:** 학습 지시·군더더기 표현

### 50:3:2 · account for (2)

- **뜻:** 비중을 차지하다
- **예문:** Online sales {{BLANK}} half our income.
- **원문:** 이번 account for는 비중이야. make up도 이 문장에서 같은 뜻이 돼.
- **수정:** make up도 이 문장에서 같은 뜻이 돼.
- **이유:** 같은 정보·뜻·예문 반복

### 50:5:3 · break down (1)

- **뜻:** 기능·체계가 무너지다
- **예문:** Without trust, talks can {{BLANK}} completely.
- **원문:** 기계뿐 아니라 협상·체계도 무너질 수 있어. fail과 연결해 기억해.
- **수정:** 기계뿐 아니라 협상·체계도 무너질 수 있어. fail과 연결돼.
- **이유:** 학습 지시·군더더기 표현


## 적용 검증

- 341개 수정이 검토 목록과 일치하고, 모든 카드의 해설 외 필드는 동일하다.
- 기존 어근·접사, 전치사·구동사, 독해 핵심 및 진도 이전 검사 3종을 통과했다.
- 로컬 미리보기의 내용 반영을 HTTP로 확인했다. UI와 어원 연구 자료도 유지됐다.
- Git 공백 오류 검사를 통과했다.
- 수정 전 원본과 미리보기는 work/explanation-audit-20260927/before 및 before-ui-lab에 보관했다.
