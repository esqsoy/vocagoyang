# 보카고양 팀 면접 과제지

보카고양은 한국 고등학생용 영어 단어 게임이다. 카드마다 영어 예문의 빈칸에 표제어를 쳐 넣는다. 빈칸은 글자 수만큼 칸으로 보인다(꼬리 -s·-ed·-d는 칸 밖에 이미 적혀 있다). 그래서 **같은 글자 수의 다른 영어가 문장에 맞게 들어가면** 학생은 맞는 영어를 쳐도 틀린다. 이런 '같은 칸 수 경쟁어'는 예문을 좁혀 막거나, 못 막으면 해설(c)에 '이 문장에는 ○○도 들어간다'고 적어야 한다.

카드 칸: en(정답), ko(한국어 뜻), ex(예문, {{BLANK}}가 빈칸), tr(예문의 한국어 해석, 반말), c(해설), ipa(미국식 발음, 빗금 없이), pos(품사).

규칙은 저장소의 PRINCIPLES.md(특히 2절 예문, 3절 빈칸 중의성, 4~5절 해설)를 읽어도 된다. **다음은 보지 않는다:** `pipeline/exam/` 아래 파일, `vocagoyang*.html`, `git log`·`git show` 같은 git 기록, 이 과제지 폴더 밖의 스크래치 파일. 인터넷 검색은 하지 않는다.

## 과제 1. 카드 검수 (12장)

아래 12장에는 일부러 넣은 잘못이 몇 개 있고, 원래부터 있던 문제가 더 있을 수도 있다. 카드마다 문제를 찾아 적어라. 문제마다 `카드 번호 / 칸 / 무엇이 틀렸나 / 고친 안 / 확실·의심` 으로. 문제가 없으면 '문제 없음'. 틀리게 '확실'이라고 한 것은 감점이다.

**C1** `{"en": "conversely", "ko": "① 거꾸로, 반대로", "ex": "Plants grow fast in warm weather; {{BLANK}}, cold slows them down.", "tr": "식물은 따뜻한 날씨에 빨리 자라. 반대로 추위는 성장을 늦춰.", "c": "앞 내용과 같은 경우를 하나 더 덧붙일 때 쓴다.", "ipa": "kənˈvɝsli", "pos": "adv."}`

**C2** `{"en": "minute", "ko": "① 아주 작은, 미세한; 세밀한", "ex": "Even {{BLANK}} amounts of the poison, too small to see, can kill.", "tr": "그 독은 눈에 안 보일 만큼 아주 적은 양으로도 사람을 죽일 수 있어.", "c": "'분'과 철자는 같고 발음이 다르다. GRE 짝: minuscule.", "ipa": "maɪˈnut", "pos": "adj."}`

**C3** `{"en": "reprove", "ko": "① 꾸짖다, 책망하다", "ex": "But Levin had not the heart to {{BLANK}} him.", "tr": "하지만 레빈은 차마 걔를 꾸짖을 수 없었어.", "c": "톨스토이 『전쟁과 평화』. 이 문장에는 upbraid도 들어간다.", "ipa": "rɪˈpruv", "pos": "v."}`

**C4** `{"en": "refer", "ko": "① (~ to) 가리키다, 언급하다", "ex": "The term \"fossil fuels\" {{BLANK}}s to coal, oil, and natural gas.", "tr": "'화석 연료'라는 말은 석탄, 석유, 천연가스를 가리켜.", "c": "꼭 to와 함께 쓴다. refer-referred로 r을 겹친다.", "ipa": "ˈrɛfɝ", "pos": "v."}`

**C5** `{"en": "ambiguous", "ko": "① 모호한, 여러 뜻으로 읽히는", "ex": "The results were {{BLANK}} and could support either theory.", "tr": "결과가 모호해서 어느 이론도 뒷받침할 수 있었어.", "c": "ambi-(양쪽). vague는 뜻이 흐릿한 것이다. 이 문장에는 equivocal도 들어간다.", "ipa": "æmˈbɪɡjuəs", "pos": "adj."}`

**C6** `{"en": "iceberg", "ko": "① 빙산", "ex": "Only about half of an {{BLANK}} shows above the water.", "tr": "빙산은 절반쯤만 물 위로 드러나.", "c": "the tip of the iceberg는 '빙산의 일각'.", "ipa": "ˈaɪsˌbɝɡ", "pos": "n."}`

**C7** `{"en": "company", "ko": "① (군대) 중대", "ex": "She joined a touring theater {{BLANK}} and performed in small towns.", "tr": "걔는 순회 극단에 들어가 작은 도시들에서 공연했어.", "c": "theater company 극단, dance company 무용단.", "ipa": "ˈkʌmpəni", "pos": "n."}`

**C8** `{"en": "nonplussed", "ko": "① 어리둥절한, 당혹스러운", "ex": "Usually quick to reply, the speaker was {{BLANK}} by the question and fell silent.", "tr": "평소 대답이 빠른 연사도 그 질문엔 말문이 막혔어.", "c": "'태연한'은 오용.", "ipa": "nɑnˈplʌst", "pos": "adj."}`

**C9** `{"en": "landslide", "ko": "① 산사태", "ex": "Heavy rain on the steep slope triggered a {{BLANK}}.", "tr": "가파른 비탈에 폭우가 쏟아져 산사태가 났어.", "c": "land(땅) + slide(미끄러지다). 선거의 '압승'도 landslide.", "ipa": "ˈlændˌslaɪd", "pos": "n."}`

**C10** `{"en": "disperse", "ko": "① 흩어지다, 퍼뜨리다", "ex": "The morning mist {{BLANK}}d as the sun warmed the valley.", "tr": "해가 골짜기를 데우자 아침 안개가 짙어졌어.", "c": "scatter와 비슷한 말이다.", "ipa": "dɪˈspɝs", "pos": "v."}`

**C11** `{"en": "condescending", "ko": "① 잘난 체하며 깔보는", "ex": "He explained the simple rule in a {{BLANK}} tone, as if to a child.", "tr": "걔는 그 간단한 규칙을 아이 대하듯 깔보는 말투로 설명했어.", "c": "GRE 짝: patronizing.", "ipa": "ˌkɑndɪˈsɛndɪŋ", "pos": "adj."}`

**C12** `{"en": "devoid", "ko": "① ~이 전혀 없는", "ex": "The deep ocean floor was once thought to be {{BLANK}} with life.", "tr": "한때는 깊은 바다 밑바닥에 생명이 전혀 없다고 여겼어.", "c": "항상 devoid of ~ 꼴로 쓴다. 이 문장에는 bereft도 들어간다.", "ipa": "dɪˈvɔɪd", "pos": "adj."}`

## 과제 2. 같은 칸 수 경쟁어 (8문장)

문장마다 정답(괄호)과 같은 글자 수로, 문법과 뜻이 맞게 자연스럽게 들어가는 다른 영어 낱말을 모두 대라(꼬리 -ed는 칸 밖이니 원형 글자 수로 센다). 낱말마다 '확실히 맞음/어색하지만 가능'을 붙여라. 없으면 '없음'.

1. (tenacious, 9칸) A {{BLANK}} reporter, she pursued the story for ten years.
2. (profusion, 9칸) In spring the valley offers a {{BLANK}} of wild flowers in every color.
3. (pedestrian, 10칸) Critics called the novel a {{BLANK}} work: competent but without one original idea.
4. (elicit, 6칸) In the experiment, loud noises {{BLANK}}ed a fear response in the rats.
5. (evocative, 9칸) The novel opens with an {{BLANK}} description of a rainy London street.
6. (cavil, 5칸) The plan is sound, though critics will {{BLANK}} at minor details.
7. (estimation, 10칸) Carbon dating allows the {{BLANK}} of a bone's age.
8. (glaciation, 10칸) Sea levels dropped during periods of {{BLANK}}, when ice covered much of the land.

## 과제 3. 카드 쓰기 (3장)

아래 뜻으로 과제 1과 같은 꼴의 카드를 하나씩 써라(en, ko, ex, tr, c, ipa, pos). 지킬 것: 예문은 한 문장, 휴대폰 화면에서 세 줄 안(대략 90자 안), 고등학생이 아는 쉬운 단어로 둘러쌀 것(PRINCIPLES 2-1), 빈칸은 하나, 같은 칸 수 경쟁어를 막거나 해설에 적을 것, 해설은 꼭 필요한 것만 72자 안, 해석은 반말이고 3인칭 사람은 '걔', 지식 예문이면 사실이 맞을 것.

1. TOEFL: erode ① (바람·물이) 침식하다 (v.)
2. GRE: laconic ① 말수가 적은, 간결한 (adj.)
3. TOEIC: invoice ① 송장, 청구서 (n.)

## 답 내는 법

마지막 답에 과제 1·2·3을 차례로 적어라. 시간을 재니 군더더기 없이.
