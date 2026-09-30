# 보카고양 최신 인수인계

갱신: 2026-10-01 KST. 다음 작업은 이 문서와 `git status`를 함께 확인하고 시작한다. 오래된 상태를 누적하는 대신 이 문서는 최신 상태로 교체하고, 경위는 [WORK_LOG.md](WORK_LOG.md)에 남긴다.

## 현재 결론과 배포 상태

- **2026-10-01 전체 업데이트 배포 진행 중**: 사용자가 누적 변경의 공개 반영을 승인했다. 어원·접미사·troublesome·word family 표기, 월 해설, 세 과정 IPA 완료 처리, 인덱스 집계를 함께 배포한다. 배포 전 관련 검사 19개가 통과했으며 공개 확인은 아직 전이다. 아래의 로컬·미배포 설명은 이번 배포 직전 상태다. 최종 결과는 배포 확인 뒤 갱신한다.

- **2026-10-01 인덱스 집계 자동화 로컬 완료, 미배포**: 수동 숫자를 실제 세 과정 DATA 기준으로 갱신했다. FABLE 등록 표제어 4,916개, 마더텅 중복 제외 추가 3,238개·누적 8,154개, EBS 추가 129개·누적 8,283개다. 구 표현과 이전 기출을 포함하며 word family 수는 아니다. FABLE 조립·마더텅 발췌·공통 IPA 빌드에 `pipeline/index-stats.cjs`를 연결했다. `--check`는 오래된 인덱스도 검출한다. 원본 JSON만 고쳤다면 해당 데이터 빌드부터 실행한다. [집계 기준·명령](pipeline/README.md#인덱스-단어-수-자동-갱신). 게임 데이터·진도는 바꾸지 않았다.

- 2026-10-01 표현 선호: 어휘 관계의 명칭은 영어 소문자 **word family**로 통일했다. 48세트 제목은 ‘어근과 word family’다. 관련 연습 제목·해설·메타데이터와 현재 기준 문서를 정리했다. 이름이 바뀐 3연습의 이전 완료·이어하기는 유지된다. morphology-content, suffix-expansion, IPA build --check와 해당 3연습의 완료·미완료 이어하기를 확인했다. 과거 검수 원장은 바꾸지 않았으며 이번 용어 수정도 로컬 미배포 상태다. 이 항목의 검사는 troublesome 추가 전에 확인한 결과다.

- **접미사·word family 후속 보강 로컬 완료, 미배포**: 기존 어원 327카드를 모두 유지하고 기존 표제어 복습 25카드와 승인된 새 표제어 6카드를 더해 총 **358카드·141개 개념 단위**다. 47세트 124카드·12연습, 48세트 234카드·22연습, 전체 FABLE **7,067카드·620연습**이다. 기존 해설 11개를 보완했다. 새 표제어는 biome·microbiome·genome·chromosome·ribosome·troublesome이다. awesome만으로는 접미사의 느낌이 잘 와 닿지 않는다는 사용자 의견과 명시적 추가 승인을 반영해 47세트 Exercise 11의 같은 -some 단위에 troublesome 1카드를 추가했다. [결과·보존 원장](pipeline/suffix-rebuild-20261001/REPORT.md).
- 선행 357카드 개편에서 47·48의 기본 진도키를 `morphology-47-20261001`, `morphology-48-20261001`로 바꿨으며 과거 저장 기록은 삭제하지 않았다. 이번 troublesome 1카드 추가에서는 **47세트 Exercise 11만** `morphology-47-20261001-troublesome`으로 바꾼다. 이 연습의 이전 완료만으로 새 카드를 완료 처리하지 않으며, 나머지 어원 33연습의 진도키·기록은 그대로 유지한다. 전체 과정의 진도를 다시 초기화하는 변경이 아니다.
- **세 과정 공통 IPA 완료 처리도 로컬 수정**: TTS의 정상 `onend`가 빨리 오면 아직 실행되지 않은 음절 표시 타이머가 취소되어 일부 IPA가 보이지 않을 수 있는 경로를 재현해 고쳤다. 미표시 음절이 있을 때만 나머지를 전부 표시하고 180ms 유지한 뒤 기존 250ms 사라짐 처리를 이어간다. 수동 건너뛰기는 즉시 종료한다. 이는 코드에서 확인한 결함이며 사용자가 처음 본 현상의 정확한 원인까지 확정한 것은 아니다.
- 위 후속 보강과 공통 IPA 수정은 **아직 커밋·푸시·공개 배포하지 않았다**. 앞선 327카드 보강과 아래 월 해설 수정도 같은 미배포 변경에 포함된다. 공개 앱 기준은 여전히 `b72f723`이다.
- 선행 어원 보강 이력: 기존 167카드 + 기존 표제어 복습 123카드 + 승인된 새 표제어 37카드 = 327카드였다. 그때의 47은 101카드·10연습, 48은 226카드·22연습, 전체는 7,036카드·618연습이다. 이 수치는 현재 구성이 아니라 후속 보강의 보존 기준이다. [선행 결과·출처](pipeline/morphology-rebuild-20260930/REPORT.md).
- 2026-09-30 로컬 수정: FABLE September의 한국·영미권 개학 비교를 간결하게 쓰고, September~December 해설에 라틴어 septem=7·octo=8·novem=9·decem=10과 3월부터 세던 옛 로마력의 순서를 덧붙였다. 4개 해설만 변경했고 원본과 HTML에 반영했다. 아직 커밋·배포하지 않았으며 변경 기록은 `pipeline/player-feedback-20260930.json`이다.
- 사용자가 마더텅 원문 발췌와 문장 안 입력 방식을 플레이하고 승인했다. **예문 있음 → FABLE 문장 안 입력 / 예문 없음 → 마더텅 독립 입력**을 모든 과정의 표준으로 확정했다. 자세한 기준은 [UI_STANDARD.md](UI_STANDARD.md).
- 세 과정의 정답 단어 터치로 음성·IPA 효과를 재생하고 해설칸에서 발음기호를 제거하는 변경까지 배포했다. 마더텅의 짧은 필수 해설은 고양이 대사로 옮겼다.
- 사용자 요청에 따라 승인된 작업과 문서를 커밋 `b72f723`으로 `origin/main`에 푸시했다. 관련 검사 10개 통과 후 GitHub Pages 실행 `36531512560`의 성공과 인덱스·세 과정 공개 HTML의 내용 일치를 확인했다. [배포 기록](DEPLOYMENT.md)을 참고한다.
- 로컬 작업 브랜치는 `codex/fable-upgrade-20260919`다. 공개 앱 기준 커밋은 `b72f723`이며, 이후 배포 결과를 기록하는 문서 커밋은 게임 HTML을 바꾸지 않는다. 다음 작업 때 최신 HEAD와 원격 상태를 다시 확인한다.
- 저장소: `https://github.com/esqsoy/vocagoyang.git`. 공개 사이트는 `https://esqsoy.github.io/vocagoyang/`. 배포 이력은 [DEPLOYMENT.md](DEPLOYMENT.md).

## 마더텅 발췌 적용 범위

17단원·521 exercise·6,498카드의 기록을 정리했다. 6,422카드는 실제 발췌를 사용한다. 원문 오류·빈칸 등으로 보류한 31카드와 단독 어휘 출처 45카드는 기존 단어형으로 유지한다. 총 76카드이며 삭제한 단어는 없다. 발췌의 필수 주석은 227개, 문맥에 맞춘 뜻 보완은 32개다.

표제어로 입력하고 공개 때 원문 어형을 복원한다. 반복된 단어와 떨어진 구 표현도 정답 공개 때 원문대로 복원한다. 원문 DATA·단어 순서·연습 경계·기록 키는 유지했다. 기록별 상태와 사유는 [records.jsonl](pipeline/mother-tongue-excerpts/records.jsonl)에 있다. `manifest.json`의 `reviewed: 6467`에는 단독 어휘 출처 45개도 포함된다. 실제 예문 수는 빌더의 `excerpts`와 HTML의 `MT_CONTEXTS`를 기준으로 집계한다.

## 고쳐야 하는 원본

| 작업 | 원본 / 반영 방법 |
| --- | --- |
| 인덱스 표제어·중복 제외·누적 수 | 세 게임의 실제 DATA → `pipeline/index-stats.cjs`. 주요 빌드에서 자동 갱신. 독립 갱신·검사 명령과 집계 범위는 [파이프라인 안내](pipeline/README.md#인덱스-단어-수-자동-갱신) 참조. |
| FABLE 단어·예문·해설 | `pipeline/out/lesson00~04.json`, `set05~45.json`; 46은 `reading-core.json`, 47·48은 `morphology.json`, 49·50은 `connections.json`. `python pipeline/assemble.py`로 반영. [파이프라인 안내](pipeline/README.md) 참조. |
| 마더텅 발췌·해석·최소 주석 | `pipeline/mother-tongue-excerpts/records.jsonl`. 표제어·카드 식별자는 원본 카드와 일치시킨다. |
| 마더텅 문장 안 입력·표시 | `pipeline/mother-tongue-excerpts/runtime.js`, `style.css`. `node pipeline/mother-tongue-excerpts/build.cjs`로 HTML의 해당 구간을 갱신한다. |
| 공통 IPA·단어 터치 재생 | `pipeline/ipa-effects/runtime.js`, `styles.css`. `node pipeline/ipa-effects/build.cjs`로 세 HTML에 반영한다. 발음 자료도 바꿀 때의 생성 순서는 [IPA 안내](pipeline/ipa-effects/README.md) 참조. |
| 각 과정 게임과 공통 기능 연결 | `vocagoyangfable.html`, `vocagoyangksat2027.html`, `vocagoyangebs2027.html`의 생성 구간 밖 코드. 연결 함수는 공통 빌더가 만들어 주지 않으므로 함께 확인한다. |

원문 PDF와 전체 OCR은 로컬 참고 자료다. 저장소에는 검토한 발췌 데이터와 코드만 둔다. OCR 텍스트를 원문 검증 없이 확정하지 않는다.

## 현재 로컬 검사 · 2026-10-01

전체 배포 요청 후 새로 실행한 19개 검사 모두 통과: index-stats, morphology-content, morphology-expansion, suffix-expansion, reading-core, pool-expansion, session; IPA build --check, 마더텅 발췌 build --check; IPA completion·advance·layout·stress·host-hooks·conservation; answer-replay, textbook-ui, mother-tongue-excerpts, mother-tongue-layout. 현재 FABLE 620연습·7,440회 모의 플레이, 마더텅 6,498카드 입력·6,422발췌, EBS 597카드 입력과 세 과정의 발음 완료·재생을 검증했다. 역사적 단계 검사는 해당 단계 복원 후 보존을 확인하는 것이며, 그 출력의 이전 카드 수를 현재 수치로 해석하지 않는다.

troublesome 추가 후 morphology-content(358카드), 선행 단계 보존용 suffix-expansion, session(620연습·7,440회), IPA build --check를 실행해 통과했다. 새 카드는 47세트 Exercise 11에서 awesome과 함께 나오며 12장으로 구성된다. 실제 게임 함수로 이 연습만 새 카드 학습을 위해 미완료가 되고 나머지 619연습의 완료·이어하기가 유지됨을 확인했다. IPA는 기존 마더텅 자료의 /ˈtrʌbəlsəm/을 Collins 미국식 표기와 대조했고 철자군 대응 생성도 확인했다. 아래는 추가 전 357카드 단계의 별도 검사 이력이다.

troublesome 추가 전 접미사 내용을 통합한 뒤 `pipeline/tests/morphology-content.test.cjs`(141개 단위), `suffix-expansion.test.cjs`, 과거 단계 보존용 `morphology-expansion.test.cjs`, `reading-core.test.cjs`, `pool-expansion.test.cjs`, `session.test.cjs` 및 `pipeline/ipa-effects/build.cjs --check`, `pipeline/ipa-effects/tests/conservation.test.cjs`를 실행해 통과했다. 당시 620연습의 **7,440회 모의 플레이**, 기존 327카드 보존과 복습 25장·신규 5장, 당시 620연습의 이어하기와 개편한 진도 키를 확인했다.

이번 작업의 앞선 IPA 수정 단계에서는 `pipeline/ipa-effects/tests/`의 completion·advance·layout·stress·host-hooks 및 `pipeline/test-answer-replay.cjs`를 통과했다. 그 뒤 접미사 내용만 추가 통합했으며 IPA 런타임은 다시 바꾸지 않았다. 브라우저에서는 실제 화면에 모의 TTS 완료 이벤트를 보내 photographic을 확인했다. 100ms에 완료된 경우 4음절 중 1개 표시에서 4개 표시로 복구되고 약 294ms에 진행했으며, 2,400ms 정상 완료 조건에서는 약 2,409ms에 진행했다. 이는 모의 이벤트 검증이며 사용자의 기기·음성에서 원래 문제의 원인을 특정한 결과가 아니다.

357카드 단계의 추가 카드 중 microbiome·ribosome은 320px 브라우저에서 예문·그리스어 해설·IPA 표시와 가로 넘침 없음, 경고·오류 로그 없음을 확인했다. 점검용 탭과 화면 폭 설정은 정리했으며 사용 중인 게임 탭은 새로고침하지 않았다. 선행 327카드 단계의 390px macroeconomics·320px heterogeneous 확인은 별도 이력이며 357카드 전체를 화면 검수한 것으로 계산하지 않는다.

과거 검사에 고정된 612연습은 이전 공개판의 진도 이행 기준이며, `morphology-expansion.test.cjs`의 327카드·618연습은 선행 로컬 단계의 보존 기준이다. 357카드 단계는 `suffix-expansion.test.cjs`로 별도 검사했다. 현재 358카드 단계에서는 새 카드와 47세트 Exercise 11의 진도 변경도 별도로 확인해야 한다. 역사적 해시를 새 데이터로 덮어쓰지 않는다.

## 이전 배포 전 재검증 · 2026-09-29

배포 요청 후 아래 10개 명령을 다시 실행했고 모두 통과했다. 다음 코드 수정에서는 영향에 맞는 검사를 선택한다.

```text
node pipeline/mother-tongue-excerpts/build.cjs --check
node pipeline/ipa-effects/build.cjs --check
node pipeline/test-mother-tongue-excerpts.cjs
node pipeline/test-mother-tongue-layout.cjs
node pipeline/test-mother-tongue-pronunciation.cjs
node pipeline/test-answer-replay.cjs
node pipeline/ipa-effects/tests/host-hooks.test.cjs
node pipeline/ipa-effects/tests/conservation.test.cjs
node pipeline/test-textbook-ui.cjs
node pipeline/tests/session.test.cjs
```

- 발췌 검사는 전체 카드 연결, 6,422개 예문, 원문 어형 복원·주석·오답 따라쓰기를 확인했다.
- 재생 검사는 세 과정의 클릭·키보드, 음소거, 자동 진행 대기와 하트 중복 방지를 확인했다. EBS 597카드 입력 검사와 FABLE 612연습·7,344회 모의 플레이도 통과했다.
- 앞선 구현 단계에서는 390px 브라우저에서 `blink` 입력 → 원문 `blinking`, 단어 터치 재생, 분리된 `make progress`의 오답 따라쓰기와 원문 복원, 넘침·스크립트 오류를 확인했다. FABLE·EBS의 재생도 확인했다.

## 이 컴퓨터에서 미리보기 이어가기

작업 폴더는 `C:/Users/Young/Documents/Codex/2026-09-18/new-chat`, Git 저장소는 그 아래 `work/release-20260919/repo`다. 다음은 이 컴퓨터의 편의 도구이며 저장소를 새로 복제하면 함께 생기지 않는다.

- `work/ipa-rollout-20260929/serve.cjs`: `http://127.0.0.1:8777/fable`, `/ksat`, `/ebs`에서 저장소 HTML을 직접 읽는다. `?qa=1`은 로컬 점검 도구다. 일반 HTML 파일명 경로를 모두 지원하는 서버는 아니다.
- `work/mother-tongue-excerpts-20260929/serve.cjs`: `http://127.0.0.1:8778/`에서 같은 폴더의 **preview.html 사본**을 읽는다. 저장소 HTML을 바꾸면 이 사본도 갱신해야 한다. `?review=1`은 점검용이다.
- 서버가 종료되었다면 작업 폴더에서 해당 파일을 `node`로 실행한다. 이미 쓰는 포트에 서버를 중복 실행하지 않는다.
- 사본 갱신은 작업 폴더에서 `Copy-Item -LiteralPath work/release-20260919/repo/vocagoyangksat2027.html -Destination work/mother-tongue-excerpts-20260929/preview.html`로 한다.
- 다른 환경에서는 저장소 루트에서 `python -m http.server 8780 --bind 127.0.0.1`로 열고 `/vocagoyangksat2027.html` 등 실제 파일명으로 접속할 수 있다. 사용 중이지 않은 포트를 선택한다.

초기 제작용 `work/mother-tongue-excerpts-20260929/build-preview.cjs`, `finalize.cjs`, `baseline.html`은 최신 원본이 아니다. 이 스크립트로 현재 파일을 다시 만들면 최근 입력 배치·발음 재생 개선을 덮어쓸 수 있다. 이후 수정은 위 표의 저장소 원본과 빌더를 사용한다.

PDF의 전체 OCR은 작업 폴더의 `outputs/mother-tongue-2027-source/`에 있다. 읽기용 합본은 `book-ocr-reading.txt`, 페이지별 텍스트는 `pages/`, 목차는 `chapter-index.json`이다. 원문 확인에 쓴 페이지 이미지는 `work/mother-tongue-pdf-study/rendered/`에 있다.

## 아직 결정하거나 진행하지 않은 일

- 2026-09-29 배포는 완료했다. 이후 어원·접미사 보강, 월 해설, 공통 IPA 완료 처리 수정은 로컬에만 있으며 공개 배포 요청 시 함께 검토한다.
- `textTone=soft`의 흰색 밝기 실험: 사용자가 휴식 후 판단하기로 보류했다. 현재 표준에 반영하지 않는다.
- 발췌 없는 76카드는 단어형으로 유지한다. 문장을 억지로 만들지 않고 후속 피드백이 있을 때 검토한다.
- 숫자 어근·micro/macro 및 접미사·word family 보강은 로컬에 완료했다. 사용자 플레이 피드백이 오면 다듬고, 배포 요청 시 위 미배포 변경의 검사·공개 반영을 진행한다.
- FABLE은 사용자 플레이 피드백에 따른 유지 보수 단계다. 간격 복습은 연구·설계부터 후속 진행한다.
- 비너스·장미 분수 참고 이미지의 새로운 본문 클리어 효과는 별도 후속 디자인 과제다.

`pipeline/__pycache__/`, `pipeline/synonym-review-20260929/baseline-data.json`, `root-review.cjs` 등 기존 미추적 작업도 있다. 현재 요청과 무관한 파일을 임의로 삭제하거나 전부 묶어 커밋하지 않는다. 다음 시작 때의 실제 `git status`를 우선한다.
