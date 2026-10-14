# 검증 범위·재현·한계

## 재현 대상

- main `74a6ddc4d32be73feb86bd7422759c45b9de7fcd`. 이 문서의 라인·수치·제안은 그 커밋 기준이다.
- 생성된 HTML의 DATA와 실제 `buildLessons()` 결과를 모두 읽었다. 원본 그룹 수와 플레이 연습 수를 혼동하지 않았다. 앱 기준 51세트, 780연습, 8,497카드, 6,198고유 표제어다.
- 직접 읽기 분담: 0~17 3,175장 / 18~34 2,599장 / 35~50 2,723장. 합계 8,497장. 런타임 이동 이후 세트 기준이다.
- `sn`은 뜻 개수, `si`는 뜻 번호다. 카드 위치는 `savedCardId`로 고정했다. 옛 번호가 남은 exercise key는 화면 표시 번호와 다를 수 있다.
- 자료 수집·실험 파일은 별도 작업 폴더에 만들었다. 배포 파일의 해시는 [application-hashes.json](evidence/application-hashes.json)에 남겼다. 원본 앱 파일은 변경하지 않았다.

## 실행한 검사

1. [초기 33개 테스트](evidence/checks-initial.json). 첫 실행 중 milestones만 Windows CRLF/LF 문자열 비교로 실패했다. 소스 오류로 세지 않았다.
2. [milestones 별도 재실행](evidence/milestones-retest.json): 읽은 UTF-8 문자열의 CRLF만 LF로 정규화하여 자식 프로세스까지 동일 조건으로 실행, 통과. 파일 자체는 바꾸지 않았다.
3. [추가 9개 검사](evidence/extra-checks.json): 6개 생성 구간 동기화, 교재 발음 관련 3개. 모두 통과. 총 36개 테스트와 6개 빌드 검사다.
4. [분리 복사본 전체 조립](evidence/build-audit.json): assemble 후 index·FABLE·마더텅·EBS 4개 HTML이 줄바꿈 정규화 기준 모두 원본과 동일했다.
5. session.test: 780연습 × 12시드 = 9,360세션. 섞기·동일 표제어 연속 방지의 끝 한 카드 예외·오답 재학습·종료 조건 통과.
6. [전체 줄 수](evidence/line-audit.json): Chromium 390/360px에서 각각 8,497예문. immigrant의 기존 4줄 한 건. 빈칸 포함 4줄 초과는 0. 이번 범위에서는 디자인 변경이나 자동 수정하지 않았다.
7. [최종 제안 검증](evidence/proposal-validation.json): 35장, 해설 72자·읽기량 12초/기능어 13초·빈칸·앞당긴 어휘 두 개 이상 검사. tilt의 풀 밖 어휘 1건을 조건부로 남겼다. 나머지 34장은 경고 없음.
8. [최종 제안 렌더](evidence/proposed-render.json): 35장 × 390/360px. 완성 문장 3줄, 빈칸 포함 4줄 기준 초과 0. 화면에서만 제안을 주입했으며 앱에 적용하지 않았다.
9. [실제 브라우저 동작](evidence/browser-review.json): B1 완료/전체 엔딩, 잘못된 철자 자동 제출, 마지막 오답과 다음 연습 경합, 구판 기록 접근, Testament 대문자.
10. [독립 반대검토](evidence/technical-counterreview.json), [실제 포인터와 620판 추가 재현](evidence/technical-countercheck.json): 마지막 오답→80ms→다음 버튼 클릭으로 이중 이동 확인. 빈 기록에서 620판 실행해 주기 중단 확인. 단순 DOM click이나 인위적인 meta 값만으로 생긴 결과가 아니다.
11. [동의어 런타임](evidence/synonym-runtime.json) 및 [독립 사전 재검토](evidence/synonym-counterreview.json): 12쌍 중 모두 별칭 미허용, 2쌍만 공통 대사 감지. 문맥 대체 가능성과 전역 동의어를 구분했다.
12. [35~50 문학 인용 69개 대조](evidence/quote-check-35-50.json): 문장부호·대소문자 정규화 후 원문과 일치. 이는 전체 책 인용을 이번에 모두 새로 대조했다는 주장이 아니다.

## 버그 재현 실행

Node, Git, Playwright와 Chromium이 있는 환경에서 저장소 루트 기준:

```text
node reviews/codex-20261015/repro/browser-review.cjs
node reviews/codex-20261015/repro/unlock-audit.cjs
node reviews/codex-20261015/repro/pace-rollover.cjs
node reviews/codex-20261015/repro/technical-countercheck.cjs
node reviews/codex-20261015/repro/render-proposals.cjs
```

- 기본 `require('playwright')`와 Playwright Chromium을 쓴다. 필요하면 `PLAYWRIGHT_MODULE`에 모듈 경로, `PW_CHROMIUM`에 Chrome 실행 파일, `GIT`에 Git 실행 파일을 지정한다.
- 결과는 기본 임시 디렉터리에 저장한다. `REVIEW_OUT`으로 기존 출력 폴더를 지정할 수 있다. 앱 파일과 실제 사용자의 브라우저 저장소에는 쓰지 않는다.
- `unlock-audit`에는 e9c178d/acfe20e/921e8ff/5a66345 커밋이 필요하다. 얕은 클론이면 이력을 먼저 확보한다. 버전별 14/14/12/12사례는 겹치므로 합산하지 않는다.
- 브라우저 재현은 파일 URL로 실행한다. GitHub Pages 배포 환경 자체를 다시 검사한 결과는 아니다.
- 이 스크립트는 결함을 기록하는 진단 도구라 실행 성공(exit 0)이 ‘결함 없음’은 아니다. 출력에서 T01 passed=true, T02 endingVisible=true, T04 연습 인덱스 1→2 등이 기준판의 문제를 뜻한다. Opus가 수정한 뒤에는 기대 결과를 반대로 단언하는 회귀 검사로 전환한다.

## 이전 지적과 오탐 처리

- [이전 23개](evidence/prior-review-status.json): 제안 문자열과 동일한 것은 18개. life·quantity·anxious·interesting·sharply 5개는 후속 편집으로 문구가 달라졌지만 원래 지적은 해결됐다. `exactProposal=false`를 미해결로 읽지 않는다.
- Testament는 DATA의 word가 소문자여도 실제 term은 Testament로 표시된다. 대문자 버그라는 후보는 철회했다.
- seize의 `{{BLANK}}d`에는 grasp를 넣으면 graspd가 된다. 같은 글자 수라는 이유만으로 동의 답이라고 하지 않았다.
- protest의 동사 강세는 사전 확인 후 현행을 유지했다. proposition 인용도 Dickens 원문에서 확인해 철회했다.
- speed bump로 바꾸면 다시 speed hump가 들어간다. 동의어 문제를 해결했다는 주장과 해당 교체안을 철회했다.
- clause는 ‘문법상 비문’이 아니라 화면에 다른 지시대상이 없는 상황의 내용 오류로 최종 판단했다. 독립 검토자는 P3를 권했으므로 우선순위 이견을 숨기지 않았다.
- 원본 파일만 보는 deepcheck는 현재 제거된 단어까지 포함한다. 실제 앱에 없는 kinda/pence 경고를 런타임 결함으로 보고하지 않았다.

## 남은 한계

- 실제 학생의 iPhone Safari, 각 기기의 음성 품질·발음 시점은 새로 검사하지 않았다. Chromium의 화면 폭을 iPhone 실기기 검증으로 부르지 않는다.
- IPA 전체를 여러 사전의 발음과 일일이 재대조하지 않았다. 기존 정렬/대체 표시/재생 테스트와 생성 동기화 검사는 통과했다.
- 외부 사실 검증은 의심 후보 중심이다. 전수 읽기는 전체 외부 근거의 완전한 검증을 보장하지 않는다.
- 학습 성과나 완주 후 독해율을 이번 기술·내용 리뷰만으로 수치화하지 않는다. 특히 M01의 94.0%는 현재 문서에 기록된 발췌 표본 측정값이며 이번에 원 PDF 전체를 새로 측정한 값이 아니다.
