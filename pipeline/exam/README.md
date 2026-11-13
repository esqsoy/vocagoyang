# 시험 단어장(토익·토플·GRE)

FABLE 위에 얹는 시험 단어장의 원본·조립기·엔진 복제 도구다. 결정과 이유는 [WORK_PLAN '시험 단어장'](../../WORK_PLAN.md)과 [PRINCIPLES 0](../../PRINCIPLES.md)에 있다.

- 시험 하나 = `pipeline/exam/<id>/`(원본) + 저장소 맨 위 `vocagoyang<id>.html`(화면) 하나.
- 화면은 FABLE 엔진을 복제한 것이다. 예문 빈칸 문장(FABLE 방식)·정답 공개·오답 따라쓰기·단어 터치 발음·모아둔 카드가 FABLE과 같다.
- 엔진 원본은 `vocagoyangtoeic.html`이다. 토플·GRE는 `sync.cjs`가 이 HTML을 복제하고 설정 블록과 DATA만 바꾼다.

## 파일

| 파일 | 무엇 |
|---|---|
| `courses.cjs` | 시험 목록(`<id>/config.json`이 있는 시험), 저장 키 규칙, 설정 블록 만들기. 모듈 빌더·검사가 쓴다 |
| `assemble.py` | 원본 검사 → IPA 맞추기 → 시험 HTML의 `const DATA` 한 줄 교체 |
| `sync.cjs` | 시험마다 설정 블록·`<title>`·첫 화면 제목을 `config.json`으로 쓰고, 토익이 아닌 시험은 토익 엔진을 복제한다. `--check`는 엔진 부분이 같은지 본다 |
| `<id>/config.json` | `id`·`name`(교재 이름, 모아둔 카드·완주 표시)·`title`(`<title>`)·`heading`(첫 화면 제목)·`sets`(`[{lesson, name}]`) |
| `<id>/setNN.json` | 세트 원본(NN=01..). FABLE `pipeline/out/setNN.json`과 같은 꼴 |
| `tests/fixture/` | 개발·검사용 작은 원본 2세트(예문은 꾸민 것). `pipeline/tests/exam-course.test.cjs`가 쓴다 |

## 원본 꼴

`setNN.json` = `[{ex, name, scope?, words:[카드]}]`.

- 카드 필수 칸: `en`(치는 답) `ko`(`① …`, sn>1이면 번호 필수) `ex`(`{{BLANK}}` 하나) `tr` `ipa`(FABLE 관례: 미국식, 빗금 없음, ˈ/ˌ) `pos` `word`(표제어) `si`·`sn`(이 책 안의 뜻 번호·뜻 수).
- 있을 때만: `c`(해설) `meow`(고양 대사) `acceptedAnswers`(대체 정답, 예문 빈칸에 넣어도 맞는 영어만) `fable`.
- `fable`: FABLE에 같은 뜻 카드가 있으면 `{"set": FABLE 세트 번호, "si": FABLE 뜻 번호}`. 없으면 칸을 두지 않는다.
- FABLE과 같은 뜻 카드(`fable` 있음)는 **원본에서** `"scope": "fable"` 연습에 모은다. 세트 안에서 새 뜻 연습들 뒤에 두고, 번호는 1부터 따로 센다(화면 제목 `FABLE 뜻 1 · 이름`, 새 뜻 연습은 `Exercise 1 · 이름`). 조립기는 다시 묶지 않고 검사만 한다.
- `word`+`si`는 책 전체에서 하나다. 모아둔 카드 ID가 `[word, si]`라서, 카드를 다른 연습·세트로 옮겨도 담아 둔 카드가 그대로 이어진다.

## 화면

- 머리줄 단추 **FABLE 뜻 빼는 중 / FABLE 뜻 포함**(마더텅 2026/전체 자리). 기본 켬. 켜면 `scope "fable"` 연습을 숨긴다(`visEx`). 연습 단위로 숨겨서 연습 제목·진도 키는 단추와 상관없다. 개수·경로 막대·이어하기·다음 세트·속도 예측이 보이는 연습만 센다.
- 세트는 모두 열려 있다(FABLE의 차례로 열기·도장·B1/C1·번호 다시 매기기는 넣지 않았다). 완주는 짧은 완주 화면(`#examEnd`), 경로 막대를 누르면 다시 본다.
- FABLE의 손으로 쓴 내용(`LINES` 고양이 대사·`LESSONCLEAR`·`HINTS`·`ALT`)은 비워 두었다. 대사가 비면 말풍선을 띄우지 않는다. 시험 단어장 대사는 따로 쓴다.
- 저장 키: `goyang-<id>-seoul-v1`(진도) `goyang-<id>-mode-v1`(단추, '1' 켬·'0' 끔) `goyang-<id>-seoul-last-v1`(이어하기) `goyang-<id>-uni-v1`(지금은 쓰지 않음). 모아둔 카드는 `진도 키-saved-cards-v1`, 속도는 `goyang-pace-<id>-…`. 시험 HTML에 `goyang-hoe-`·`goyang-fable-` 글자가 있으면 `sync.cjs --check`와 검사가 실패한다.
- 모듈: 모아둔 카드(교재 이름 `EXAM.savedCourse`, ID `[word,si]`)·돌파 축하(`EXAM.msCourse`, 합집합 순서 FABLE→마더텅→EBS→토익→토플→GRE)·속도 예측(목표 '토익 완주')·발음 효과는 빌더가 `examPages()`로 찾아 끼운다. 세트 도장·마더텅 발췌·`patch-textbooks`에는 넣지 않는다.
- 첫 화면(`index.html`) 교재 카드와 `index-stats.cjs`에는 아직 넣지 않았다(공개는 원장 확인 뒤).

## 명령

실제 원본을 넣을 때(토익):

```sh
# 1. pipeline/exam/toeic/setNN.json을 넣고 config.json sets에 [{"lesson":1,"name":"…"}, …]를 적는다
python3 pipeline/exam/assemble.py toeic          # 검사 → DATA 교체(문제가 있으면 쓰지 않고 종료 코드 1)
node pipeline/ipa-effects/build.cjs              # 발음 효과 표를 새 DATA에 맞춘다
node pipeline/exam/sync.cjs --check
python3 pipeline/deepcheck.py --course toeic A1 A2 A6 A8
node pipeline/linecheck.cjs --course toeic
python3 pipeline/review-page.py 1 --course toeic --since <커밋>   # 직검수 페이지
```

토플·GRE를 시작할 때: `pipeline/exam/<id>/config.json`을 만들고 `node pipeline/exam/sync.cjs`(빈 HTML 생성) → 위 1~2단계 → 모듈 빌더(`saved-cards`·`milestones`·`pace`)는 엔진에서 복제되므로 다시 돌릴 필요가 없다. `storage-guard/config.json` targets에는 손으로 더한다. 진도 키 합치기(`record-transfer/config.json` kinds.progress)에는 toefl·gre가 이미 들어 있다.

개발용 원본으로 화면을 다시 만들 때: `python3 pipeline/exam/assemble.py toeic --src pipeline/exam/tests/fixture` → `node pipeline/ipa-effects/build.cjs`.

엔진(토익 HTML)을 고친 뒤에는 `node pipeline/exam/sync.cjs`로 다른 시험 HTML에 옮긴다.

## 검사

- `assemble.py`: 필수 칸·모르는 칸, `{{BLANK}}` 하나, ko 번호와 si, sn>1 번호, `word`+`si` 중복, 표제어별 si 1..sn, `fable` 연결이 FABLE DATA(기본 `vocagoyangfable.html`, `--fable`로 바꿈)의 그 세트·같은 word·그 si에 있는지, 연결 카드 ↔ `scope "fable"` 연습, FABLE 뜻 연습이 세트 끝에 있는지, 연습 번호 중복, 설정 블록의 `EXAM.id`가 맞는 HTML인지. `--check`는 쓰지 않고 DATA가 같은지만 본다.
- IPA 맞추기: `fable` 연결 카드는 연결된 FABLE 카드 IPA로, 연결이 없어도 FABLE에서 같은 `en`·`pos` 카드의 IPA가 하나뿐이면 그 IPA로 DATA를 쓴다(원본은 그대로). 덮어쓴 수를 출력한다. 같은 낱말·IPA여야 FABLE 예외 음원이 붙는다.
- `pipeline/tests/exam-course.test.cjs`: 단추 기본 켬·끄면 보임, 진도 키 안정, 이어하기·개수, 저장 키, 완주, `sync.cjs --check`, 조립기가 잘못된 원본 15가지를 거부하고 FABLE HTML에 쓰지 않음.
- 세 교재 검사(모아둔 카드·검색·철자 변형·돌파 축하·발음·IPA 보존 등)는 `pipeline/tests/helpers/courses.cjs`의 목록으로 시험 HTML도 함께 돈다. FABLE 엔진 판별은 파일 이름이 아니라 `function splitExercises(` 유무다.
