# 주제별 연습 경계 조정 · 2026-09-27

상태: 2026-09-27 배포 변경에 포함. 배포 범위는 [DEPLOYMENT.md](../../DEPLOYMENT.md)에 기록한다.

기본은 10~12카드 안팎이지만, 분량보다 의미 있는 경계를 우선할 수 있다. 520개 원본 묶음의 분할 구성을 검토해 0세트의 6개 묶음, 13개 연습을 조정했다. 전체 612개 연습은 유지했고, March와 May의 달 의미를 반복 학습용으로 보충해 6,859 → 6,861카드가 됐다. 기존 3·5세트의 다의어 학습은 유지한다.

요일·월의 열거 순서는 목록 편집 순서다. 실제 출제는 기존 무작위 방식이며, 동일 표제어를 나누지 않는 규칙도 유지한다.

## 조정 결과

### 0세트 Exercise 1

0~10과 11~19의 경계에서 나누어 nine과 ten이 뒤 연습으로 밀리지 않게 한다.

- Exercise 1-1 · 수사 · 0~10: 13카드 — zero, one, one, one, two, three, four, five, six, seven, eight, nine, ten
- Exercise 1-2 · 수사 · 11~19: 9카드 — eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen

### 0세트 Exercise 3

요일 7개와 월 12개를 각각 완결한다. March와 May는 기존의 다의어 학습을 유지하면서 달의 뜻만 다시 다룬다.

- Exercise 3-1 · 요일: 7카드 — Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Exercise 3-2 · 월 · 1~12월: 12카드 — January, February, March, April, May, June, July, August, September, October, November, December

### 0세트 Exercise 5

teacher를 직업·역할 묶음의 첫 단어로 둔다.

- Exercise 5-1 · 사람·가족·관계: 10카드 — I, everybody, somebody, nobody, dad, cousin, grandparent, boyfriend, girlfriend, teenager
- Exercise 5-2 · 직업·역할: 11카드 — teacher, policeman, driver, worker, visitor, player, singer, dancer, artist, writer, reader

### 0세트 Exercise 6

spelling, reading, writing, dialogue를 한 묶음에 두고 과목·관심·진로에서 나눈다.

- Exercise 6-1 · 수업·읽기·쓰기: 14카드 — classroom, exam, project, topic, paragraph, section, statement, note, note, chart, spelling, reading, writing, dialogue
- Exercise 6-2 · 과목·관심·진로: 7카드 — geography, culture, interview, interview, career, hobby, routine

### 0세트 Exercise 7

음식 목록이 중간에 끊기지 않게 음식·외출을 15카드로 유지한다.

- Exercise 7-1 · 집·옷·소지품: 10카드 — apartment, bathroom, bedroom, toilet, shower, shower, downstairs, umbrella, jacket, sweater
- Exercise 7-2 · 음식·외출: 15카드 — lunch, sandwich, salad, carrot, tomato, diet, diet, menu, midnight, vacation, passport, euro, museum, supermarket, festival
- Exercise 7-3 · 미디어·취미: 12카드 — photo, video, text, text, text, blog, TV, CD, DVD, swimming, cooking, dancing

### 0세트 Exercise 8

negative와 positive가 서로 다른 연습으로 갈라지지 않게 한다.

- Exercise 8-1 · 감정·상태: 12카드 — amazing, fantastic, wonderful, delicious, boring, bored, interested, tired, married, natural, natural, natural
- Exercise 8-2 · 성질·행동: 15카드 — negative, positive, positive, extra, final, final, final, blonde, angrily, create, design, design, discuss, prefer, relax

## 유지한 구성

- 일반 1~45세트: 빈도순 학습과 여러 뜻의 회상을 위한 짧은 구성을 유지한다. 모든 단어를 의미 범주별로 다시 모으지는 않는다.
- 46세트: 여러 의미를 다시 구별하는 단계별 복습이다. 단순한 자동 분할의 결과가 아니므로 유지한다.
- 47~50세트: 어근·접사 및 전치사·구동사 묶음이 현재 분할에서 끊기지 않아 유지한다.

비슷한 의미의 새 단어를 한꺼번에 처음 배우면 간섭이 생길 수 있다는 [Tinkham의 연구](https://journals.sagepub.com/doi/10.1191/026765897672376469)를 참고했다. 이번 요일·월 묶음은 고등학생의 기초 재확인과 빠진 달의 보충이라는 앱 맥락에 맞춘 편집 판단이며, 모든 학습자에게 주제별 묶음이 우월하다는 뜻은 아니다.

## 기록과 검증

기존 완료 기록은 실제로 포함했던 카드에 한해 인정한다. 새 월 연습에는 March·May가 추가되어 예전 17카드 전체 완료 기록만으로 자동 완료 처리하지 않는다. 기존 이어하기는 겹치는 단어가 있는 새 연습으로 연결한다.

- 기존 카드 내용·순서 보존 및 원래 March/march·may/May 그룹 유지 확인.
- 새 경계의 이전 완료 기록 64가지 조합과 이어하기 13개 위치 검증.
- 기존 진도·내용 검사 3종 통과.
- 재조립 시 내용이 달라지지 않는지 확인.
- 미리보기 DATA와 실제 원본 일치, 연보라 시간바와 그 밖 UI 유지.
- 브라우저에서 요일 7개·월 12개 및 0세트 목록 확인.

## 편집 위치

pipeline/exercise-topics.json에 명시한 경계와 참조 카드만 적용한다. pipeline/assemble.py로 생성하며, 기본 어휘 원본은 그대로 보관한다. 원복 자료는 work/topic-exercises-20260927/before 및 preview-build-before.cjs에 있다.
