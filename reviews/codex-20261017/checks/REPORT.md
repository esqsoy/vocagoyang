# 회귀·데이터 검증 · 2026-10-17

대상은 `0d0f516ebe041a7a2bb2f9b20020584b4345e839`, 비교 기준은 `5b4ffee`다. 앱과 원래 검사 파일은 수정하지 않았다. 결과·검토용 실행 파일은 이 디렉터리에만 저장했다.

## 실행 결과

- 기존 통합 목록의 **Node 검사 51/51 통과**. [`regression-summary.json`](regression-summary.json), 명령별 상태·시간·전체 로그는 [`regression-results.json`](regression-results.json).
- 마더텅·EBS IPA 조립 `--check` **2/2 통과**. 같은 로그에 포함된다.
- `milestones.test.cjs`를 포함해 모두 원래 파일을 그대로 실행했다. **CRLF 보정 preload는 한 번도 사용하지 않았다.** 검토용 드라이버에는 실패 시에만 실행하는 과거 방식의 fallback이 있으나 이번 결과에는 해당 실행이 없다.
- 기존 세션 검사: **780연습 × 12시드 = 9,360 모의 세션** 통과. 실제 브라우저 플레이 수가 아니다.
- 공통 IPA·돌파 축하·진행 속도·마더텅 발췌·모아둔 카드·인덱스 통계·세트 도장의 생성 구간 검사가 통과했다.
- FABLE의 실제 `assemble.py`를 실행하되 쓰기를 메모리에 받아 현재 파일과 비교했다. 생성 대상 `out/set46~50.json`과 FABLE HTML 전체가 일치했다. 파일 쓰기는 0회. 인덱스 재생성 호출은 차단하고 별도의 기존 `index-stats.cjs --check`로 검증했다. [`fable-assembly-results.json`](fable-assembly-results.json).

검토용 FABLE 조립 래퍼의 첫 실행에서는 원본 스크립트를 직접 실행할 때의 import 경로가 없어 `placement_regrouping`을 찾지 못했다. 래퍼에 `pipeline` import 경로를 넣고 다시 실행했으며 원본 조립 코드는 바꾸지 않았다.

## 카드·IPA 보존

| 과정 | 카드 | 고유 표제어 | 실제 연습 |
| --- | ---: | ---: | ---: |
| FABLE | 8,497 | 6,198 | 780 |
| 마더텅 | 6,498 | 4,026 | 161 |
| EBS | 597 | 545 | 48 |

세 과정 **15,592카드의 DATA 문자열이 기준과 정확히 동일**하다. 따라서 카드 필드, 순서, 예문·뜻·해설·고양이 대사와 카드에 든 IPA도 달라지지 않았다. `IPA_EFFECT_MAPS`, `PRONUNCIATION_AUDIO_MAP`, 교재 두 과정의 `MT_PRONUNCIATIONS`, FABLE의 `READING_CORE`·`MORPHOLOGY`·`CONNECTIONS`도 동일하다. 원본 어휘/발음 JSON과 MP3 변경은 없다. 각 블록 SHA-256 및 과정별 통계는 [`data-audit.json`](data-audit.json)에 있다.

현재 음원 연결은 FABLE 183, 마더텅 97, EBS 25카드로 합계 **305카드**다. 이 확인은 준비된 모든 음원을 새로 청취했다는 뜻이 아니다.

엔딩 `FE_MSG` 32개는 중복이 없고 모두 기존 FABLE 표제어다. 학습 순서도 목록과 일치한다. B1에서는 20개가 passion(25세트)까지, 전체에서는 carry on·pay off(50세트)까지다. 이는 단어 존재·소속·순서 검사이며 실제 화면의 메시지 타이밍과 가독성은 별도의 브라우저 검토 범위다.

## 브라우저 검사 수정의 타당성

`pipeline/pronunciation-audio/browser.test.cjs`의 **이전·현재 `select()` 코드 자체**를 가져와 기존 VM 상태 하네스에서 첫 카드를 통제했다. contract가 처음 나오는 경우 이전 코드는 다음 카드 belief로 넘어갔다. 현재 코드는 contract를 유지했다. 다른 카드가 처음 나오는 경우에도 현재 코드는 contract를 정확히 골랐다. 정답·따라쓰기 상태나 점수를 건드리지 않았다.

`nextCard()`는 직전 표제어가 같으면 다른 단어를 먼저 고르는 정상 규칙이므로, 이미 목표 카드일 때 다시 넘기지 않고 다른 카드일 때만 테스트 준비 과정의 `lastWordKey`를 지우는 수정은 문제 원인과 맞는다. 앱의 출제 규칙은 바뀌지 않았다. [`browser-selection-results.json`](browser-selection-results.json).

## 범위와 한계

이번 담당 범위에서 새 회귀 결함은 발견하지 않았다. 이는 기존 검사의 범위와 데이터 보존 결과이며 전체 제품에 결함이 없다는 결론은 아니다. 기존 내용 P3를 새로운 어휘 변경 문제로 재등록하지 않았다. 15,592카드를 이번에 새로 의미 검수한 것이 아니며, 실제 브라우저 음원·엔딩과 iPhone Safari 검증은 이 보고서에 포함하지 않는다.
