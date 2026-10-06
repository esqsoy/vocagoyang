# 보카고양 최신 인수인계

갱신: 2026-10-07 KST. 다음 작업은 이 문서와 `git status`를 함께 확인하고 시작한다. 오래된 상태를 누적하는 대신 이 문서는 최신 상태로 교체하고, 경위는 [WORK_LOG.md](WORK_LOG.md)에 남긴다.

## 현재 결론과 배포 상태

- **2026-10-07 FABLE 보강 제목 ‘+’로 재축약, 로컬 미배포**: 공개판의 ‘기초 보강’/‘핵심 보강’도 줄바꿈을 유발한다는 사용자 피드백에 따라 4는 ‘301~400+’, 45는 ‘4384~4460+’로 표시한다. 46세트부터는 주제 제목과 줄바꿈을 유지한다. 생성 구간 밖 lessonDisplayNames 한 줄만 바꿨고 DATA·기록·게임은 그대로다. 내장 브라우저 390px에서 4/45의 제목 줄이 주변 숫자 세트와 같은 한 줄, 320px에서는 주변과 같은 두 줄이며 제목 자체의 추가 줄바꿈·가로 넘침이 없음을 확인했다. 45세트 안 제목도 확인했다. 아직 커밋·푸시·배포하지 않았으며 공개 앱 기준은 아래 fe71060이다.

- **2026-10-07 홈 제목·이어하기 통합 공개 배포 완료**: 세 과정의 이어하기 윗줄에는 동작명과 다음 연습, 아랫줄에는 세트/강·카드 수·클리어 현황을 둔다. 같은 `homeMeta` 요소를 버튼 안으로 이동하며 이어하기가 숨겨지면 제목 아래로 돌려 첫 방문에도 통계를 유지한다. 마더텅/EBS에도 기존 함수로 클리어 수를 표시한다. 마더텅은 출제 범위를 따라 수치가 갱신된다. 생성 구간 밖 세 HTML이 원본이다. card-search, saved-cards, textbook-ui, saved build --check 통과. 내장 브라우저 기본/390/320px에서 FABLE 버튼과 첫 방문 대체 표시, 마더텅 범위 전환, EBS를 확인했다. 앱 커밋 [fe71060](https://github.com/esqsoy/vocagoyang/commit/fe710608e73e02029e91edd95535071f8594b424)을 origin/main에 푸시했고 [GitHub Pages 37507350892](https://github.com/esqsoy/vocagoyang/actions/runs/37507350892) completed/success와 공개 인덱스·세 과정 HTTP 200, 검증본과 LF 정규화 SHA-256 일치를 확인했다. 아래 제목 단축·너비 변경을 함께 배포했다. 배포 요청 후 card-search, saved-cards, textbook-ui, IPA conservation, saved build --check, index-stats --check, diff 검사를 다시 통과했다. [배포 기록](DEPLOYMENT.md).

- **2026-10-07 기준 사전 변경 검토**: 사용자가 MW Collegiate 12판(9780877794066)을 구입해 ODE와 수량·편의성 비교를 요청했다. OED는 오타라고 정정했다. 공식 합산 수치와 표제어 수를 구별했고 MW12의 정확한 총표제어 수는 확인하지 못했다. MW12를 기준으로 바꾸는 안은 권고·검토 단계이며 이전 ODE 확정을 아직 대체하지 않는다. 전체 목록 확보·새 카드 제작·앱 수정은 하지 않았다. [조사와 범위](WORK_PLAN.md#기준-사전-변경-검토--2026-10-07-미확정). 사전 변경은 계속 미확정이다. 홈 UI 배포 상태는 위 항목을 따른다.

- **2026-10-07 홈 제목·이어하기 너비 변경 내역**: FABLE 4세트 ‘301~400 · 기초 보강’, 45세트 ‘4384~4460 · 핵심 보강’으로 줄였다. 마더텅은 14강 ‘문장 위치’, 16강 ‘장문 - 단일 지문’, 17강 ‘장문 - 복합 지문’이다. 생성된 DATA를 고치지 않고 초기 lessons의 표시 이름만 조정하므로 홈·강 안 제목에 함께 적용되며 원본 이름·카드·저장 식별자는 유지한다. 세 과정의 이어하기 버튼은 좌우 여백 13px을 유지하며 목록 전체 너비를 쓴다. 세 HTML 생성 구간 밖 코드가 원본이다. card-search, textbook-ui, IPA conservation, saved 빌드 --check, placement-regrouping 통과. 내장 브라우저 기본/390px에서 제목·너비를 확인했으며 이어하기 시각 검사는 기록을 쓰지 않는 로컬 표시용 fixture를 사용했다. 위 fe71060 배포에 함께 포함했다.

- **2026-10-06 최종 목표 ODE 확정**: 사용자가 ODE를 최종 목표로 삼는 방향을 명시적으로 확인했다. 최신 신조어 등을 제외한 ODE 전체 어휘 풀이 장기 목표이며 GRE·GMAT과 OALD는 중간 단계다. 출판사 단어장도 참고한다. 구체 판본·데이터 기준일·제외 기준·전체 목록과 사용 조건은 아직 확보·확정하지 않았다. 희귀·전문어는 삭제가 아닌 후순위로 관리한다. [범위와 근거](WORK_PLAN.md#장기-목표-주요-현대-영영사전의-전체-어휘-풀--2026-10-06). 목표 확정을 문서에 기록했으며 새 카드 제작·게임 수정·배포는 하지 않았다.

- **2026-10-06 GRE·GMAT 확장 로드맵 제안**: 게임 방식을 유지하고 FABLE·마더텅 뒤 고급 독해 과정을 단계적으로 구성하는 요청이다. 실제 기존 어휘 수와 대표 후보의 뜻·원문을 확인하고 ETS/GMAC 및 AWL/AVL 원자료를 검토했다. 공통 고급 300 → 논증·자료 300 → GRE 600~900 → 선택 300~600카드의 잠정 제작 범위, 첫 120카드 시범과 후속 300카드 단위를 제안한다. 상세는 [WORK_PLAN](WORK_PLAN.md#gregmat-수준-확장-로드맵--2026-10-06-제안-미확정). 후보 전체 감사·수록 확정·카드 제작은 아직 하지 않았다. 로드맵은 문서에만 기록했으며 새 어휘 카드는 추가하지 않았다. 검색 기능의 배포 상태는 다음 항목을 따른다.

- **2026-10-06 단어·뜻 검색 공개 배포 완료**: 세 과정 홈에 작은 검색칸을 추가했다. 현재 과정 전체에서 영어 표제어·표시형과 한국어 뜻으로 찾고, 예문·해석·해설·수록 위치를 펼쳐 기존 ‘모아둔 카드’에 저장/해제한다. 마더텅은 선택한 출제 연도와 별개로 이전 기출과 원래 뜻도 검색한다. 정확한 단어를 먼저 표시하고 결과는 24장씩 더 본다. 카드별 뜻·출처를 합치지 않으며 게임 화면·정답·진도·저장 키는 유지한다. 공통 원본은 [saved-cards](pipeline/saved-cards/README.md). 사용자의 배포 요청 후 card-search, saved-cards, 교재 UI, 정답 재생, IPA 보존, saved 빌드, index-stats 및 diff 검사를 다시 통과했다. 구현 단계의 내장 브라우저에서 FABLE 검색→저장→개인 복습, 마더텅 원래 뜻/원문, EBS 검색과 390/320px 화면을 확인했다. 실제 iPhone Safari 검사는 아니다. 앱 커밋 [571900c](https://github.com/esqsoy/vocagoyang/commit/571900c8a9ea9830cd465827c6631334a8eddb16)을 origin/main에 푸시했고 [GitHub Pages 37424922011](https://github.com/esqsoy/vocagoyang/actions/runs/37424922011) 성공, 공개 인덱스·세 과정 HTTP 200 및 검증본과 LF 정규화 SHA-256 일치를 확인했다. 상세는 [배포 기록](DEPLOYMENT.md)을 따른다.

- **plausible 유지 확인**: FABLE의 ‘그럴듯한, 타당해 보이는’과 증명이 필요하다는 예문·해설, 마더텅/EBS의 ‘그럴듯한’ 수록 상태를 확인했다. 사용자가 현행 유지에 동의해 내용은 바꾸지 않았다.

- **2026-10-03 배치 조정·모아둔 카드 공개 배포 완료**: 사용자가 제안 전부와 배포를 승인했다. 세 과정에 고양이 저장/해제와 번호 없는 ‘모아둔 카드’를 넣었다. 개인 복습·목록 펼치기·개별 해제·목록 복사를 지원하며 현재 기기·브라우저별 저장이다. 정규 진도·이어하기·콤보와 분리한다. FABLE 배치 조정과 qualification 해설 수정도 함께 배포했다. 앱 커밋 [843b189](https://github.com/esqsoy/vocagoyang/commit/843b189c54593731fcb2b799d600579679b302fd)을 origin/main에 푸시했고 [GitHub Pages 37124186893](https://github.com/esqsoy/vocagoyang/actions/runs/37124186893) 성공, 공개 인덱스·세 과정 HTTP 200 및 검증본과의 일치를 확인했다. [공통 구현](pipeline/saved-cards/README.md), [배치 원장·결과](pipeline/placement-review-20261003/REPORT.md).

- **최종 FABLE 구성: 51세트·623연습·7,067카드·등록 표제어 4,916개**. 전체 카드 내용·중복 횟수·저장 ID를 보존했다. 0세트의 독해 핵심 77카드는 45로, 기초 핵심 36카드는 4로 이동했다. 서수 30카드는 1세트 끝의 13/9/8장, 방위 10카드는 3세트 끝 한 판이다. a/an은 5세트 한 판(15장), left-wing/right-wing은 35세트 한 판(14장)이다. 서수를 뺀 45의 두 잔여 5장 묶음은 한 판 10장으로 합쳤다. 최종 0은 192카드·17연습, 1은 233·24, 3은 166·17, 4는 213·22, 45는 158·13이다. 4의 east도 방위로 이동했으므로 기초 보강만 더한 214가 아닌 213카드다.

- **원본과 기록 보존**: 이동한 카드의 저작 원본 주소는 그대로다. lesson00의 보강 내용 수정은 계속 lesson00에서 하며 다른 이동 카드도 `placement.json`의 cards 참조를 따른다. 새 묶음에는 새 완료 키를 주고, 카드별 과거 완료 범위를 모두 충족할 때만 완료로 이어받는다. 전체 7,067개 저장 카드 ID, 이전 이어하기 3,250가지·현재 623가지와 일부 완료 오인 방지 74가지를 검사했다. 어휘·예문·해설·정답 범위는 배치로 변하지 않았다. 직접 disassemble로 원본을 덮어쓰는 것은 차단했다.

- **qualification 해설 3카드**: 공식 자격 뜻은 “교사 자격처럼 공식 자격은 certification과 바꿔 쓸 수 있다.”, 자격 요건 뜻은 “일에 필요한 능력·경험·조건. 이 경우는 certification은 쓸 수 없다.”로 확정했다. 원본 2카드와 46세트 복습 1카드다. 예문·뜻·정답 범위는 유지하고 certification을 정답에 추가하지 않는다. [변경 원장](pipeline/player-feedback-20261003.json).

- **2026-10-02 동의어 검수 원칙·안내 수정 공개 배포 완료**: 앱 커밋 91a1b15을 origin/main에 푸시했다. [GitHub Pages 36912696092](https://github.com/esqsoy/vocagoyang/actions/runs/36912696092) 성공, 인덱스·세 과정 HTTP 200 및 로컬 검증본과의 일치를 확인했다. implication 영향/암시와 consequence 결과의 해설 3개 및 46세트 복습 3개를 보완했다. 세 과정 SYNLINES는 “이번에 익힐 단어는 이거라고양!”으로 통일해 근거 없는 대체 불가 단정을 제거했다. WORK_PLAN의 뜻·문맥별 원칙을 AGENTS·UI_STANDARD에서 참조한다. 배포 전 morphology-content, session(7,440회), IPA conservation, textbook-ui, build --check를 재실행해 통과했다. 예문·정답 범위·기록은 유지하며 기존 ALT·acceptedAnswers의 개별 예외는 별도 검수 대상이다. [변경 원장](pipeline/synonym-policy-20261002.json), [배포 기록](DEPLOYMENT.md).

- **2026-10-02 뜻·예문 수정 공개 배포 완료**: 앱 커밋 1764496을 origin/main에 푸시했고 [GitHub Pages 36904196964](https://github.com/esqsoy/vocagoyang/actions/runs/36904196964) 성공, 인덱스·세 과정 HTTP 200 및 로컬 검증본과의 일치를 확인했다. FABLE 뜻의 정답 노출 119곳을 정리하고 figure·qualify 원본 및 복습 카드를 수정했다. 누적 123카드·131필드 변경이다. figure 해설은 “six-figure salary는 한국의 ‘억대 연봉’ 같은 관용적 표현이다.” 한 문장, qualify 예문은 `it applies only in this case`를 사용한다. 단어·카드 수·진도·판정·UI·IPA 및 마더텅·EBS·인덱스 내용은 유지했다. [변경 원장](pipeline/meaning-hints-20261002.json), [배포 기록](DEPLOYMENT.md). Safari 제보 학생의 실기기 재확인은 계속 대기 중이다.

- **2026-10-01 iPhone Safari 발음기호 위치 보정 공개 배포 완료**: 사용자 제보는 한 학생의 Safari에서 모든 단어의 IPA가 위아래로 분리되는 현상이다. 공통 runtime.js에서 고정 레이어의 실제 getBoundingClientRect 원점을 빼서 같은 좌표계로 배치하고 visualViewport resize/scroll에도 갱신한다. 위치 이벤트를 한 프레임으로 묶고 효과 종료 시 예약을 취소한다. 기존 코드는 원점이 -180px인 모의 조건에서 180px 어긋났고 보정 후 통과했다. 반대 방향·좌우 이동·전체 IPA·기존 배치·종료/취소도 검사했다. 학생 기기의 정확한 원인은 아직 미확정이며 실기기 재확인이 필요하다. 앱 커밋 7032122를 origin/main에 푸시했고 GitHub Pages 실행 36873498316 성공 및 인덱스·세 과정 공개 HTML 일치를 확인했다. 배포 요청 후 관련 검사 8개를 다시 실행해 통과했다. 당시 앱 커밋은 7032122다. [배포 기록](DEPLOYMENT.md).

- **2026-10-01 전체 업데이트 공개 배포 완료**. 앱 커밋 [cadd4fb](https://github.com/esqsoy/vocagoyang/commit/cadd4fbb9f4c24a05b6d9565db308ffba50eb4a4)을 origin/main에 푸시했다. [GitHub Pages 36754934684](https://github.com/esqsoy/vocagoyang/actions/runs/36754934684)의 success와 인덱스·세 과정 공개 HTML이 로컬 검증본과 일치함을 확인했다. 아래 배포 이전의 로컬 검수 이력도 이번 배포에 포함된다. 상세 해시는 [배포 기록](DEPLOYMENT.md).
- 어원·접미사 과정은 기존 167카드를 보존하면서 327→357→358카드로 보강했다. 현재 **358카드·141개 개념 단위·34연습**, 47세트 124카드·12연습, 48세트 234카드·22연습이다. 현재 전체 FABLE은 배치 조정 후 **7,067카드·623연습**. [선행 어원 보강](pipeline/morphology-rebuild-20260930/REPORT.md), [접미사 후속 보강](pipeline/suffix-rebuild-20261001/REPORT.md).
- 새 표제어 37개와 후속 biome·microbiome·genome·chromosome·ribosome·troublesome을 포함한다. troublesome은 47세트 Exercise 11에서 awesome과 같은 -some 단위에 들어간다. 어휘 관계 명칭은 영어 소문자 **word family**, 48세트 제목은 ‘어근과 word family’로 통일한다. 과거 보고서·검수 원장은 해당 단계의 기록으로 유지한다.
- **진도 안내**: 개편한 47·48세트는 새 구성으로 시작한다. 기본 키는 morphology-47-20261001 / morphology-48-20261001, troublesome이 추가된 47세트 Exercise 11은 morphology-47-20261001-troublesome이다. 과거 저장 기록 자체를 삭제하지 않고 다른 세트·과정의 진도는 유지한다. 명칭 변경만 있었던 연습은 기존 키를 이어 쓴다.
- September의 한국·영미권 개학 비교를 간결하게 하고 September~December에 라틴어 septem=7·octo=8·novem=9·decem=10과 3월부터 세던 옛 로마력 해설을 반영했다. [변경 기록](pipeline/player-feedback-20260930.json).
- 세 과정 공통 IPA: 정상 TTS 종료가 예상보다 빨라 미표시 음절이 남으면 전체를 표시하고 180ms 유지한 뒤 기존 250ms 사라짐을 이어간다. 이미 전부 표시됐으면 추가 대기 없이, 수동 건너뛰기는 즉시 종료한다. 코드에서 확인한 누락 경로를 수정했으며 최초 사용자 사례의 원인까지 특정한 것은 아니다.
- 인덱스는 실제 DATA에서 등록 표제어를 자동 집계한다. FABLE **4,916**, 마더텅 추가 **3,238**·누적 **8,154**, EBS 추가 **129**·최종 **8,283**. 구 표현·이전 기출을 포함하며 word family 수는 아니다. FABLE 조립·마더텅 발췌·공통 IPA 빌드에 연결했고 --check로 오래된 수치를 검출한다. [집계 기준·명령](pipeline/README.md#인덱스-단어-수-자동-갱신).
- 예문 있음 → 문장 안 입력 / 예문 없음 → 독립 입력, 정답 터치 음성·IPA 재생 등 기존 표준은 유지한다. [UI_STANDARD.md](UI_STANDARD.md).
- 작업 브랜치는 codex/fable-upgrade-20260919, 저장소는 https://github.com/esqsoy/vocagoyang.git, 공개 사이트는 https://esqsoy.github.io/vocagoyang/ 다. 현재 앱 기준은 fe71060이며 후속 배포 기록 커밋은 게임 HTML을 바꾸지 않는다. 다음 작업에서 최신 HEAD·원격 상태와 git status를 확인한다.

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
| 모아둔 카드·홈 단어 검색 | `pipeline/saved-cards/runtime.js`, `style.css`. `node pipeline/saved-cards/build.cjs`로 세 HTML에 반영한다. [공통 안내](pipeline/saved-cards/README.md) 참조. |
| 각 과정 게임과 공통 기능 연결 | `vocagoyangfable.html`, `vocagoyangksat2027.html`, `vocagoyangebs2027.html`의 생성 구간 밖 코드. 연결 함수는 공통 빌더가 만들어 주지 않으므로 함께 확인한다. |

원문 PDF와 전체 OCR은 로컬 참고 자료다. 저장소에는 검토한 발췌 데이터와 코드만 둔다. OCR 텍스트를 원문 검증 없이 확정하지 않는다.

## 이번 배포 검사 · 2026-10-03

승인한 최종 배치 후 새로 실행한 검사: placement-regrouping(623연습·모든 카드/ID·완료 범위·이어하기), saved-cards(세 과정), lesson-placement(선행 77카드 이동 보존), reading-core(역사적 단계 보존), session(623연습·7,476회), morphology-content, textbook-ui(EBS 597카드 입력), mother-tongue-layout(6,498카드 입력), mother-tongue-excerpts(6,422발췌), answer-replay(세 과정), IPA conservation·host-hooks, IPA/원문/saved 빌드 --check, index-stats --check 모두 통과했다. 최신 원본 조립의 재현성과 잘못된 disassemble 차단도 확인했다.

앞선 기능 구현 단계에서 좁은 내장 브라우저로 세 과정 저장→목록→재플레이, FABLE 재로딩·펼치기·복사, 원문/발음과 진도 분리를 확인했다. 이번 배치 후 홈 623연습·세트 수치, 1세트 서수 묶음을 다시 확인했다. 배포 후 실제 공개 브라우저에서 모아둔 카드와 623연습·0세트 192카드 표시도 확인했다. iPhone Safari 실기기 검사는 아니다.

## 이전 배포 검사 · 2026-10-02

동의어 안내 배포 요청 후 morphology-content, session(620연습·7,440회), IPA conservation, textbook-ui(EBS 597카드 입력 및 교재 공통 UI), IPA build --check의 5개 검사를 재실행해 통과했다. Pages 실행 36912696092 성공과 공개 4개 HTML의 HTTP 200·LF 정규화 SHA-256 일치를 확인했다. 아래 뜻·예문 배포와 이전 배포의 검사는 별도 이력이다.

### 같은 날 앞선 뜻·예문 배포 검사

배포 요청 후 morphology-content, reading-core, session(620연습·7,440회), IPA conservation, IPA build --check의 5개 검사를 재실행해 모두 통과했다. 공개 4개 HTML은 HTTP 200과 LF 정규화 SHA-256 일치로 검증했다. 아래는 이전 배포의 별도 검사 이력이다.

## 이전 배포 검사 · 2026-10-01

위 공개 배포 이후 Safari 위치 보정에서 새로 실행한 검사: IPA layout/completion/advance/stress/host-hooks/conservation, answer-replay, build --check 총 8개 통과. 로컬 Chromium에서 photographic의 일반 화면과 390px 화면을 확인했고 IPA와 철자칸의 중심이 일치하며 가로 넘침·경고·오류가 없었다. 이는 iPhone Safari 자체를 실행한 검사가 아니다. 임시 탭과 화면 폭 설정은 정리했다.

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

- 2026-10-01 누적 업데이트 cadd4fb는 공개 배포했다. 그 뒤 Safari IPA 위치 보정도 7032122로 공개 배포했다. 해당 학생 기기에서 해결됐는지는 후속 확인이 필요하다.
- `textTone=soft`의 흰색 밝기 실험: 사용자가 휴식 후 판단하기로 보류했다. 현재 표준에 반영하지 않는다.
- 발췌 없는 76카드는 단어형으로 유지한다. 문장을 억지로 만들지 않고 후속 피드백이 있을 때 검토한다.
- 숫자 어근·micro/macro 및 접미사·word family 보강은 공개 배포했다. 이후 사용자 플레이 피드백에 따라 다듬는다.
- FABLE은 사용자 플레이 피드백에 따른 유지 보수 단계다. 간격 복습은 연구·설계부터 후속 진행한다.
- 비너스·장미 분수 참고 이미지의 새로운 본문 클리어 효과는 별도 후속 디자인 과제다.

`pipeline/__pycache__/`, `pipeline/synonym-review-20260929/baseline-data.json`, `root-review.cjs` 등 기존 미추적 작업도 있다. 현재 요청과 무관한 파일을 임의로 삭제하거나 전부 묶어 커밋하지 않는다. 다음 시작 때의 실제 `git status`를 우선한다.
