# 뜻의 정답 노출 정리·figure·qualify 수정 · 2026-10-02

- 앱 커밋: [1764496dfcba928e382e6a69d57ec82634f969f5](https://github.com/esqsoy/vocagoyang/commit/1764496dfcba928e382e6a69d57ec82634f969f5), origin/main 푸시 완료.
- [GitHub Pages 36904196964](https://github.com/esqsoy/vocagoyang/actions/runs/36904196964): completed / success. 인덱스·세 과정 HTTP 200과 로컬 검증본의 일치를 확인했다.
- 뜻의 정답 노출 119곳을 정리했다. figure의 six-figure salary 예문과 한국의 ‘억대 연봉’ 비유 한 문장, qualify의 only in this case 예문을 반영했다. 원본·복습 포함 123카드·131필드다.
- 단어 수·순서·정답 판정·진도·UI·IPA는 유지한다. 인덱스·마더텅·EBS 파일은 이전 공개본과 동일하다.
- 배포 요청 후 검사 5개 재실행 통과: morphology-content, reading-core, session(620연습·7,440회), IPA conservation, IPA build --check. 변경 원장의 최초 보존 해시는 유지했다.

공개 UTF-8 텍스트를 LF로 정규화한 SHA-256:

| 파일 | SHA-256 |
| --- | --- |
| index.html | c89abf0834676d0ec708a66babaae82ddfd9e5c9025c1f1f1e5f1c5057de42cb |
| vocagoyangfable.html | 0870a31258bd736557f71c7509a9ea883249b14cbe02dea46497f2db17185ea6 |
| vocagoyangksat2027.html | 9c9dee92b4bb4de5c5329d44ae9ee751c5f5cd27a3b844963891ff78ba20757f |
| vocagoyangebs2027.html | 855c51369c700524d4780ecb5b3dbfd723bcc31def2009dea075732da14d311f |

[FABLE 열기](https://esqsoy.github.io/vocagoyang/vocagoyangfable.html?release=1764496)

---

# 모바일 Safari 발음기호 위치 보정 · 2026-10-01

- 앱 커밋: [7032122a2be6b670f03f325fa23ff4b4398cfef2](https://github.com/esqsoy/vocagoyang/commit/7032122a2be6b670f03f325fa23ff4b4398cfef2), origin/main 푸시 완료.
- [GitHub Pages 36873498316](https://github.com/esqsoy/vocagoyang/actions/runs/36873498316): completed / success. 2026-10-01 23:05 KST 인덱스·세 과정 HTTP 200 및 검증본과의 일치를 확인했다.
- FABLE·마더텅·EBS 공통 IPA가 고정 레이어의 실제 원점을 기준으로 배치되고 visualViewport의 resize/scroll을 따라간다. 위치 갱신을 한 프레임으로 묶고 효과 종료 시 예약을 취소한다. 스타일·발음 속도·단어 데이터·진도는 유지한다.
- 배포 요청 후 검사 8개 재실행·통과: IPA layout, completion, advance, stress, host-hooks, conservation, answer-replay, build --check. 구현 단계에서 Chromium 일반 화면과 390px도 확인했다.
- 학생의 iPhone Safari 실기기에서 해결됐는지는 아직 미확인이다. 모의 원점 이동에서 기존 분리 현상이 재현되고 보정 후 통과한 결과와 실기기 검증을 구분한다.

공개 UTF-8 텍스트를 LF로 정규화한 SHA-256:

| 파일 | SHA-256 |
| --- | --- |
| index.html | c89abf0834676d0ec708a66babaae82ddfd9e5c9025c1f1f1e5f1c5057de42cb |
| vocagoyangfable.html | 2458c9339bb762e1b7dce96a7ff5bf97f66dadeaed6cbfae7b01df994d32ee0d |
| vocagoyangksat2027.html | 9c9dee92b4bb4de5c5329d44ae9ee751c5f5cd27a3b844963891ff78ba20757f |
| vocagoyangebs2027.html | 855c51369c700524d4780ecb5b3dbfd723bcc31def2009dea075732da14d311f |

[교재 선택](https://esqsoy.github.io/vocagoyang/?release=7032122) · [FABLE](https://esqsoy.github.io/vocagoyang/vocagoyangfable.html?release=7032122)

---

# 어원·접미사 보강과 인덱스 자동 집계 · 2026-10-01

- 앱 커밋: [cadd4fbb9f4c24a05b6d9565db308ffba50eb4a4](https://github.com/esqsoy/vocagoyang/commit/cadd4fbb9f4c24a05b6d9565db308ffba50eb4a4). origin/main 푸시 완료.
- [GitHub Pages 36754934684](https://github.com/esqsoy/vocagoyang/actions/runs/36754934684): completed / success. 2026-10-01 02:57 KST에 인덱스·세 과정 공개 파일 HTTP 200과 로컬 검증본의 일치를 확인했다.
- 어원·접미사 358카드·141개 개념 단위. 새 표제어 43개와 기존 어휘의 대비·복습을 추가했다. 전체 FABLE 7,067카드·620연습. awesome/troublesome의 일반 -some과 ribosome의 -some, microbiome 등의 -ome을 구별하고 word family 표기를 통일했다.
- 월 해설을 정리하고 숫자 어원을 반영했다. 세 과정에서 음성이 일찍 끝날 때 일부 IPA가 누락되는 경로를 수정했다.
- 인덱스는 데이터 빌드 때 자동 갱신한다. FABLE 4,916, 마더텅 추가 3,238·누적 8,154, EBS 추가 129·최종 8,283. 등록 표제어·구 표현·이전 기출 기준이다.
- 개편한 47·48세트 진도는 새 구성으로 시작한다. 저장 기록을 삭제하지 않으며 다른 세트·과정의 진도는 유지한다. 47세트 Exercise 11은 troublesome 추가를 반영한 별도 키를 쓴다.
- 배포 전 검사 19개 통과: [검사 목록·범위](HANDOFF.md#이번-배포-검사--2026-10-01). FABLE 7,440회 모의 플레이, 마더텅·EBS 입력, 발음·재생·내용 및 기록 보존을 확인했다. 보류한 흰색 밝기 실험과 관계없는 로컬 임시 파일은 포함하지 않았다.

UTF-8 텍스트의 줄바꿈을 LF로 통일한 공개 파일 SHA-256:

| 파일 | SHA-256 |
| --- | --- |
| index.html | c89abf0834676d0ec708a66babaae82ddfd9e5c9025c1f1f1e5f1c5057de42cb |
| vocagoyangfable.html | d066f6b03ed0a462f72cd9af5f82ac166d950d50fa0f428f2d6536c773686bd2 |
| vocagoyangksat2027.html | 0dece91a0587737b127c2a616a687e6510a8bb03bf67f2e8dbe599c82a1b63b8 |
| vocagoyangebs2027.html | 172f9984d2b339797832ad2749a9289a8e642b298b60c6786460f4a07475723b |

[교재 선택](https://esqsoy.github.io/vocagoyang/?release=cadd4fb) · [FABLE](https://esqsoy.github.io/vocagoyang/vocagoyangfable.html?release=cadd4fb)

아래는 이전 배포 기록이다.

---

# 마더텅 원문 발췌·문장 안 입력과 공통 발음 재생 · 2026-09-29

- 배포 커밋: [`b72f72376848a42c72229b66b1bd60c76f8e5a26`](https://github.com/esqsoy/vocagoyang/commit/b72f72376848a42c72229b66b1bd60c76f8e5a26). `origin/main`에 푸시 완료.
- [GitHub Pages 실행 36531512560](https://github.com/esqsoy/vocagoyang/actions/runs/36531512560): `completed / success`, 2026-09-29 15:32 KST 확인.
- 마더텅 6,498카드 중 6,422카드에 원문 발췌를 연결하고 문장 안에 입력칸을 배치했다. 입력은 표제어 기준이고 공개 시 원문 어형을 복원한다. 나머지 76카드는 단어형으로 유지한다. 227개 필수 주석은 고양이 대사에 표시한다.
- FABLE·마더텅·EBS에서 공개된 정답 단어를 누르면 음성과 IPA 효과를 다시 재생한다. 해설칸의 정적 IPA는 제거하고 기존 FABLE 해설은 유지했다.
- UI 표준, 작업 지침, 최신 인수인계와 누적 작업 기록을 저장소에 포함했다. 흰색 밝기 실험·후속 디자인·PDF 전체·OCR·로컬 점검 도구는 포함하지 않았다.
- 빌드 일치, 발췌·입력·발음·재생·데이터 및 기록 보존, EBS 입력, FABLE 7,344회 모의 플레이까지 관련 검사 10개 명령 통과. [검사 목록](HANDOFF.md).
- 공개 인덱스와 세 게임 파일을 HTTP 200으로 받아 로컬 검증본과 비교했다. 아래 SHA-256은 UTF-8 텍스트의 줄바꿈을 LF로 통일해 계산했다.

| 파일 | 공개 내용 SHA-256 |
| --- | --- |
| `index.html` | `f45e4e3549829f8e0ac77d394c8808b9cfe8451561e8d89d20391a4591151372` |
| `vocagoyangfable.html` | `c20fee7d8cc89c7ad9cf69c99ead83acf39095b2f8be72ff5131c6fbd0fea858` |
| `vocagoyangksat2027.html` | `9c6185bf930f71a8537c2f386d408b42af280d326c88339833c406a0826be4fa` |
| `vocagoyangebs2027.html` | `c3405c6fc29b34f7bb7f5ce8a66a00ed1996fac80c8c029ae2e794c99df1a098` |

공개 페이지: [교재 선택](https://esqsoy.github.io/vocagoyang/), [마더텅](https://esqsoy.github.io/vocagoyang/vocagoyangksat2027.html?release=b72f723), [FABLE](https://esqsoy.github.io/vocagoyang/vocagoyangfable.html?release=b72f723), [EBS](https://esqsoy.github.io/vocagoyang/vocagoyangebs2027.html?release=b72f723).

아래는 이전 배포 기록이다.

---

# 세 과정 예문을 흰색으로 조정 · 2026-09-29

- FABLE·마더텅·EBS의 영어 예문 `.hoectx .ex`를 연분홍 `#f6e2ec`에서 흰색 `#ffffff`로 변경했다.
- 해설 본문은 원래 흰색이며 그대로 유지했다. 번역·발음·정답 강조·배경·크기는 변경하지 않았다.
- 브라우저에서 예문과 상위 요소의 opacity 1, filter none을 확인하고 변경 후 흰색 표시를 검증했다.
- 어휘 데이터·진도·음성 보존, IPA 빌드 동기화, 두 내용 검수의 회귀검사 통과. 과거 UI 해시는 기록된 이번 색 변경만 역변환해 보존한다.
- 배포 전 기준은 `689d1d0`다.

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 동의어 안내 명확화 · 2026-09-29

- 해설 221개에서 같은 뜻으로 바꿔 쓰는 관계를 분명히 밝혔다. 의미가 다른 경우에는 차이를 설명한다.
- 새 대체 정답을 추가하지 않았다. 익숙한 동의어 대신 해당 표제어를 익히는 학습 목적을 작업 기준에 기록했다.
- 예문·번역·어휘 구성·IPA·UI·진도·기존 정답 규칙은 동일하다. 11개 검사 명령 통과.
- 배포 전 기준은 `de20aad`. [수정 결과](pipeline/synonym-wording-20260929/REPORT.md), [전체 변경](pipeline/synonym-wording-20260929/findings.json).

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 유의어·예문 전수 검수 · 2026-09-29

- 51세트·6,876카드 전량 재독해. 441카드의 예문 40개·번역 43개·해설 407개를 교정했다.
- 새 대체어는 해설에만 안내한다. 기존 정답·단어·뜻·카드 순서·612연습·UI·IPA·완료/이어하기 기록은 동일하다.
- 11개 검사 명령 통과. 7,344회 모의 플레이·1,336개 결합 입력 경로와 원본/HTML 동기화·과거 기준 보존 확인.
- 마더텅·EBS는 수정하지 않았다. 배포 전 기준은 `09ce564`다.
- [검수 보고서](pipeline/synonym-review-20260929/REPORT.md), [전체 변경 기록](pipeline/synonym-review-20260929/findings.json).

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 학생 이스터에그 · 2026-09-28

- corner 고양이 대사: “꼭 자습실 corner에서 공부하는 사람이 있다고양!”
- artist 예문: “Painters, writers, and pianists are all artists.” 번역: “화가도, 작가도, 피아니스트도 모두 예술가야.”
- 두 카드의 세 필드만 수정했다. 전체 6,876카드와 UI·게임 코드·기존 기록은 유지한다. 발음 효과 시제품은 별도 로컬 작업이다.
- reading-core, pool-expansion, session, keyboard 검사 통과. 원본과 생성 DATA의 일치 및 기록된 변경 외 불변을 확인했다.
- 변경 기록: [player-feedback-20260928.json](pipeline/player-feedback-20260928.json). 배포 전 기준은 ab2f0461233b4dcc08c7955d3f55e94a07139363이다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# 마더텅·EBS 최종 Fable UI 적용 · 2026-09-28

- 마더텅과 EBS의 입력칸·첫 글자 힌트·고양이 대사 위치·시간 막대·정답 공개·클리어 효과를 완성된 Fable UI에 맞췄다.
- 마더텅 상단 제목·2026/전체 선택과 기존 발음 자료를 유지한다. EBS에 새로운 발음 자료는 추가하지 않았다.
- 교재 원본 DATA와 저장 기록 주소를 유지했다. 마더텅 521연습·6,498카드, EBS 48연습·597카드. 지문별 연습을 쪼개거나 재배열하지 않았다.
- 검사 4종 통과. 두 교재 7,095카드의 문자 입력과 IME·따라쓰기·저장 기록·힌트·콤보를 확인했다. 브라우저에서 작은 화면 줄바꿈·정답 위치·장미 효과를 확인했다.
- 원본 백업 두 개를 남겼다. Fable과 교재 선택 파일은 변경하지 않았다. PDF 예문 발췌 작업은 후속으로 진행한다.
- [변경·검증 상세](pipeline/textbook-ui-20260928/README.md). 배포 전 기준은 c0e5b5e5fec3ac094c0f87c1b417080a55ff0f56다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangksat2027.html 및 https://esqsoy.github.io/vocagoyang/vocagoyangebs2027.html

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 해설 문장·군더더기 전수 검수 · 2026-09-27

- 51세트·6,876카드 전체를 확인했다. 해설 481곳을 수정했으며 앞선 topic/subject 3곳을 포함해 총 484카드가 바뀐다.
- 독립된 내용을 단문으로 나누고 막연한 동의어 연결·학습 독려·무관한 설명을 줄였다. 7카드는 해설만 지웠다. 어원 원문과 실제 쓰임의 차이는 유지한다.
- 해설 필드만 바뀌었다. 단어·예문·순서·51세트·612연습·6,876카드·UI·게임 코드·기존 완료/이어하기 키는 그대로다.
- 기존 검사 8종 통과: 모의 플레이 7,344회, 결합 입력 1,336경로, 과거 진도 승계 및 현재 원본 동기화 확인.
- [검수 결과](pipeline/explanation-clarity-20260927/REPORT.md), [전체 전후 문구](pipeline/explanation-clarity-20260927/findings.json), [검증 결과](pipeline/explanation-clarity-20260927/validation.json).
- 배포 전 기준은 b99dd9bfdb39806a1319d5c71448723bf03df324다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 HTML 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 장미·하트 효과와 퍼펙트 연습 콤보 · 2026-09-27

- 본문 하트는 약 20% 크게, 재생 시간은 8% 짧게 조정했다.
- 클리어 후 오답을 누르면 빨간 장미 한 송이와 넓어진 네 가지 꽃비가 순환한다. 중앙 장미 뒤에는 짧고 옅은 비너스 실루엣이 나타난다.
- 연습을 연속 퍼펙트로 완료하면 색이 바뀌고 PERFECT ×N과 한 글자씩 길어지는 울음소리가 나타난다. 일반 완료·중도 포기 시 초기화하며 페이지를 열어 둔 동안만 유지한다.
- 검사 8종 통과. 모의 플레이 7,344회와 결합 표현 입력 1,336경로, 신규 퍼펙트 콤보 상태 전환을 확인했다. 51세트/612연습/6,876카드와 기존 저장 기록은 유지한다.
- [변경·검증 상세](pipeline/effects-ui-20260927/README.md). 체험용 UI는 제외했고 마더텅·EBS·교재 선택 페이지는 수정하지 않았다.
- 되돌리기 기준: 1f1e947198cb99d56ac424d85925f298bb2ef883. 새 '장미의 탄생' 구상은 향후 본문 클리어 효과를 위한 별도 과제로 남겼다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 전체 내용 검수·어휘 풀 보완 · 2026-09-27

- 앞선 전수 검수의 175카드·195필드 교정을 반영했다. 뜻·예문·번역·해설과 대표 카드 43장의 어원 풀이를 보완했다.
- 승인된 17카드를 추가하고 tyre/tire, 법적 의미 proceedings/proceeding의 중복 2카드를 통합했다. tempt 두 카드는 유지했다.
- 51세트 / 612연습 / 6,876카드. 기존 표제어 옆에 새 뜻을 넣고 뜻 번호를 보존했다. 새 대조 표현도 같은 실제 연습에 모았다.
- 구성이 바뀐 원본 16묶음(22개 플레이 연습)만 새 완료 키를 쓴다. 이전 완료만으로 새 내용을 건너뛰지 않으며 저장 데이터를 지우지 않는다. 나머지 기록은 유지한다.
- 검사 8종 통과: 모의 플레이 7,344회, 기존 결합 입력 1,336경로, 신규 어휘·입력·기록 승계와 과거 기준 복원 검사. UI·게임 코드와 마더텅·EBS·교재 선택 화면은 그대로다.
- [전체 변경 내용](pipeline/pool-expansion-20260927/REPORT.md), [검증 결과](pipeline/pool-expansion-20260927/validation.json). 배포 전 공개 기준은 7f38a095f1556dc6f2a4b506e8d1bbcc72dacacd다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 시간바·주제별 연습·해설 정리 · 2026-09-27

- 위 시간바의 기본색과 중간 경고색을 연보라색 `#b8a2d4`로 통일했다. 남은 시간 25% 미만에서는 탁한 빨간색 `#b97882`로 바뀐다. 노란색 단계는 없애고 기존 시간 계산·전환 속도와 아래 진도바·대사 색은 유지했다.
- 0세트의 6개 주제 묶음, 13개 연습 경계를 조정했다. 요일 7개와 월 12개를 각각 묶고 수사·가족/직업·읽기/쓰기·음식·감정/성질의 경계를 정리했다. 10~12카드는 기본 목표이며 의미 있는 묶음은 최대 15카드로 유지한다.
- 기존 March·May의 달 의미를 0세트 복습용으로 보충했다. 원래 3·5세트의 다의어 카드는 그대로다. 전체 51세트 / 612연습 / 6,861카드다.
- 기존 완료·이어하기 기록은 카드 범위에 맞춰 이어받는다. 새 월 연습에는 March·May가 추가됐으므로 예전 완료 기록만으로 자동 완료되지 않는다. 저장 기록은 삭제하지 않는다.
- 해설 전수조사의 341개 편집과 후속 강세 해설 63개 편집을 포함했다. 불필요한 학습 지시·빈도 강조를 줄이고, 단순 강세 안내는 짧게, 의미·품사별 강세 차이는 구체적으로 남겼다. 두 편집 건수는 겹치는 카드를 포함한 작업 이력이다.
- 기존 검사 7종 통과: 모의 플레이 7,344회, 결합 표현 입력 1,336경로, 기존 기록 조합 3,050건·혼합 기록 16,294건, 새 주제 경계 완료 64조합·이어하기 13위치. 별도 검토에서도 카드 누락·표제어 분할은 발견되지 않았다.
- 마더텅·EBS·교재 선택 화면은 변경하지 않았다. 되돌리기 기준은 `4c993cca763be5f8deb688e06337352aa800fcb9`다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 결과와 공개 파일로 확인한다. 아래는 이전 배포 기록이다.

---

# Fable 입력·피드백 UI 개선 · 2026-09-27

- 사용자가 승인한 로컬 시험판의 기본 레이아웃을 반영했다. 상단에 작은 여백을 두고, 고양이 대사와 정답 공개 전후의 글자·뜻 위치를 유지한다. 시험용 제목 비교와 테스트 조작 화면은 배포 파일에서 제외했다.
- 정답을 별도로 크게 반복하지 않고 본문의 입력칸에 채운다. 발음기호는 해설 문단 앞에 이어 쓰며, 발음기호를 누르거나 키보드로 선택해 발음을 다시 들을 수 있다.
- 모든 입력칸은 넓은 글자 W 기준으로 같은 폭을 쓴다. 글자별 폭 측정이나 확대·축소 계산은 없다. 공백과 문장부호, 따라쓰기 및 IME 입력 처리는 유지한다.
- 별도 힌트 버튼 대신 첫 입력칸을 누르면 첫 글자만 한 번 공개한다. 추가 클릭으로 단어 절반이 열리던 두 번째 힌트를 제거했다. 힌트만으로 자동 제출하지 않으며 기존 힌트 사용 기록은 유지한다.
- 51세트 / 612연습 / 6,859카드 및 기존 저장 키는 그대로다. 마더텅·EBS·교재 선택 화면은 변경하지 않았다.
- 기존 검사 7종 통과: 키보드·공백·전치사 결합 입력 1,336경로, 모의 플레이 7,344회, 내용·어근·기록 이전 검사. 입력 테스트의 HTML 파서와 DOM 스텁만 새 칸 구조에 맞췄다. 브라우저에서 320/390px의 위치 유지, 첫 칸 힌트, 정답 및 따라쓰기 입력을 확인했다. nineteen 재클릭은 n만 유지하고 나머지 입력으로 정상 채점한다.
- 되돌리기 기준: 이전 공개 커밋 `4b6807f059c179784135148438a8ff2ef422b8fc`. 로컬 시험판에도 원본과 각 단계별 백업을 보관했다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

실제 공개 상태는 GitHub Pages 배포 결과와 공개 URL에서 확인해야 한다.

## Fable beach 예문 구분 · 2026-09-25

- beach 예문을 `We played {{BLANK}} volleyball on the sand.`로 교체했다. 번역은 '우리는 모래 위에서 비치발리볼을 했어.'다.
- shore 허용 답을 제거했다. [beach volleyball](https://dictionary.cambridge.org/dictionary/english/beach-volleyball)이라는 종목명으로 두 단어를 구분하고, 차이는 해설로 설명한다.
- shore는 18세트 Exercise 2 · 1711~1720에 독립 표제어로 유지한다. 연습 구성과 기록 키는 동일하다.

## Fable beach / shore 허용 답 · 2026-09-25 (아래 변경은 위 예문 교체로 대체됨)

- 0세트 beach의 `We swam at the {{BLANK}} all day.`에서 shore도 정답으로 인정한다. 해당 카드의 acceptedAnswers로 한정한다.
- 예문은 유지하고, beach는 모래·자갈이 있는 해변이고 shore는 바다·호수 등의 물가를 넓게 가리킨다는 차이를 해설에 넣었다. [Cambridge beach](https://dictionary.cambridge.org/dictionary/english/beach), [Cambridge shore](https://dictionary.cambridge.org/dictionary/english/shore).
- beach·shore 입력 검사 통과. 기존 배포와 비교해 이 카드의 해설·허용 답만 변경한 것을 확인했다. 연습 구성과 기록 키는 동일하다.

## Fable 11카드 중심 연습 · 2026-09-25

- 51세트 / 613연습 / 6,886카드. 평균 11.2카드, 575연습(약 94%)이 8~15카드다. 짧은 주제·표제어 경계에 따른 38연습은 4~7카드로 유지한다.
- 11카드를 중심으로 하되 같은 표제어는 나누지 않는다. 14~15장은 한 판으로 유지하고 22장은 11+11, 24장은 12+12로 구성한다. get의 6뜻은 like·no·time과 함께 12카드로 유지한다.
- 원본 520묶음 중 91개만 분할한다. 카드 내용·순서·별도 주제에서의 재학습 구성은 유지한다.
- 원래 큰 묶음의 완료 기록은 그대로 인정한다. short-v1과 heads-v2의 완료 카드 범위도 합쳐서 이어받으며, 새 연습 전체를 덮어야 완료로 표시한다. 기록 초기화는 하지 않는다. 미완료 카드가 함께 합쳐진 연습은 다시 완료해야 한다.
- 모의 플레이 7,356회, short-v1 완료 조합 3,054건, 두 분할판의 기록 조합 15,622건, 이전 3종 위치와 새 위치의 이어하기를 검사했다. 7종 내용·입력·진도 검사도 통과했다. 브라우저에서 613연습 표시, 첫 연습의 11카드 구성, 정답 입력 후 1/11 진행과 다음 카드 이동을 확인했다.
- 마더텅·EBS·교재 선택 페이지는 변경하지 않았다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

아래는 이전 분할 방식의 배포 기록이다.

## Fable 표제어를 보존하는 짧은 연습 · 2026-09-25

- 51세트 / 931연습 / 6,886카드. 한 주제 안에서 같은 표제어의 뜻을 여러 연습에 나누던 170곳을 해결했다.
- 8카드는 권장 분량이며 다의어를 모으는 조건이 우선한다. 6~8카드가 721연습이며, 전체 범위는 4~13카드다. 12카드 3연습·13카드 1연습 외에는 모두 11카드 이하다.
- get 6뜻은 like·no·time과 함께 1세트 Exercise 1-1의 12카드에 모았다. subject 8뜻은 다른 표제어와 함께 13카드에 배치했다. 한 답안만 반복하기 쉬운 조각도 줄인다.
- 원본 카드·순서·기존 주제별 재학습 구성은 그대로다. 520개 원본 묶음 중 386개를 나누고 134개는 유지한다.
- 기존 큰 묶음의 클리어는 유지한다. 첫 분할판의 기록은 새 연습을 이루는 모든 옛 부분이 완료됐을 때만 인정한다. 기록은 삭제하지 않으며, 카드가 추가로 합쳐진 일부 연습은 미완료로 표시될 수 있다. 첫 분할판 이어하기는 카드가 겹치는 위치로 연결한다.
- 11,172회 모의 플레이, 표제어 분할 금지, 첫 분할판 완료 조합 4,490건, 과거 위치 536개·첫 분할판 위치 1,079개·새 위치 931개의 이어하기를 검사했다. 브라우저에서 get 연습의 12카드 표시·실제 정답 입력을 확인했다.
- 마더텅·EBS·교재 선택 페이지는 변경하지 않았다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

아래는 이전 분할 방식의 배포 기록이다.

## Fable 짧은 연습 첫 분할판 · 2026-09-25

- 51세트 / 1,079연습 / 6,886카드. 기존 520개 주제 묶음 중 489개를 나누고 31개는 유지했다.
- 한 연습 4~8카드. 분포: 4카드 13개, 5카드 159개, 6카드 438개, 7카드 341개, 8카드 128개.
- 원본 카드·주제·순서는 유지한다. 같은 주제 안에서 부분별 분량 차이가 최대 1카드가 되도록 나눈다.
- 기존 클리어는 해당 묶음의 모든 부분에 적용하며 새 클리어는 부분별로 저장한다. 기록 초기화는 없다. 예전 이어하기는 해당 묶음의 첫 미완료 부분으로 연결된다.
- 12,948회 모의 플레이, 원본 520묶음의 완료 상속, 과거 위치 536개와 새 위치 1,079개의 이어하기, 부분별 저장·다음 연습·전체 완료를 검사했다. 기존 내용·키보드·공백·전치사 입력 검사도 통과했다.
- 375px 브라우저에서 목록의 분할 번호·카드 수, 8카드 플레이의 정답 입력·다음 카드 전환을 확인했다.
- 마더텅·EBS·교재 선택 페이지는 변경하지 않았다.

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

아래는 이전 최초 공개 업데이트의 기록이다.

## Fable 공개 업데이트 · 2026-09-19

배포 대상: https://esqsoy.github.io/vocagoyang/vocagoyangfable.html

- 51세트 / 521연습 / 6,907카드.
- 기존 어휘 뜻·예문·해설 검수, 후반 46~50세트 재구성.
- 출제 순서, 입력 포커스, IME 보호, 공백 표시 보완.
- 공백 포함·생략 답안을 모두 인정.
- Mother Tongue·EBS·교재 선택 화면은 이번 배포 대상에 포함되지 않음.

검사 7종 결과는 pipeline/tests/release-20260919.json에 보관한다. 해당 검사를 모두 통과한 앱을 배포 대상으로 삼았다. 원본 및 후속 작업은 WORK_PLAN.md를 참고한다.

Git 저장 내용(LF)의 HTML SHA-256: 4aa6e2905205ff812d1e3225e5e228aa1729e45c09e550efcacb7fac38fb2823

실제 공개 상태는 GitHub Pages 배포 결과와 공개 URL에서 확인해야 한다. 이 문서 자체는 호스팅 성공을 보장하지 않는다.
