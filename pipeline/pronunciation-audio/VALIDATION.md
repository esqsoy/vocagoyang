# 2026-10-15 구현 검증

기준 앱: `b49e90d`(실제 앱 변경 기준 `74a6ddc`). 작업 브랜치 `codex/pronunciation-exceptions-20261015`. **공개 배포 검증이 아닌 로컬 구현 검증**이다.

## 자료와 파일

- [독립 감사](independent-audit.json): 424카드·400개 과정/뜻/IPA 조합, 카탈로그 175형·187별칭 대조. 자료 검수 수와 실제 활성 수는 [AUDIT](AUDIT.md)에서 구분한다.
- 175개 MP3를 실제 디코딩하여 유효 신호·유한 수·클리핑 없음 확인. 합계 **2,201,300바이트**. 파일 SHA256·생성 모델 해시·제작 조건은 [manifest](../../assets/pronunciation/manifest.json).
- contract 명사 `140f6e2c3704ef55476cabb8d737799c4c56a89265950c916831859448d944f9`, 동사 `7f5e105b0da011b1a921220303949332f16e5d201d9187d9ddde2b655146e53f`는 승인된 샘플과 바이트 단위 일치.
- 생성기 재실행: 175파일·2,201,300바이트 동일, 변경된 음소가 없으면 기존 파일 보존. 독립 코드 리뷰에서 지적한 승인본보다 캐시가 먼저 선택되는 문제와 manifest 비원자 저장을 보완했다.

## 기능 검사

- **47개 Node 검사 최종 통과:** 기존 `pipeline/tests/*.test.cjs` 23개, `ipa-effects/tests/*.test.cjs` 6개, 교재 UI/발음/예문 및 answer-replay 검사 7개, IPA build-check/alignment-check 2개, 새 pronunciation-audio unit/host/build 3개, 생성 구간 및 index 검사 6개.
- FABLE 세션 검사: **780연습 × 12시드 = 9,360세션**, 모든 카드의 출제·오답 재학습·종료·직전 표제어 연속 방지(마지막 하나 예외) 통과.
- 마더텅 UI 검사: **6,498카드·56,193글자 입력 이벤트**, 특수 표현 72개, 문제 460경로+따라쓰기 460경로. 기존 기록 키·점수·입력 규칙 보존.
- `assemble-mother-tongue-pronunciations.py --check`, `assemble-ebs-pronunciations.py --check` 각각 통과. DATA 불변과 sidecar 일치 확인.
- 신규 host 검사는 정답·따라쓰기 전 읽기·따라쓰기 완료·재생·무음·수동 다음·화면 이탈·백그라운드 취소, 404/재생 거부/로딩 시간 초과의 단일 TTS fallback, TTS 또는 Audio 미지원, 현재 카드와 다른 뜻의 결과 복습을 확인한다.

### 실행 중 발견·해결한 것

1. `session.test.cjs`는 앱의 큐 함수만 분리 실행하는 VM이라 새로운 `exceptionAudioPreload`가 없었다. 입력/큐 검증은 그대로 두고 기존 음성 mock 옆에 preload mock을 추가했다. 9,360세션 재실행 통과.
2. 마더텅 IPA 보존 해시에 compliment 교정이 잡혔다. 해시 기준을 덮어쓰지 않고 `ipa-effects/pronunciation-corrections.json`에 전/후와 근거를 추가했다. 교정을 역적용한 원본 해시 확인 후 6,498카드 검사 통과.
3. Windows 줄바꿈 정규화 보조 코드를 전체 검사에 적용해 `index-stats`의 의도적인 CRLF fixture가 달라졌다. 보조 코드 없이 실제 파일 그대로 재실행해 통과했다. milestones의 기존 CRLF 비교는 보조 코드로 검사했다. 향후 모든 검사에 일괄 보정하지 않는다.
4. 테스트 실행기에서 없는 `pipeline/card-search/build.cjs`를 호출한 한 건은 앱 결함이 아니었다. 실제 `pipeline/index-stats.cjs --check`로 정정해 통과했다. 검색 기능 자체의 `card-search.test.cjs`는 통과했다.

## 실제 Chromium

`browser.test.cjs`는 새 프로필·390×844 화면·로컬 HTTP에서 **실제 MP3를 로드하고 재생**한다. 음원을 가짜 객체로 바꾸지 않았다.

| 과정 | 실제 확인 카드 | 파일 |
| --- | --- | --- |
| FABLE | contract ‘계약(서)’ /ˈkɑntrækt/ | contract-noun.mp3 |
| 마더텅 | conduct ‘수행하다, 지휘하다’ /kənˈdʌkt/ | conduct-verb.mp3 |
| EBS | conduct ‘행동’ /ˈkɑndʌkt/ | conduct-noun.mp3 |

세 과정에서 홈 화면의 음원 요청 0, 실제 `playing`/`ended`, IPA 효과의 recorded duration, TTS 중복 없음, 재생 반복 시 점수 불변, 무음 즉시 취소, 음원 요청 차단 시 TTS 한 번 복귀, pageerror 0을 확인했다. 제한된 실행 환경의 첫 시도는 localhost 접근이 차단되어 실패했고, 로컬 시험 접근이 허용된 실행으로 위 결과를 얻었다.

## 남은 범위

- 사람이 들어본 것은 승인 contract 샘플이다. **175개 모두의 청취 승인으로 확대하지 않는다.** 파일 신호/디코딩 검사와 발음의 자연스러움은 다르다.
- 학생의 실제 iPhone Safari는 새로 확인하지 않았다. 브라우저 자동검사를 그 기기의 재생 권한·음향·위치 검증으로 부르지 않는다.
- 복수 IPA 43카드는 기존 TTS 유지. 해당 문맥의 뜻을 하나로 정리할지는 별도 판단한다.
- 마지막 결과 복습 행의 기존 약 610ms 후 자동 이동이 긴 음성을 끊을 수 있다. 기존 동작이며 이번에 바꾸지 않았다.
- 알려진 다른 전수 리뷰 결함과 공개 배포 상태는 [HANDOFF](../../HANDOFF.md)를 따른다.
