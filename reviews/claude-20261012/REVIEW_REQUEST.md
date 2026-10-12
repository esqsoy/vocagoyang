# 아스트라에게 리뷰 요청 · 2026-10-12 (Claude)

영신: "나는 아스트라에게 리뷰를 해달라할게", "네가 아스트라에게 요청할점도 남겨줘".

지난 리뷰([reviews/codex-20261011](../codex-20261011/README.md))를 반영해 배포한 [acfe20e](https://github.com/esqsoy/vocagoyang/tree/acfe20e) 이후의 작업을 봐 줬으면 한다. 그 뒤 main 배포는 세 번이다. [5fdf148](https://github.com/esqsoy/vocagoyang/tree/5fdf148)(5세트 문법 뜻 분산, 0세트 재조정, 소설 명문장 42장), [5dad972](https://github.com/esqsoy/vocagoyang/tree/5dad972)(1~4세트), [921e8ff](https://github.com/esqsoy/vocagoyang/tree/921e8ff)(6~45세트). 경위는 [DEPLOYMENT.md](../../DEPLOYMENT.md)와 [WORK_LOG.md](../../WORK_LOG.md)의 2026-10-12 항목들에 있다.

**판단 기준은 최신 [PRINCIPLES.md](../../PRINCIPLES.md)다.** 지난 리뷰 뒤에 바뀌거나 새로 생긴 것이 많다: 2-2 읽기량 한도, 2-9 이름, 2-10 사람·학원 이야기 예산과 개→고양이 예외, 2-11 소설 명문장, 12 조명 문법과 5세트 분산. 원칙과 부딪치는 제안은 부딪친다고 표시해 주면, Claude가 영신에게 먼저 묻는다.

## 데이터

- [changes.json](changes.json): acfe20e 대비 0~45세트에서 바뀐 카드 1,650장(뜻·예문·해석·해설·대사의 전후, 빈칸을 채운 문장). 새 카드는 41세트 prime ② 1장, 빠진 카드는 없다. 카드 키는 저장 카드 ID다.
- [quotes.json](quotes.json): 지금 게임에 있는 소설 명문장 134장(세트·단어·문장·작품·해설). 133장이 acfe20e 뒤에 들어왔다.
- 영신용 직검수 페이지(claude.ai, 영신 계정 비공개)는 열리지 않을 수 있다. 내용은 changes.json과 같다.
- 세트별 제안과 Claude가 고친 점: WORK_LOG "6~17세트", "18~37세트", "38~45세트" 항목. 하위 에이전트 지침은 [pipeline/set-work/BRIEF.md](../../pipeline/set-work/BRIEF.md).

## 특히 봐 줬으면 하는 것 (중요한 순서)

1. **5세트 분산 코드와 학생 기록.** FABLE 게임 코드에서 바뀐 곳은 여기뿐이다: `deployedWords`·`deployedParts`, `PRUNE_LAYOUT="20261012"`, `resumeTarget`의 `deployedResumeTitles` 대체 경로([PRINCIPLES 12](../../PRINCIPLES.md), 시험 [pipeline/tests/set5.test.cjs](../../pipeline/tests/set5.test.cjs)). 지난번처럼 실제 브라우저와 옛 판 저장값으로 확인해 주면 좋겠다. 확인할 판은 acfe20e 이전, acfe20e, 5fdf148이다. 볼 것은 모아둔 카드, 완료 표시, 이어하기, 돌파 축하가 그대로 이어지는지다. 시험이 놓친 경우를 찾아 줘.
2. **소설 명문장.** 문장은 구텐베르크 판 원문과 글자까지 대조했다(파일 목록은 아래). Claude가 앞뒤를 읽고 쓴 해설의 **화자·장면 요약**이 틀렸는지 봐 줘. 예: "모스턴 양이", "레스트레이드 경감", "콜린스", "베이츠 양", "메그", "남편이 전쟁터로 떠날 때", "이프 성 감옥은 죽은 죄수를 바다에 던졌다". 카드 뜻(ko)과 문장 속 쓰임이 같은지, 해석이 원문 뜻을 벗어나지 않는지도 봐 줘. 번역본은 『안나 카레니나』·『죄와 벌』 Garnett, 『전쟁과 평화』 Maude, 『돈키호테』 Ormsby, 『피노키오』 Della Chiesa다.
3. **"이 뜻에서는 X와 바꿔 쓸 수 있다".** 같은 칸 수로 들어가는 경쟁어를 해설로 알리는 표준 문구다(PRINCIPLES 3). 이번에 수백 장에 넣었다. X가 그 예문에 정말 들어가는지 봐 줘(예: reportedly/apparently, tender/gentle, crew/team, mainly/mostly, presume/suppose·imagine, sharply/quickly). 새 예문에서 놓친 같은 칸 수 경쟁어도 찾아 줘.
4. **조명 문법 예문.** 세트별 항목은 [pipeline/grammar/spotlight-20261012.json](../../pipeline/grammar/spotlight-20261012.json)에 있다. 맞는 문장인지, 자연스러운지, 문법 때문에 표제어가 흐려지지 않았는지 봐 줘. 특히 도치(Never/Not until/Little did/Had I known), 혼합 가정법, 동격 that, so/neither, 분사구문, 시제 일치 예외, 대동사, 가목적어 it.
5. **사실·어원·발음 표기.** 예문과 해설에 새로 넣은 지식이다. 예:
   - 사실: 바퀴벌레는 머리 없이 일주일, 인도네시아 무슬림 인구 세계 최다, 마틴 루서 킹 노벨평화상, 해리 포터 1997, 1 tablespoon = 3 teaspoons, 아프리카코끼리가 가장 큰 육상 동물, 제너 1796, 태양은 대부분 수소, 아테네 직접 민주주의, 칠레 광산 33명 69일.
   - 어원: planet '떠돌이', coach '마차 → 개인 교사', lobby, fatal ← fate, tense(시제)와 tense(긴장한)의 뿌리, matrix ← mater, worship ← worth+ship.
   - 한글 발음 표기: [베이드] bathe, [써로우] thorough, [시크리트] secrete, -voir [브와], [헤퍼타이티스], [캄리].
   - 강세 표시: pho-TOG-ra-pher, e-CON-o-mist, ath-LET-ic, EX-e-cute/ex-e-CU-tion, tat-TOO.
6. **해설을 지운 카드(c=None)와 크게 줄인 카드.** 뜻 줄을 되풀이한다고 보고 지웠다. 혼동 쌍, 불규칙형, 영국 철자, 전치사 짝처럼 남겼어야 할 것을 지운 게 있는지 봐 줘. 줄인 해설이 너무 짧아져 뜻이 안 통하는 것도 찾아 줘.
7. **아이들이 보는 게임으로서의 어조.** 폭력·죽음이 나오는 예문과 인용이 지나친지 봐 줘(assault, militant, murderer, cemetery, hell, beaten, hug의 『폭풍의 언덕』 장면). 개→고양이 예외(PRINCIPLES 2-10)가 적절한지도.
8. **표시 문제 후보.** 늘 대문자인 답(Latin, Muslim, Irish, Protestant, Olympics, Christian, African …)이 문장 중간 빈칸에서 어떻게 입력·표시되는지 봐 줘. 문장 첫 빈칸의 대문자 처리도. 코드 문제면 재현 방법을 같이 남겨 줘.
9. **남긴 판단.** 다시 봐 줬으면 하는 것들이다.
   - 같은 틀이나 비슷한 장면인데 그대로 둔 짝: buddhism과 31세트 christianity, benchmark와 stun, swimmer와 runner.
   - 23세트에서 잠 소재 카드 4장(서로 다른 사실).
   - 27세트 연습 2에서 jail과 academy의 일산·STUDY1 대사가 연달아 나온다. 2-10 예산에 걸린다.
   - "강세 주의"만 쓰고 위치를 안 적은 카드: superb, absurd, ballet.
10. **시험·도구.**
    - [host-hooks 시험](../../pipeline/ipa-effects/tests/host-hooks.test.cjs) 수정: 무작위 표본의 해석+해설이 45자 미만이면 해설을 채운다. 이게 실제 문제를 가리지 않는지 봐 줘.
    - [exaudit](../../pipeline/exaudit.py) 규칙 두 곳(-ie→-ying, shown).
    - 복원 체인([restore.cjs](../../pipeline/claude-review-20261008/restore.cjs) LAYERS 맨 위 `set45b`~`set1`)이 역검증되는지.

## 바라는 결과 형식

- 지난번처럼 `reviews/` 아래 새 폴더에 review.json(카드마다 세트·word·si, 판정: 오류/보완/제안, 근거)과 읽기용 요약을 남겨 줘.
- 사실 오류와 취향 차이를 나눠 주고, 원칙과 부딪치는 제안은 표시해 줘.
- 게임 코드와 어휘 데이터는 바꾸지 말아 줘. 반영은 Claude가 원장으로 하고, 영신 승인이 필요한 것은 영신에게 묻는다.

## 원문 파일(구텐베르크)

판 대조에 쓴 파일과 eBook 번호: alice 11, lookingglass 12, anna 1399, anne 45, blackbeauty 271, callwild 215, carol 46, copperfield(David Copperfield), crime 2554, crusoe 521, dorian 174, dracula 345, emma(Emma), frankenstein 84, greatexp 1400, gulliver 829, heartdark 219, heidi(Heidi, 옛 Etext), hound 2852, huck 76, janeeyre 1260, junglebook 236, kidnapped 421, littlewomen 514, mansfield(Mansfield Park), metamorph 5200, middlemarch 145, moby 2701, monte 1184, oliver 730, oz 55, persuasion 105, peterpan 16, pinocchio 500, pride 1342, princepauper 1837, quixote 996, scarlet 33, secretgarden 113, sense 161, sherlock 1661, signfour 2097, study 244, timemachine 35, tomsawyer 74, treasure 120, twocities 98, velveteen 11757, warpeace 2600, warworlds 36, whitefang 910, windwillows 289, wuthering 768. 원문 텍스트는 저장소에 넣지 않는다(영신 지침).
