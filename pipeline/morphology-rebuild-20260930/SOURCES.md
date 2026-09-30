# 어원 과정 재구성: 출처와 선정 기준

조사 시작: 2026-09-30. 구현·검수 완료: 2026-10-01 KST. 사용자 승인 후 327카드로 원본·HTML에 반영했다. 아직 커밋·공개 배포하지 않았다. [구현 결과](REPORT.md)를 참고한다.

## 실제로 확인한 학습서 자료

| 자료 | 확인한 범위 | 이번 구성에 반영한 점 |
| --- | --- | --- |
| [능률VOCA 어원편 고등, NE능률 공식 교재 페이지](https://www.nebooks.co.kr/pages/book/view.asp?c=BD01000023) | 공식 목차 전체와 교재 소개. 책 본문 전체를 읽은 것은 아니다. | 접두사·어근·접미사의 범주를 누락 점검에 사용했다. 방향, 수량, 듣기·말하기, 생명·시간 등의 빠진 계열을 확인했다. |
| [English Vocabulary Elements, 3판, Oxford University Press](https://academic.oup.com/book/45407) | 공식 목차·소개. 유료 본문과 부록의 전체 목록은 열람하지 않았다. | 형태 변화, 숫자 요소, 의미 변화, 라틴어·그리스어 접사를 별개로 다루는 구성에서 검수 관점을 가져왔다. 옛 뜻을 현대 뜻과 동일시하지 않는다. |
| [Word Roots Level 1, The Critical Thinking Co.](https://www.criticalthinking.com/word-roots-level-1-ebook.html) / [공개 단어 요소·어휘 목록과 견본](https://images.salsify.com/image/upload/s--VBSqEUut--/79489338fcb640f6871d16ad52570126355fc976.pdf) | 출판사 소개의 검색 결과와 공개 6쪽 자료의 텍스트. 상품 페이지 직접 열기는 403이었으며, 공개 자료는 열람했다. | 접사·어근·완성된 단어를 연결하는 방식과 라틴계 누락 확인에 사용했다. 원서의 연습 문제·예문은 복사하지 않았다. |
| [Merriam-Webster's Vocabulary Builder, 출판사 제공 전자책 소개](https://play.google.com/store/books/details/Merriam_Webster_s_Vocabulary_Builder?hl=en_US&id=cyD059eY2RYC) | 공개 소개만 확인. 전체 어근 목록을 읽었다고 주장하지 않는다. | 어근 가족과 파생어를 묶는 접근의 보조 참고. 이번 개별 단어 선정의 단독 근거로 삼지 않았다. |

특정 교재의 단어 선정·배열을 재현하지 않았다. 기존 FABLE 풀과 대조해 자체적인 대비·의미 묶음을 구성했다. 아래 선택은 독해 수업에 대한 편집 판단이며, 빈도 코퍼스의 정량 순위나 학습 효과 실측 결과는 아니다.

## 선정 기준

1. 다른 단어에서도 다시 알아볼 수 있는 어근·접사를 우선한다.
2. 기존 단어가 있으면 새로운 어려운 단어보다 그 단어를 다시 연결한다.
3. micro/macro, inter/intra처럼 대응이 분명한 연결을 보완한다. 관련 접사의 두 예시가 반드시 반의어인 것은 아니다.
4. 뜻 변화나 형태 변화가 중요한 경우, 그것 자체를 학습 내용으로 삼는다. 어원을 뜻 맞히기 공식으로 취급하지 않는다.
5. 같은 표제어를 어원 목적으로 재학습하는 것은 허용하되, 단순한 파생형만으로 분량을 늘리지 않는다.
6. 추상적인 독해 어휘로 연결되는 계열과 눈으로 이해하기 쉬운 숫자·공간 계열을 함께 둔다.
7. 구성안의 기존 단어 참조는 해당 표제어의 여러 뜻을 모두 기록했다. 카드 제작 때는 뜻을 직접 골라야 한다.

## 대조 결과

확장 전 원본에는 71개 개념 단위·167카드가 있었다. 47세트 71카드, 48세트 96카드였다. 48세트는 라틴계 22단위, 그리스계 16단위, 영어계 5단위였다. 현재는 총 128단위·327카드다.

| 현재 빈틈 | 보강 방식 |
| --- | --- |
| micro-는 있으나 macro- 예시가 없음 | microscopic ↔ macroscopic, microeconomics ↔ macroeconomics 연결 |
| 숫자 계열이 별도 과정에 없음 | 수량 → 도형 → 달 이름 → 십·백·천 → 절반·단위로 연결 |
| 부정 접사 표제에는 il-가 있으나 해당 카드가 없음 | 이미 있는 illegal을 어원 복습으로 추가 |
| 일부 핵심 라틴계가 없음 | 움직임, 닫힘, 앎, 선택·읽기, 듣기·부르기, 가치, 생명, 시간 등을 기존 단어 중심으로 보충 |
| 그리스계가 과학 분야 이름 소개에 치우침 | 크기·성질·수량의 대비와 라틴계 물·시간·생명 표현을 연결 |
| 어원 원문·경로가 데이터에는 있지만 실제 카드 c에서 연결이 안 보이는 경우 | 짧은 어근 연결을 해설에 복원. 게임 화면에 별도 선행 설명을 늘리지 않음 |

전체 HTML에서 `MORPHOLOGY`는 자료 선언으로 존재하고, 학습 카드 해설은 DATA의 `c`를 사용한다. 원형 자료를 저장하기만 해서는 학습 화면에서 그 관계가 전달되지 않으므로, 이번 추가 160카드의 `c`에 어원 연결을 넣고 기존 33카드의 해설도 보완했다.

## 대표 어원의 확인

`curriculum.json`의 각 추가 단위에는 `representativeSource`가 있다. 61개 보강 행의 대표 자료를 열람해 어근과 의미 연결을 확인했다. 이후 추가 160카드의 예문·번역·뜻·해설을 작성·재독하고, 신규 37단어는 Collins 개별 사전 항목의 미국식 발음을 확인했다. 기존 표제어 123개는 뜻·품사를 골라 기존 IPA를 연결했다. 선택한 원본 위치와 신규 발음 출처는 `findings.json`의 `addedCardProvenance`에 남겼다. 기존 71단위의 출처도 원본에서 유지한다. 모든 어근의 더 먼 기원까지 완벽히 규명했다는 뜻은 아니다.

특히 다음 항목을 별도로 대조했다.

| 항목 | 확인한 사실 / 반영할 한계 | 근거 |
| --- | --- | --- |
| micro / macro | 작은 규모와 큰 규모. macroscopic은 육안으로 보이는 크기의 뜻으로 microscopic과 연결된다. | [macroscopic](https://www.etymonline.com/word/macroscopic), [microeconomics](https://www.etymonline.com/word/microeconomics), [macroeconomics](https://www.etymonline.com/word/macroeconomics) |
| 그리스어 원문 | μακρός(makros)는 긴·큰. 원문 전사는 현대 영어 발음이 아니다. | [LSJ μακρός](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionaries.v1%3Alsj-n64703/) |
| homo / hetero | 같은 종류 / 다른 종류의 대비. Latin homo(사람)와 Greek homo-(같은)를 섞지 않는다. | [homogeneous](https://www.etymonline.com/word/homogeneous), [heterogeneous](https://www.etymonline.com/word/heterogeneous), [LSJ ἕτερος](https://atlas.perseus.tufts.edu/dictionaries/entry/urn%3Acite2%3Ascaife-viewer%3Adictionaries.v1%3Alsj-n43206/) |
| inter / intra | 세포 사이 / 세포 안. 기존 intracellular와 새 intercellular를 같은 주제에서 비교한다. | [Collins intercellular](https://www.collinsdictionary.com/us/dictionary/english/intercellular), [Cambridge intercellular](https://dictionary.cambridge.org/us/dictionary/english/intercellular) |
| hyper / hypo | 위·과도함 / 아래·부족함. hyperactive와 hypothermia는 접사 대비용이며 두 단어 전체가 반의어인 것은 아니다. | [hyperactive](https://www.etymonline.com/word/hyperactive), [hypothermia](https://www.etymonline.com/word/hypothermia) |
| monopoly | mono-는 하나. 뒤의 -poly는 여기서 ‘많은’ poly-가 아니라 ‘팔다’ 계열이다. | [monopoly](https://www.etymonline.com/word/monopoly) |
| dialogue / diameter | dia-는 사이·가로질러. 숫자 2를 나타내는 di-와 구분한다. | [dialogue](https://www.etymonline.com/word/dialogue), [diameter](https://www.etymonline.com/word/diameter) |
| 9~12월 이름 속 7·8·9·10 | septem·octo·novem·decem은 라틴어 7·8·9·10. 옛 3월 시작 순서와 연결한다. 황제가 달을 추가했다는 이야기는 쓰지 않는다. | [British Museum](https://www.britishmuseum.org/blog/whats-name-months-year) |
| 10 / 100 / 1000 | decade는 Greek deka, decimal은 Latin decem, millennium은 mille+annus 계열이다. | [decade](https://www.etymonline.com/word/decade), [millennium](https://www.etymonline.com/word/millennium) |
| SI 배수 | centi=1/100, milli=1/1000, micro=1/1,000,000, kilo=1000. Latin centum=100·mille=1000과 현재 단위 배수를 구분한다. | [BIPM SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes) |
| evolve / involve | volvere(말다·돌리다) 계열의 연결. 현대의 ‘진화·발전’과 ‘포함·관련’을 각각 문맥에서 익힌다. 생물의 진화를 무조건 더 우수해짐으로 설명하지 않는다. | [evolve](https://www.etymonline.com/word/evolve), [involve](https://www.etymonline.com/word/involve) |
| manufacture | 역사적으로 손으로 만드는 것에서 이어졌지만 현대에는 기계 제조도 포함한다. | [manufacture](https://www.etymonline.com/word/manufacture) |
| gene / genetics | 근대 과학에서 형성된 용어. 그리스어 원형을 오늘날 유전자 개념과 그대로 동일시하지 않는다. | [gene](https://www.etymonline.com/word/gene) |
| -nom- / nomin- | 그리스계 규칙·관리와 라틴계 이름을 같은 어근으로 묶지 않는다. 이번에는 economy·astronomy·autonomy 연결에 한정한다. | [economy](https://www.etymonline.com/word/economy), 기존 `gr-auto` 자료 |

출처를 읽다가 불확실한 원시 인도유럽어 재구나 논쟁적인 더 먼 기원이 나오면, 학생용 해설에는 확실한 직접 어원까지만 쓴다. 확정하지 못한 경로는 출처와 함께 불확실성으로 남긴다.

## 카드 제작 규칙

- 먼저 현대 뜻과 자연스러운 짧은 예문을 정한다. 어원 퍼즐을 풀어야만 답이 나오는 문장을 만들지 않는다.
- 해설은 보통 `어근(뜻) + 핵심 연결` 한두 문장. 용법 차이·완전 대체어는 실제로 필요한 경우에만 추가한다.
- 그리스 원형·전사는 대표 카드 해설에 짧게 넣고, 상세 차용 경로는 원본 메타데이터에 둔다.
- 영어 단어 IPA는 기존 발음 데이터로 관리한다. 정적 IPA 설명칸을 다시 만들지 않는다. 원문 전사와 영어 IPA를 혼동하지 않는다.
- 같은 어근의 현대 영어 발음은 단어에 따라 변할 수 있다. 고립된 모든 어근에 고정 IPA가 있다고 가정하지 않는다.
- 철자 변형의 정답 정책을 보존한다. 동의어를 정답으로 추가하지 않는다.
- 동일 표제어·어근 관계·대비쌍이 잘리지 않게 연습 경계를 잡는다. 카드 수는 10~12 중심이며 의미 있는 묶음은 8~15까지 허용한다.

이번 문서와 구성표는 공개 게임을 바꾸지 않는다. 사용자 확인 후 별도 구현에서 원본·기록 키·보존 원장·관련 검사를 함께 갱신한다.
