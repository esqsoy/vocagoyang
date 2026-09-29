# 보카고양 최신 인수인계

갱신: 2026-09-29 KST. 다음 작업은 이 문서와 `git status`를 함께 확인하고 시작한다. 오래된 상태를 누적하는 대신 이 문서는 최신 상태로 교체하고, 경위는 [WORK_LOG.md](WORK_LOG.md)에 남긴다.

## 현재 결론과 배포 상태

- 사용자가 마더텅 원문 발췌와 문장 안 입력 방식을 플레이하고 승인했다. **예문 있음 → FABLE 문장 안 입력 / 예문 없음 → 마더텅 독립 입력**을 모든 과정의 표준으로 확정했다. 자세한 기준은 [UI_STANDARD.md](UI_STANDARD.md).
- 세 과정의 정답 단어 터치로 음성·IPA 효과를 재생하고 해설칸에서 발음기호를 제거하는 변경까지 로컬에 구현했다. 마더텅의 짧은 필수 해설은 고양이 대사로 옮겼다.
- 사용자가 지금까지의 승인된 작업 전체를 배포해 달라고 요청했다. 관련 검사 10개가 모두 통과했으며 커밋·푸시·공개 확인을 진행한다. 배포 결과는 확인 후 이 문서와 DEPLOYMENT에 기록한다.
- 확인한 체크아웃: `codex/fable-upgrade-20260919`, HEAD `0124bd6` (`Use crisp white example text across vocabulary courses`). 이 값은 현재 로컬 기준이며 새 온라인 배포 확인을 뜻하지 않는다.
- 저장소: `https://github.com/esqsoy/vocagoyang.git`. 공개 사이트는 `https://esqsoy.github.io/vocagoyang/`. 배포 이력은 [DEPLOYMENT.md](DEPLOYMENT.md).

## 마더텅 발췌 적용 범위

17단원·521 exercise·6,498카드의 기록을 정리했다. 6,422카드는 실제 발췌를 사용한다. 원문 오류·빈칸 등으로 보류한 31카드와 단독 어휘 출처 45카드는 기존 단어형으로 유지한다. 총 76카드이며 삭제한 단어는 없다. 발췌의 필수 주석은 227개, 문맥에 맞춘 뜻 보완은 32개다.

표제어로 입력하고 공개 때 원문 어형을 복원한다. 반복된 단어와 떨어진 구 표현도 정답 공개 때 원문대로 복원한다. 원문 DATA·단어 순서·연습 경계·기록 키는 유지했다. 기록별 상태와 사유는 [records.jsonl](pipeline/mother-tongue-excerpts/records.jsonl)에 있다. `manifest.json`의 `reviewed: 6467`에는 단독 어휘 출처 45개도 포함된다. 실제 예문 수는 빌더의 `excerpts`와 HTML의 `MT_CONTEXTS`를 기준으로 집계한다.

## 고쳐야 하는 원본

| 작업 | 원본 / 반영 방법 |
| --- | --- |
| FABLE 단어·예문·해설 | `pipeline/out/lesson00~04.json`, `set05~45.json`; 46은 `reading-core.json`, 47·48은 `morphology.json`, 49·50은 `connections.json`. `python pipeline/assemble.py`로 반영. [파이프라인 안내](pipeline/README.md) 참조. |
| 마더텅 발췌·해석·최소 주석 | `pipeline/mother-tongue-excerpts/records.jsonl`. 표제어·카드 식별자는 원본 카드와 일치시킨다. |
| 마더텅 문장 안 입력·표시 | `pipeline/mother-tongue-excerpts/runtime.js`, `style.css`. `node pipeline/mother-tongue-excerpts/build.cjs`로 HTML의 해당 구간을 갱신한다. |
| 공통 IPA·단어 터치 재생 | `pipeline/ipa-effects/runtime.js`, `styles.css`. `node pipeline/ipa-effects/build.cjs`로 세 HTML에 반영한다. 발음 자료도 바꿀 때의 생성 순서는 [IPA 안내](pipeline/ipa-effects/README.md) 참조. |
| 각 과정 게임과 공통 기능 연결 | `vocagoyangfable.html`, `vocagoyangksat2027.html`, `vocagoyangebs2027.html`의 생성 구간 밖 코드. 연결 함수는 공통 빌더가 만들어 주지 않으므로 함께 확인한다. |

원문 PDF와 전체 OCR은 로컬 참고 자료다. 저장소에는 검토한 발췌 데이터와 코드만 둔다. OCR 텍스트를 원문 검증 없이 확정하지 않는다.

## 배포 전 재검증 · 2026-09-29

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

- 이번에 요청받은 공개 배포를 진행 중이다. 푸시와 공개 파일 확인을 마치면 이 항목을 갱신한다.
- `textTone=soft`의 흰색 밝기 실험: 사용자가 휴식 후 판단하기로 보류했다. 현재 표준에 반영하지 않는다.
- 발췌 없는 76카드는 단어형으로 유지한다. 문장을 억지로 만들지 않고 후속 피드백이 있을 때 검토한다.
- FABLE은 사용자 플레이 피드백에 따른 유지 보수 단계다. 간격 복습은 연구·설계부터 후속 진행한다.
- 비너스·장미 분수 참고 이미지의 새로운 본문 클리어 효과는 별도 후속 디자인 과제다.

`pipeline/__pycache__/`, `pipeline/synonym-review-20260929/baseline-data.json`, `root-review.cjs` 등 기존 미추적 작업도 있다. 현재 요청과 무관한 파일을 임의로 삭제하거나 전부 묶어 커밋하지 않는다. 다음 시작 때의 실제 `git status`를 우선한다.
