# Codex 리뷰 · 2026-10-13

**검토 범위: `acfe20e` → `921e8ff`. 리뷰 결과만 저장했으며 앱·어휘 데이터는 수정하지 않았다.**

학생 기록 이관에서 오류를 재현하지 못했다. 카드 수정 권고는 **23건: 오류 11건, 보완 11건, 제안 1건**이다. 원칙 문구 확인이 필요한 제안 1건은 별도로 분리했다. 최종 반영 기준은 [review.json](review.json)의 `proposed`다. 초기 분담 초안보다 읽기량과 어휘 순서에 맞게 줄인 안을 담았다.

## 먼저 고칠 부분

- **life②:** 정답을 넣으면 `A cat has nine lifes.`가 실제 화면에 나온다. 해설의 `lives`와 모순된다. 표제어 `life`를 쓰는 단수 예문으로 고치는 것이 가장 작은 수정이다.
- **of②·very①:** `some of 뒤는 복수`, `very는 원급만`이라는 단정이 잘못됐다. `some of the water`, `the very best`를 배제하면 안 된다.
- **loving·surgery:** 영어를 고양이로 바꾼 뒤 한국어는 강아지·개로 남았다.
- **prime②:** 소수의 정의에 `1보다 큰 자연수` 조건이 필요하다.
- **tax·anxious②:** 영국 의회 대표권 부재를 일반 투표권 부재로 번역했고, ‘간절히 원하는’ anxious에 걱정을 필수 조건으로 붙였다.

우선순위 P2는 다음 내용 수정에서 우선 반영할 항목, P3는 낮은 우선순위다. ‘보완’은 현재 문장 전체가 틀렸다는 뜻이 아니다. ‘제안’은 선택 사항이다. 게임 정답은 표제어만 인정하는 기존 방식을 유지한다.

## 카드별 수정 권고

### C00-01 · 1세트 life 2 · 오류 / P2

**life를 맞히면 예문에 잘못된 복수 lifes가 표시된다**

[원본 pipeline/out/lesson01.json](../../pipeline/out/lesson01.json#L978) · `["1세트","Exercise 4 · 31~40","life",2,""]`

새 예문은 A cat has nine {{BLANK}}s.이다. FABLE fillBlank는 표제어 life를 그대로 넣으며 life→lives 변환을 하지 않는다. 결과는 A cat has nine lifes.이다. 같은 카드 해설의 복수는 lives와 충돌한다. root가 실제 렌더러 경로도 확인했다.

**수정안** (적지 않은 칸은 유지):

- `ex`: A cat has more than one {{BLANK}}.
- `tr`: 고양이는 목숨이 하나가 아니래.
- `c`: 속담은 A cat has nine lives. 복수는 lives.

수정 후 계산 읽기량 9.34초 / 한도 12초, 해설 36자. 실측 독서 시간은 아니다.

### C00-02 · 5세트 of 2 · 오류 / P2

**some of 뒤에도 반드시 복수가 와야 한다고 가르친다**

[원본 pipeline/out/set05.json](../../pipeline/out/set05.json#L147) · `["5세트","Exercise 1 · 401~410","of",2,""]`

새 해설은 one of와 some of를 한데 묶어 뒤는 복수라고 단정한다. one of my friends는 맞지만 some of the water/money처럼 불가산명사도 올 수 있다. 현재 예문의 friends가 복수인 사실을 전체 규칙으로 일반화했다.

**수정안** (적지 않은 칸은 유지):

- `c`: one of 뒤엔 복수: one of my friends. some of the water처럼 불가산명사도 쓴다.

수정 후 계산 읽기량 10.41초 / 한도 13초, 해설 63자. 실측 독서 시간은 아니다.

근거: [dictionary.cambridge.org](https://dictionary.cambridge.org/grammar/british-grammar/some) · [dictionary.cambridge.org](https://dictionary.cambridge.org/grammar/british-grammar/determiners-and-singular-countable-nouns)

### C00-03 · 5세트 very 1 · 오류 / P2

**해설을 줄이며 very의 최상급 강조를 틀린 규칙으로 바꿨다**

[원본 pipeline/out/set05.json](../../pipeline/out/set05.json#L1690) · `["fable-pool-20260927-set5-ex7","Exercise 7 · 461~470","very",1,""]`

기존 해설은 일부 최상급의 very best를 인정했는데, 현재는 very는 원급만 꾸민다고 바뀌었다. the very best/worst/oldest 등의 최상급 강조는 표준 용법이다. very easier가 틀린다는 사실만 남기면 충분하다.

**수정안** (적지 않은 칸은 유지):

- `c`: 비교급엔 very 대신 much: much easier. 최상급은 the very best처럼 강조할 수 있다.

수정 후 계산 읽기량 9.39초 / 한도 12초, 해설 62자. 실측 독서 시간은 아니다.

근거: [dictionary.cambridge.org](https://dictionary.cambridge.org/dictionary/english/very) · [dictionary.cambridge.org](https://dictionary.cambridge.org/de/grammatik/britisch-grammatik/very)

### C00-04 · 6세트 tax 1 · 오류 / P2

**대표권 없는 과세를 일반 투표권 부재로 번역했다**

[원본 pipeline/out/set06.json](../../pipeline/out/set06.json#L579) · `["6세트","Exercise 3 · 521~530","tax",1,""]`

기존 예문은 자신들이 표결하지 못한 영국의 세금에 반대했다고 했으나 새 번역은 투표권도 없이 영국에 세금을 냈다고 한다. 식민지에는 자체 선출 의회가 있었고, 쟁점은 영국 의회에서의 대표권 없이 영국 의회가 부과한 세금이었다. without a vote만 남겨 영어도 그 범위가 덜 명확해졌다.

**수정안** (적지 않은 칸은 유지):

- `tr`: 1760년대 식민지인들은 영국 의회에 대표도 없이 세금을 냈어.

without a vote는 과세에 관한 대표권으로 읽을 수 있어 예문은 유지하고, 해석에서 영국 의회라는 범위를 명시한다. 옛 예문 복원은 어휘 순서·읽기량을 넘기므로 권하지 않는다.

수정 후 계산 읽기량 11.63초 / 한도 12초, 해설 48자. 실측 독서 시간은 아니다.

근거: [www.parliament.uk](https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/the-stamp-act-and-the-american-colonies-1763-67/)

### C16-01 · 18세트 quantity 1 · 오류 / P2

**quantity와 quality는 한 글자 차이가 아니다**

[원본 pipeline/out/set18.json](../../pipeline/out/set18.json#L1169) · `["18세트","Exercise 7 · 1761~1770","quantity",1,""]`

새 해설: “질은 quality. 철자가 한 글자 차이라 주의.” quantity의 nt와 quality의 l이 대응한다. 단순한 한 글자 교체·추가·삭제로 바뀌는 짝이 아니다.

**수정안** (적지 않은 칸은 유지):

- `c`: 질은 quality. 철자가 비슷하니 구별해.

수정 후 계산 읽기량 6.45초 / 한도 12초, 해설 25자. 실측 독서 시간은 아니다.

### C16-02 · 19세트 anxious 2 · 오류 / P2

**anxious의 eager 뜻에 걱정을 필수 조건으로 넣지 않는다**

[원본 pipeline/out/set19.json](../../pipeline/out/set19.json#L385) · `["19세트","Exercise 3 · 1821~1830","anxious",2,""]`

이전 “불안이 섞인 간절함일 수도 있어”가 “걱정이 섞인 간절함이라 신나서 기다리는 excited와 다르다”로 바뀌었다. 예문은 She is anxious to hear the news.

**수정안** (적지 않은 칸은 유지):

- `c`: be anxious to+동사: 간절히 ~하고 싶다. 걱정이 섞이는지는 문맥으로 구별한다.

수정 후 계산 읽기량 9.56초 / 한도 12초, 해설 50자. 실측 독서 시간은 아니다.

근거: [sense 3 및 Did you know? Can anxious Be Used as a Synonym for eager?](https://www.merriam-webster.com/dictionary/anxious)

### R33-45-01 · 34세트 loving 1 · 오류 / P2

**cat으로 바꾼 예문에 강아지 해석이 남음**

[원본 pipeline/out/set34.json](../../pipeline/out/set34.json#L581) · `["34세트","Exercise 4 · 3314~3323","loving",1,""]`

ex: She gave her cat a {{BLANK}} look. / tr: 걔는 자기 강아지를 애정 어린 눈으로 봤어.

**수정안** (적지 않은 칸은 유지):

- `tr`: 걔는 자기 고양이를 애정 어린 눈으로 봤어.

수정 후 계산 읽기량 10.22초 / 한도 12초, 해설 45자. 실측 독서 시간은 아니다.

### R33-45-02 · 35세트 surgery 1 · 오류 / P2

**cat으로 바꾼 예문에 개 해석이 남음**

[원본 pipeline/out/set35.json](../../pipeline/out/set35.json#L1613) · `["35세트","Exercise 11 · 사건과 위기","surgery",1,""]`

ex: Without {{BLANK}}, my cat would have died. / tr: 수술을 안 받았다면 우리 개는 죽었을 거야.

**수정안** (적지 않은 칸은 유지):

- `tr`: 수술을 안 받았다면 우리 고양이는 죽었을 거야.

수정 후 계산 읽기량 11.485초 / 한도 12초, 해설 47자. 실측 독서 시간은 아니다.

### R33-45-03 · 41세트 prime 2 · 오류 / P2

**소수 정의에 1보다 큰 자연수 조건 필요**

[원본 pipeline/out/set41.json](../../pipeline/out/set41.json#L1823) · `["41세트","Exercise 11 · 성질과 구조","prime",2,""]`

현재: 1과 자기 자신으로만 나뉘는 수가 prime number.

**수정안** (적지 않은 칸은 유지):

- `c`: 1보다 큰 자연수로, 양의 약수가 1과 자신뿐인 수.

수정 후 계산 읽기량 11.47초 / 한도 12초, 해설 29자. 실측 독서 시간은 아니다.

근거: [csrc.nist.gov](https://csrc.nist.gov/glossary/term/prime_number)

### R33-45-04 · 33세트 puzzle 1 · 보완 / P2

**수수께끼 뜻의 6칸 riddle도 안내하기**

[원본 pipeline/out/set33.json](../../pipeline/out/set33.json#L1188) · `["33세트","Exercise 8 · 3254~3263","puzzle",1,""]`

Who in the world am I? Ah, that's the great puzzle! → ...the great riddle!

**수정안** (적지 않은 칸은 유지):

- `c`: 캐럴 『이상한 나라의 앨리스』. 이 뜻에서는 riddle과 바꿔 쓸 수 있다.

수정 후 계산 읽기량 10.78초 / 한도 12초, 해설 43자. 실측 독서 시간은 아니다.

근거: [www.oxfordlearnersdictionaries.com](https://www.oxfordlearnersdictionaries.com/us/definition/english/riddle_1) · [www.gutenberg.org](https://www.gutenberg.org/ebooks/11)

### C00-05 · 0세트 September 1 · 오류 / P3

**합의했던 9월경을 9월로 줄이면서 영미권 학기 시작을 단정했다**

[원본 pipeline/out/lesson00.json](../../pipeline/out/lesson00.json#L612) · `["0세트","Exercise 3 · 요일·월 :: topics-v4 8-19","September",1,""]`

예문의 England usually starts in September는 문제없다. 해설만 영미권은 9월로 바뀌었다. 미국에는 8월 개학이 흔하고, 영신은 이전 대화에서 이를 포함하는 간결한 표현으로 9월경을 명시적으로 합의했다. 한 글자만 복구하면 정확성과 간결함을 동시에 유지할 수 있다.

**수정안** (적지 않은 칸은 유지):

- `c`: 영미권은 9월경, 한국은 3월경 새 학년을 시작해. 라틴어 septem=7(옛 로마력의 일곱째 달).

수정 후 계산 읽기량 11.16초 / 한도 12초, 해설 56자. 실측 독서 시간은 아니다.

근거: [www.lausd.org](https://www.lausd.org/apps/events/2026/8/12/43497513/?REC_ID=43497513&id=0)

### C16-07 · 32세트 behalf 1 · 오류 / P3

**on behalf 두 형태로만 쓴다는 단정을 피한다**

[원본 pipeline/out/set32.json](../../pipeline/out/set32.json#L1236) · `["32세트","Exercise 8 · 3154~3163","behalf",1,""]`

이전 “on behalf of ~ 또는 on one's behalf 꼴로 쓴다.”에 “만”이 추가되었다.

**수정안** (적지 않은 칸은 유지):

- `c`: on behalf of ~ 또는 on one's behalf 꼴로 쓴다.

수정 후 계산 읽기량 8.38초 / 한도 12초, 해설 40자. 실측 독서 시간은 아니다.

근거: [On Behalf of vs. in Behalf of: Usage Guide](https://www.merriam-webster.com/dictionary/behalf)

### C00-06 · 1세트 fourteenth 1 · 보완 / P3

**혁명의 상징적 날짜를 유일하고 정확한 시작일처럼 표현한다**

[원본 pipeline/out/set44.json](../../pipeline/out/set44.json#L245) · `["44세트","Exercise 2 · 4294~4303","fourteenth",1,""]`

1789년 7월 14일은 바스티유 습격의 정확한 날짜다. 프랑스 혁명의 시작은 삼부회·국민의회·테니스코트의 서약 등 그 이전 사건까지 포함해 서술하므로 began on July fourteenth라는 단정은 역사적 시기 구분을 숨긴다. 현재 문장을 완전히 틀렸다고 단정하는 것은 아니다. 정확한 날짜를 배우는 이 카드에는 이전의 확정 가능한 사건 서술이 더 적합하다.

**수정안** (적지 않은 칸은 유지):

- `ex`: The Bastille fell on July {{BLANK}}, 1789.
- `tr`: 1789년 7월 14일에 바스티유 감옥이 함락됐어.

수정 후 계산 읽기량 8.79초 / 한도 12초, 해설 36자. 실측 독서 시간은 아니다.

근거: [www.chateauversailles.fr](https://www.chateauversailles.fr/decouvrir/histoire/les-grandes-dates/versailles-au-coeur-revolution-francaise)

### C00-08 · 7세트 interesting 1 · 보완 / P3

**같은 11칸에 자연스럽게 들어가는 fascinating 안내가 없다**

[원본 pipeline/out/set07.json](../../pipeline/out/set07.json#L1682) · `["7세트","Exercise 8 · 671~680","interesting",1,""]`

Did you learn anything fascinating today?도 자연스럽고 재미있는·흥미로운 뜻과 11칸을 충족한다. fascinating은 매우 흥미롭다는 더 강한 표현이므로 모든 상황에서 완전히 같은 뜻이라고 쓰면 안 된다. 기존 more interesting 예문에서도 가능했던 경쟁어라 이번에 새로 생긴 회귀는 아니지만, 교체 후 문장 검수 범위에 포함해 남긴다.

**수정안** (적지 않은 칸은 유지):

- `c`: fascinating으로도 바꿔 쓸 수 있고 더 강한 흥미를 뜻해. 흥미를 주면 -ing, 느끼면 -ed.

기존 예문에도 있던 문제이며 이번 변경이 새로 만든 회귀는 아니다. 교체 예문 검토 중 함께 발견했다.

수정 후 계산 읽기량 9.64초 / 한도 12초, 해설 59자. 실측 독서 시간은 아니다.

근거: [www.oxfordlearnersdictionaries.com](https://www.oxfordlearnersdictionaries.com/us/definition/english/fascinating)

### C00-07 · 11세트 straight 1 · 보완 / P3

**배리 원문에 없는 별을 번역에서 보충했다**

[원본 pipeline/out/set11.json](../../pipeline/out/set11.json#L1246) · `["fable-pool-20260927-set11-ex8","Exercise 8 · 1071~1080","straight",1,""]`

원문 Second to the right, and straight on till morning에는 star가 없다. 4장 THE FLIGHT의 바로 뒤는 그 지시가 매우 불명확하며 피터가 생각나는 말을 했다고 설명한다. 현재 번역의 오른쪽 두 번째 별로는 원문이 지정하지 않은 대상을 특정한다. 네버랜드로 가는 길이라는 해설 자체는 맞다.

**수정안** (적지 않은 칸은 유지):

- `tr`: 오른쪽 두 번째로, 그리고 아침까지 곧장.

수정 후 계산 읽기량 7.2초 / 한도 12초, 해설 22자. 실측 독서 시간은 아니다.

근거: [www.gutenberg.org](https://www.gutenberg.org/ebooks/16)

### C16-03 · 18세트 insect 1 · 보완 / P3

**곤충의 몸 설명에 성충이라는 범위를 붙인다**

[원본 pipeline/out/set18.json](../../pipeline/out/set18.json#L841) · `["18세트","Exercise 5 · 1741~1750","insect",1,""]`

새 예문 All insects have six legs and three body parts. / 곤충은 모두 다리가 여섯 개고, 몸이 세 부분으로 나뉘어.

**수정안** (적지 않은 칸은 유지):

- `ex`: Adult {{BLANK}}s have six legs and three main body parts.
- `tr`: 다 자란 곤충은 다리가 여섯 개고, 몸이 크게 세 부분으로 나뉘어.

수정 후 계산 읽기량 6.57초 / 한도 12초, 해설 0자. 실측 독서 시간은 아니다.

근거: [Insect Structures; Insect Orders의 larvae 설명](https://content.ces.ncsu.edu/extension-gardener-handbook/4-insects) · [Maggots > Appearance](https://www.extension.umd.edu/resource/wireworms-and-maggots-vegetables)

### C16-04 · 19세트 cure 2 · 보완 / P3

**감기에 치료가 전혀 없다는 인상 대신 완치의 뜻을 드러낸다**

[원본 pipeline/out/set19.json](../../pipeline/out/set19.json#L537) · `["19세트","Exercise 4 · 1831~1840","cure",2,""]`

There is still no cure for the common cold.를 “감기는 아직도 치료법이 없어.”로 옮기고 c를 지웠다.

**수정안** (적지 않은 칸은 유지):

- `tr`: 감기를 완전히 낫게 하는 치료법은 아직 없어.

수정 후 계산 읽기량 5.0초 / 한도 12초, 해설 0자. 실측 독서 시간은 아니다.

근거: [Key points와 Treatment](https://www.cdc.gov/common-cold/treatment/index.html)

### C16-05 · 23세트 disease 1 · 보완 / P3

**disease와 illness의 차이를 전염 여부처럼 읽히지 않게 한다**

[원본 pipeline/out/set23.json](../../pipeline/out/set23.json#L735) · `["23세트","Exercise 4 · 2214~2223","disease",1,""]`

이전 해설의 heart disease 예와 “주로”가 사라져 “퍼지는 병은 disease, 앓는 상태는 illness.”만 남았다.

**수정안** (적지 않은 칸은 유지):

- `c`: 질병 자체는 disease, 앓는 상태는 illness.

수정 후 계산 읽기량 10.37초 / 한도 12초, 해설 31자. 실측 독서 시간은 아니다.

근거: [sense 1의 genetic disease 및 heart disease 예](https://www.merriam-webster.com/dictionary/disease)

### C16-06 · 26세트 tablespoon 1 · 보완 / P3

**3티스푼 관계의 미국 기준을 예문에 유지한다**

[원본 pipeline/out/set26.json](../../pipeline/out/set26.json#L1646) · `["26세트","Exercise 10 · 2574~2583","tablespoon",1,""]`

이전 c에는 “미국 기준으로 1 tablespoon은 3 teaspoons”가 있었으나 새 예문 One tablespoon is equal to three teaspoons.에는 지역 한정이 없다.

**수정안** (적지 않은 칸은 유지):

- `ex`: In the US, one {{BLANK}} is equal to three teaspoons.
- `tr`: 미국에서 1테이블스푼은 3티스푼이야.

수정 후 계산 읽기량 6.79초 / 한도 12초, 해설 19자. 실측 독서 시간은 아니다.

근거: [Teaspoon–Tablespoon–Cup Measurement Equivalents](https://healthyeating.nhlbi.nih.gov/measurements.aspx) · [Cooking tips, 인쇄 p.39](https://www.islhd.health.nsw.gov.au/sites/default/files/Health_Promotion/Cookbooks/Baby_Toddler_cookbook.pdf)

### R33-45-07 · 37세트 fatal 1 · 보완 / P3

**fatal은 영어 fate와 같은 어원이라고 쓰기**

[원본 pipeline/out/set37.json](../../pipeline/out/set37.json#L323) · `["37세트","Exercise 3 · 3604~3613","fatal",1,""]`

현재 c: fate(운명)에서 온 말. a fatal accident는 사망 사고.

**수정안** (적지 않은 칸은 유지):

- `c`: fate(운명)와 같은 어원. a fatal accident는 사망 사고.

수정 후 계산 읽기량 8.79초 / 한도 12초, 해설 41자. 실측 독서 시간은 아니다.

근거: [www.etymonline.com](https://www.etymonline.com/word/fatal) · [www.etymonline.com](https://www.etymonline.com/word/fate)

### R33-45-05 · 39세트 sharply 1 · 보완 / P3

**sharply와 quickly의 초점 차이를 짧게 유지하기**

[원본 pipeline/out/set39.json](../../pipeline/out/set39.json#L524) · `["39세트","Exercise 4 · 3814~3823","sharply",1,""]`

The temperature dropped more {{BLANK}} today than it did yesterday. / 현재 c: 이 뜻에서는 rapidly·quickly와 바꿔 쓸 수 있다.

**수정안** (적지 않은 칸은 유지):

- `c`: 바꿔 쓸 수 있지만 sharply는 급격한 변화, rapidly·quickly는 속도에 초점.

가능한 유의어를 오답 영어로 몰아가는 지적이 아니다. 정답 판정·예문은 유지하고 짧은 의미 차이만 복원하는 낮은 우선순위 보완.

수정 후 계산 읽기량 10.64초 / 한도 12초, 해설 52자. 실측 독서 시간은 아니다.

근거: [www.oxfordlearnersdictionaries.com](https://www.oxfordlearnersdictionaries.com/us/definition/english/sharply) · [dictionary.cambridge.org](https://dictionary.cambridge.org/dictionary/english/sharply)

### R33-45-06 · 42세트 scarcity 1 · 보완 / P3

**shortage를 기간보다 부족한 양으로 설명하기**

[원본 pipeline/out/set42.json](../../pipeline/out/set42.json#L1641) · `["42세트","Exercise 11 · 지식 어휘 Ⅳ","scarcity",1,""]`

현재 c: 형용사는 scarce. 한때 모자라는 것은 shortage.

**수정안** (적지 않은 칸은 유지):

- `c`: 형용사는 scarce. shortage는 필요한 양보다 모자란 상태.

경제학 예문 자체는 적절하다. 일반어 해설의 범위를 좁게 읽게 하는 표현만 고치는 보완.

수정 후 계산 읽기량 10.53초 / 한도 12초, 해설 38자. 실측 독서 시간은 아니다.

근거: [dictionary.cambridge.org](https://dictionary.cambridge.org/us/dictionary/english/shortage) · [www.collinsdictionary.com](https://www.collinsdictionary.com/us/dictionary/english/shortage)

### C00-09 · 1세트 night 1 · 제안 / P3

**밤 앞에만에서 만을 빼면 규칙의 범위를 불필요하게 넓히지 않는다**

[원본 pipeline/out/lesson01.json](../../pipeline/out/lesson01.json#L2385) · `["1세트","Exercise 10 · 91~100","night",1,""]`

아침·오후·저녁·밤 네 표현을 비교하려는 취지는 이해된다. 하지만 독립된 해설에서 밤 앞에만 at이라고 하면 at noon/at midnight도 배제하는 일반 규칙처럼 읽힌다. 이는 문장 오류 지적이 아닌 초급 설명의 범위 명료화 제안이다.

**수정안** (적지 않은 칸은 유지):

- `c`: 밤 앞엔 at: at night. 아침엔 in the morning.

수정 후 계산 읽기량 6.67초 / 한도 12초, 해설 38자. 실측 독서 시간은 아니다.

근거: [dictionary.cambridge.org](https://dictionary.cambridge.org/dictionary/english/midnight)

## 원칙 확인이 필요한 제안 1건

**C16-P01 · 독립 절 발췌 허용 범위.** wise·wisdom·courage·ashamed·worst·curious②에는 원문 긴 문장에서 연속된 독립 절을 뽑은 예가 있다. 뜻·장면은 보존되며 카드 자체를 되돌릴 이유는 약하다. 다만 PRINCIPLES 2-11의 허용 변경 목록에는 이런 발췌가 명확히 적혀 있지 않다.

‘문맥의 뜻이 바뀌지 않고 혼자 읽어도 성립하는 연속 구절은 발췌할 수 있다. 중간 낱말을 재작성하거나 떨어진 부분을 짜깁기하지 않는다’는 범위를 명시할지 영신에게 확인하면 좋다. **원칙 확대 제안이므로 승인 전 자동 반영하지 않는다.** 이 리뷰에서는 원칙을 바꾸지 않았다.

## 유지해도 좋은 부분

- 세트별 조명 문법의 방향은 유지할 만하다. 변경 예문에서 혼합 가정법, `Had I known`, `Never/Not until/Little did`, 동격 that, so/neither, 가목적어 it, 분사구문, 대동사·시제 일치 예외가 목표 어휘와 양립한다. 문법 해설을 일괄 늘리거나 쉬운 단문으로 되돌릴 이유를 찾지 못했다.
- 소설 목록 134장과 목록에서 빠진 **observe 1장**을 검토했다. 화자·장면을 바꿔야 할 확정 오류는 찾지 못했다. straight의 번역 보완, puzzle의 경쟁어 안내, 발췌 범위의 원칙 확인을 따로 남겼다. 목록에는 문학 관련 비인용 해설도 포함된다.
- tender/gentle, crew/team, mainly/mostly, reportedly/apparently 등의 대입은 해당 예문에서 가능하다. apparently를 반드시 직접 본 증거의 추론으로만 제한하면 오히려 잘못된 구별이 된다.
- 소설의 반어·과장과 짧은 비폭력적 죽음 언급을 이유로 고양이 말투나 고전을 일괄 순화할 필요는 없다. surgery는 가정법상 수술 덕분에 고양이가 살아남았다는 문장이다.
- Christianity/Buddhism 등 떨어진 세트의 유사 문장 틀은 유효한 반복이다. 강세 표기가 이미 제공되므로 superb·absurd·ballet의 ‘강세 주의’를 긴 분절 설명으로 복구할 필요도 없다.
- jail·academy는 요청서의 27세트가 아니라 **26세트 Exercise 2**에 있다. 일산·STUDY1는 영어 예문이 아니라 고양이 대사에만 있다. 현행 이야기 **예문** 예산을 자동 위반했다고 판정하지 않았다.

근거 목록: [인용 135개 기록](evidence/quote-checks.json) · [문법·편집 판단](evidence/grammar-and-editorial.json)

## 학생 기록·화면·복원 검증

| 검증 | 결과 |
|---|---|
| e9c178d·acfe20e·5fdf148에서 생성한 실제 형식의 이어하기 | **2,026개** 모두 예상 연습으로 연결 |
| 이동 관련 완료 기록 조합 | **13,736개** 모두 예상 결과 |
| 저장 카드 고정 ID | 세 구버전 모두 유실 0 |
| 옛 저장값을 실제 Chrome에서 읽기 | 세 판 모두 모아둔 카드·이어하기·누적 학습·클리어·이미 본 돌파 축하 유지 |
| 돌파 축하 예약 중 다음 exercise 진입 | 다음 문제에 축하가 뒤늦게 덮이지 않고 타이머 유지 |
| 고유어 대문자·문장 첫 글자 | 실제 앱 함수로 17카드의 완성 표기 확인 |
| 복원 체인 | 새 50단계 모두 맞고, DATA 및 변경 원본 47파일이 acfe20e와 일치 |
| 분리한 복사본에서 원본 재조립 | 커밋된 HTML과 일치(줄바꿈 차이 제외) |

실제 브라우저는 Windows Chrome, 모바일 폭 390px다. 실제 iPhone Safari 장비는 시험하지 않았다. [학생 기록 검증](evidence/migration-audit.json) · [브라우저 검증](evidence/browser-audit.json) · [life 화면](evidence/life-reveal.png) · [복원](evidence/restoration-audit.json) · [빌드](evidence/build-audit.json)

### 검사 도구에서 주의할 점

현재 유효한 검사 **34개를 통과**했다. 원래 실행한 36개를 ‘36/36 통과’라고 적지는 않는다.

1. `milestones.test.cjs`는 Windows 체크아웃의 CRLF와 내부 정규화된 LF를 문자열로 비교하며 처음 실패했다. 파일을 고치지 않고 읽기 단계만 LF로 맞춘 뒤 통과했다. 앱 기능 실패와 구분해야 한다.
2. `synonym-wording-20260929/check.cjs`, `synonym-review-20260929/check.cjs`는 그날의 고정된 게임 코드 해시를 요구한다. **acfe20e에서도 이미 실패**한다. 지금의 배포 검증 목록에서 과거 보존용 검사임을 표시하는 편이 좋다.
3. `host-hooks` 무작위 표본의 해석+해설 길이를 45자 이상으로 맞춘 변경은 긴 카드 시험의 전제를 명시한 것이다. 짧은 카드·누락 IPA 등 별도 경로도 있어, 확인 범위에서 실제 문제를 가리는 조치로 보이지 않는다.
4. exaudit의 `-ie → -ying`, `shown` 인정은 정상 활용을 인정하는 수정이다. 반면 life→lifes는 현재 완성 문장 검사에서 잡히지 않았다. **완성 문장의 불규칙 활용 확인**을 보강할 가치가 있다. 이 리뷰는 이를 이유로 게임에 범용 굴절 알고리즘을 추가하라고 요구하지 않는다.
5. 폰 줄 수 재측정에서 **20세트 immigrant** 한 장이 Chrome 360·390px 모두 정답 공개문 4줄이다. 영어 예문은 이전부터 동일하다. 새 회귀는 아니며 폰트·환경 차이를 감안할 관찰이다. 줄 수를 꼭 줄이려면 예컨대 `The first Korean {{BLANK}}s reached Hawaii in 1903.`으로 줄일 수 있으나, 농장 노동이라는 정보가 빠지므로 선택 사항이다.

deepcheck의 현재 표시 카드 읽기량 초과는 0이다(A8 1건은 제거된 kinda 원본). 어휘 순서 검사에서 0–45세트 앞당김 2개 이상은 0이다. 자동 검사 통과만으로 내용이 옳다는 뜻은 아니며 위 카드 오류는 별도 직접 판독으로 찾았다.

[검사 결과 및 예외](evidence/checks.json) · [수정안 읽기량](evidence/proposal-budgets.json) · [재현 안내](repro/README.md)

## 범위와 한계

요청서 1,650기록을 모두 읽었다. 이 중 실제 내용 변경 1,646개, 위치만 이동한 4개다. 이동 전체는 11장이다. 요청서 밖의 46세트 복습 사본 23장, prime①의 sn 변경, 새 prime② 1장도 포함했다. 런타임 기준 기존 카드 변경 1,670장 + 추가 1장, 삭제 0장이다. 현행 총량은 7,574카드·676연습·5,362표제어다.

이번 리뷰는 해당 구간 변경분 전량과 관련 기능 검토다. 7,574장 전체를 또 전수 재독한 작업이나 모든 사실을 독립 출처로 재조사한 작업이라고 하지 않는다. 수정안의 수치 검사도 실제 독서 시간 측정이 아니다. 반영 담당자는 원장 방식으로 수정한 후 빌드·완성 문장·폰 줄 수를 확인하면 된다. 원칙 변경 제안 외에는 현행 정책을 유지하는 내용 보정이다.

[카드별 범위](evidence/coverage.json) · [요청서](https://github.com/esqsoy/vocagoyang/blob/ea8d66c/reviews/claude-20261012/REVIEW_REQUEST.md)
