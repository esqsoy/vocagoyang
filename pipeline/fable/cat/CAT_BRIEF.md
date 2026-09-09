# 고양고양이 대사 브리핑 — Fable 후반 확장 + 고양체 가이드

## 세계관(반드시 유지)
- 앱 "보카고양 Fable". 학생은 "꽃과 단어의 도시 일산"에 갇혀 있고, 단어를 다 외워야 도시를 벗어나 BIG MOUNTAIN(큰산)으로 갈 수 있다. 고양고양이는 츤데레 감시자이자 동행. 학원 이름 STUDY1, 동네 소재 박스원복싱장 같은 로컬 농담이 있다. 말끝은 "~라고양", "~다고양", "~냐고양", "~지양" 등 고양체.
- 현재 대사: `/home/claude/hoe-prod/fable/cat/lines_current.json` (welcome/start/correct/correctStreak/wrong/timeout/exerciseDone/lessonDone/allDone 9갈래 128줄). 카드별 대사 견본: `/home/claude/hoe-prod/fable/cat/meow_current.json` (0~22세트 291줄, {set, word, meow}).
- 제작자(국어 선생님)의 원래 주문: "츤데레인 고양이가 찰지게 갈궈줘야 한다", "악랄함을 더해 달라"를 여러 번. 상황별(평소/정답/연속정답/오답/시간초과/마감) 목소리가 달라야 한다.

## 새 규칙(제작자와 합의됨)
1. 갈굼의 과녁은 학생의 게으름·망설임·핑계이지 학생 자체가 아니다. 외모·성적·가정 비하 금지. 악랄함은 "도망 못 가게 붙드는 집요함"으로 표현한다.
2. 속어는 0세트에서 가르친 것만 쓴다: shit, damn, hell, crap, fuck, ass, asshole, jerk, idiot, loser, bitch, bastard, suck, screw (up), piss (off), freak (out), darn, heck, shoot, freaking, gosh. 영어 그대로 대사에 섞는다(예: "Damn it, 또 틀렸다고양.").
   - 약·완곡 등급(crap, suck, darn, heck, shoot, freaking, gosh, jerk, idiot, loser)은 어디서나 자유.
   - 중 등급(damn, hell, ass, piss, screw)은 오답·시간초과·연속 오답에서.
   - 강 등급(shit, fuck, bitch, bastard, asshole)은 lessonDone(세트 마감)·allDone·연속 오답 3회 이상 대사에서만, 한 갈래에 2줄 이하. bitch·bastard·asshole은 사람을 향하지 않게(감탄·자책·상황 묘사).
3. 길이: 갈래 대사 60자 이하, 카드별 meow 48자 이하, 반드시 '고양' 포함.
4. 카드별 meow는 그 카드의 단어를 영어 그대로 한 번 포함하고 뜻이 드러나게(학습 효과), 나머지는 갈굼·농담·세계관.

## 산출물
1. `/home/claude/hoe-prod/fable/cat/style_guide.md` — 고양체 스타일 가이드 30줄 이내: 말끝 목록, 갈래별 목소리(평소=시니컬 동행 / 정답=마지못한 인정 / 연속정답=경계하며 응원 / 오답=집요한 갈굼 / 시간초과=재촉 / 마감=츤데레 폭발), 속어 등급 규칙, 금지 사항, 좋은 예 5줄·나쁜 예 3줄.
2. `/home/claude/hoe-prod/fable/cat/lines_new.json` — 9갈래 전체. 기존 줄은 살리되 규칙 위반(있다면)만 손보고, 각 갈래에 속어를 섞은 새 줄을 추가: welcome +2, start +2, correct +4, correctStreak +4, wrong +8, timeout +5, exerciseDone +3, lessonDone +4, allDone +2. 형식은 lines_current.json과 같은 {갈래: [문자열...]}.
3. `/home/claude/hoe-prod/fable/cat/meow_new.json` — 23~45세트 카드별 대사, 세트당 10줄(45세트는 8줄), 총 228줄. 형식 `[{"set":23,"word":"guy","si":1,"meow":"..."}]`. 단어 선택은 `/home/claude/hoe-prod/fable/review/setNN.txt`(카드 덤프, 한 줄 = 카드)에서 농담 거리가 되는 단어를 고른다. 각 세트 파일은 크니 필요한 부분만 훑어라(grep으로 단어를 찾아도 된다).
4. 마지막에 파이썬으로 검증: 모든 줄에 '고양' 포함, 길이 제한, 속어 등급 규칙(강 등급이 허용 갈래 밖에 없음), meow의 (set, word, si)가 카드 덤프에 실제로 존재. 검증 결과를 보고에 적는다.

## 보고(10줄 이내)
갈래별 줄 수, meow 줄 수, 검증 결과, 가이드에서 제작자 확인이 필요한 결정 3개 이내.
