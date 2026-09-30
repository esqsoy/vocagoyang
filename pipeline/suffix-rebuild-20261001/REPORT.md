# 접미사와 단어 가족 보강 · 2026-10-01

후속 변경: 이 보고서는 357카드 단계의 고정 기록이다. 이후 사용자가 `word family` 표기와 troublesome 추가를 승인해 현재는 358카드다. troublesome은 47세트 Exercise 11에 awesome과 함께 추가했다. 현재 상태는 [HANDOFF](../../HANDOFF.md), 추가 카드는 [후속 변경 원장](../player-feedback-20261001.json)을 따른다. 아래의 보류·수치·해시는 해당 단계의 이력이다.

로컬 구현·검증 완료. 커밋·푸시·공개 배포 전이다. 현재 원본은 `../morphology.json`이며 이 폴더는 이번 변경의 고정 기록이다. 앞선 327카드 확장은 [이전 보고서](../morphology-rebuild-20260930/REPORT.md)에 따로 보존했다.

## 구성

| 범위 | 직전 | 현재 |
| --- | --- | --- |
| 47 · 접사로 뜻과 품사 읽기 | 101카드 / 10연습 | 123카드 / 12연습 |
| 48 · 어근과 단어 가족 | 226카드 / 22연습 | 234카드 / 22연습 |
| 47·48 합계 | 327카드 / 128개 개념 단위 | 357카드 / 141개 개념 단위 |
| 전체 FABLE | 7,036카드 / 618연습 | 7,066카드 / 620연습 |

기존 327카드를 모두 보존하고 해설 11개만 수정했다. 기존 표제어의 복습 25장과 승인된 새 표제어 5장을 추가했다. 47·48 밖의 DATA·정답 범위·표제어와 게임 방식은 변경하지 않았다. 마더텅·EBS 어휘 데이터도 그대로다. 카드 수를 표제어 수나 어족 수로 계산하지 않는다.

## 실제 카드에서 배우는 관계

- **한 기반 단어의 여러 파생형:** care / careful / carefully / careless / carelessness, employ / employer / employee / employment, predictor / prediction / predictable, photograph / photography / photographer / photographic, psychology / psychological / psychologist를 같은 연습에서 연결한다.
- **같은 철자의 다른 역할:** friendly의 형용사형 -ly와 carefully의 부사형 -ly, removal·approval의 명사형 -al과 cultural의 형용사형 -al, wooden의 재료 형용사형 -en과 strengthen의 동사형 -en, researcher와 smaller의 서로 다른 -er를 카드 해설에 표시한다.
- **뜻과 형태의 한계:** yellowish의 ‘약간 노란’과 foolish의 ‘어리석은’, machinery의 집합·불가산 용법, noise→noisy의 e 탈락, flexible→flexibility의 형태·강세 변화, modernize/modernise와 advise의 차이를 짧게 설명한다.
- **학술 가족:** ecology→ecological/ecologist와 bureaucracy→bureaucrat를 기존 해설에서 연결한다. bureaucracy의 번거로운 행정이라는 뜻과 psychological/physical 대비도 보존한다.
- **서로 다른 -some:** awesome은 awe+-some으로 생긴 형용사이며 현대 구어 뜻을 함께 제시한다. ribosome의 -some은 그리스어 σῶμα(sōma)에서 온 별개 요소다. -ome/-some을 한국어 ‘군/체’와 일대일로 대응시키지 않는다.

`rule/limits/history`에만 있는 정보를 학생이 배운 것으로 계산하지 않는다. 핵심 대비는 실제로 출력되는 예문·해설에 넣었다. 각 카드는 무작위로 먼저 나와도 이해할 수 있다. 모든 어원 예문은 10단어 이하, 해설은 70자 이하다. 이 길이 검사는 내용의 정확성·학습 효과 검증을 대신하지 않는다.

## 추가 카드 전체

기존 표제어 복습 25개:

care, careful, carefully, careless, carelessness, employ, employer, employee, employment, prediction, friendly, wooden, removal, approval, yellowish, foolish, healthy, noisy, dependent, consultant, machinery, awesome, photography, photographer, psychologist.

새 표제어 5개:

- biome — 생물군계
- microbiome — 미생물 군집
- genome — 유전체
- chromosome — 염색체
- ribosome — 리보솜

troublesome은 추가 여부를 물은 뒤 사용자가 어원과 awesome을 질문했으므로 승인으로 간주하지 않았다. 기존 awesome을 활용하고 신규 troublesome은 보류했다. -phobia나 희귀 생물학 용어를 목록 완성을 위해 늘리지 않았다.

## 묶음과 기록

47의 앞 6연습은 내용·배치를 보존했다. 뒤 6연습은 10·10·11·8·11·12장이다. 48에서는 흩어져 있던 사진 가족을 한 연습으로 모았다. 사진·생물학처럼 이유가 있는 두 연습은 15장이고 전체 범위는 8~15장이다. 같은 표제어나 개념 단위를 나누지 않았다.

47·48만 `morphology-47-20261001`, `morphology-48-20261001`의 새 키를 쓴다. 이전 기록을 삭제하지 않지만, 추가 학습이 포함된 과정을 옛 완료만으로 자동 클리어하지 않는다. 다른 세트의 기록·이어하기는 유지한다. 실제 배포 시 이 두 과정의 완료 상태가 새로 시작함을 안내한다.

## 확인한 결과

이번 내용 통합 후 다음 검사를 실행해 통과했다.

```text
node pipeline/tests/suffix-expansion.test.cjs
node pipeline/tests/morphology-content.test.cjs
node pipeline/tests/morphology-expansion.test.cjs
node pipeline/tests/reading-core.test.cjs
node pipeline/tests/pool-expansion.test.cjs
node pipeline/tests/session.test.cjs
node pipeline/ipa-effects/tests/conservation.test.cjs
node pipeline/ipa-effects/build.cjs --check
```

- 기존 327카드의 해설 이외 필드 보존, 추가 25장 출처 카드·IPA 일치, 신규 표제어 정확히 5개, 다른 세트의 DATA 불변을 확인했다.
- 620연습에 대해 12개 난수 조건, 총 7,440회 모의 플레이를 확인했다. 모든 620연습의 완료·이어하기, 34개 개편 연습의 예전 완료 오인 방지도 검사했다.
- 327카드와 그 이전 데이터의 역사적 해시는 유지했다. 새 `restore.cjs`가 정확히 기록된 이번 변경만 되돌린 뒤 기존 검사 체인으로 연결한다.
- 독립 재독해에서 추가 30카드·수정 11개 해설과 생물학 5개 IPA·의미를 출처와 대조했다.
- 로컬 점검용 화면에서 microbiome·ribosome을 320px 폭으로 확인했다. 그리스어·IPA·해설이 표시됐고 가로 넘침과 경고·오류 로그는 없었다. 전체 실제 음성의 정밀 동기화를 확인한 것은 아니다. 점검용 탭과 화면 폭 설정은 정리했다.

## 함께 수정한 발음 완료 처리

사용자는 일부 발음기호가 안 보였다고 했으나 단어를 기억하지 못하며 직접 다음으로 넘겼을 가능성도 있다고 했다. 그 사례의 원인은 미확정이다.

별도로 실제 코드에서 정상 TTS 종료가 예상 시간보다 빠르면 이후 음절 타이머를 취소해 뒤쪽 IPA가 한 번도 나타나지 않는 경로를 재현했다. photographic의 실제 대응 자료에서 추정 1,680ms에 종료 850ms를 주면 마지막 /ɪk/가 빠졌다.

공통 `../ipa-effects/runtime.js`에서 아직 표시하지 않은 부분이 있을 때만 전체를 보여 주고 180ms 유지한 뒤 기존 250ms 사라짐을 적용했다. 이미 전체가 표시된 정상 종료·전체 IPA 방식에는 새 지연이 없고 수동 넘김은 즉시 취소한다. 세 과정에 동일하게 생성했다. 음성 선택·속도·스타일·대응 자료는 변경하지 않았다.

이 수정 단계에서 completion / advance / layout / stress / conservation / host-hooks / answer-replay 검사를 통과했다. 브라우저의 실제 렌더러에 시험용 시작·종료 이벤트를 넣었을 때 빠른 100ms 종료는 1/4→4/4 구간 표시, 자동 진행 약 294ms였다. 보통 2,400ms 종료는 이미 4/4, 자동 진행 약 2,409ms였다. 이는 이벤트 처리 점검이며 특정 기기 TTS의 실측 발음 동기화 결과는 아니다.

## 파일과 후속 작업

- `set47-overlay.json`, `set48-overlay.json`: 검토 당시 내용·메타데이터·추가 출처. 이후 일반 편집 원본으로 쓰지 않는다.
- `before-morphology.json`, `findings.json`, `restore.cjs`: 전후 해시, 기존 카드 보존, 변경된 두 과정과 해설, 출처 원장.
- `apply.cjs`: 이미 적용한 역사적 패치. 재실행하면 중단하며 후속 편집을 덮어쓰지 않는다.
- [출처와 판단 범위](SOURCES.md). 앞으로는 `../morphology.json`에서 수정한 뒤 `assemble.py`와 IPA 빌더를 실행한다.

학생의 실제 학습 전이를 측정한 것은 아니다. 현재 과정의 입력·데이터·표시 검증과 교육적 설계 판단을 구별한다. 사용자의 플레이 피드백을 받은 뒤 필요한 부분을 다듬고, 별도 배포 요청이 있을 때 공개 반영한다.
