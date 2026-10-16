# 흐름·상태 리뷰 · 2026-10-17

대상: `0d0f516`, 비교 기준: `5b4ffee`. 앱 원본은 수정하지 않았다. 아래 파일은 모두 검토 자료다.

## 확정 결함

### F01 · P3 · 열린 게임에서 미리보기를 띄우면 가려진 문제의 시간이 계속 흐른다

- 위치: `pipeline/set-stamp/runtime.js:619`, `645–650`; 같은 문제는 `pipeline/milestones/runtime.js:401`, `379–384`에도 있다.
- 새 `hashchange` 처리기가 진행 중인 게임에서도 `stPreview`/`msPreview`를 호출한다. 예약된 콜백은 700/600ms 뒤 `feOpen`/`stShow`/`msShow`를 직접 호출하며, 현재 게임의 ticker·남은 시간·입력 상태는 멈추거나 분리하지 않는다.
- 실제 재현: 0세트 연습 1을 시작하고 시작 대사가 끝난 뒤 주소에 `#ending=b1`을 붙인다. 엔딩을 보고 기다렸다가 Esc로 닫으면 원래 문제는 이미 시간 초과 오답이 되어 있다. 이번 실측은 `errors: 0 → 1`, `answered: false → true`, `remaining: 15 → 0`; 엔딩이 덮인 동안에도 `ticker: true`, 활성 화면은 `gameScreen`이었다.
- `#stamp=12`, `#milestone=2000`도 게임 위에 뜨면서 남은 시간 `15 → 13`이 계속 감소하는 것까지 확인했다. 시간 초과까지 기다린 추가 검증은 B1 엔딩에서 수행했다.
- 비교: `5b4ffee`의 동일한 **열린 페이지 hash 변경**에서는 overlay가 생성되지 않는다. 새 hashchange 진입으로 기존 초기 로드용 미리보기가 진행 중인 세션에도 도달하게 된 회귀다.
- 우선순위: **P3**. 일반적인 마지막 세트 완주 흐름에서는 재현되지 않으며, 영신 확인용 주소 미리보기를 진행 중 게임에 적용할 때만 생긴다. 미리보기 기능 자체는 승인된 동작이므로 문제 삼지 않는다. 문제를 가린 시간을 학습 실패로 세는 부작용이 결함이다.
- 수정 방향: 진행 중에는 미리보기를 게임 밖으로 미루거나, 미리보기 전용으로 현재 세션 시간·입력을 함께 정지하고 닫을 때 복원한다. 초기 로드와 hashchange의 지연 콜백에도 같은 생명주기 검사를 적용한다.

증거:

- [전체 비교 스크립트](browser-flow.cjs)
- [baseline/current 비교 결과](browser-flow.json)
- [시간 초과 추가 확인](browser-flow-countercheck.json)
- [엔딩을 닫은 직후 실제 화면](live-ending-after-close.png): “시간 초과라고양!”·오답 1
- [엔딩이 문제를 덮은 화면](live-ending-hidden-timeout.png)

최소 재현은 새 프로필에서 임의의 연습을 시작한 뒤 다음과 같다. 콘솔 호출은 주소창에서 같은 페이지 주소 끝에 hash를 붙이는 동작을 자동화한 것이다.

```js
location.hash = '#ending=b1';
// 현재 문제 제한 시간보다 오래 기다린 뒤 Esc로 닫는다.
// state.session.errors === 1, state.session.answered === true
```

부가 관찰: `#stamp=12`를 붙이고 120ms 뒤 `#stamp=13`을 붙이면 예약이 둘 다 살아 있어 `#stFx`가 두 개 쌓인다. 충분히 기다린 뒤 Esc 한 번은 DOM의 첫 도장만 닫아 현재 위에 보이는 도장이 남는다. 같은 미리보기 진입의 중복/취소 처리 문제이며, 별도 주요 결함으로 세지 않았다.

## 새로 확인한 정상 범위

- `node pipeline/tests/set-stamp.test.cjs` 통과. 이전 버전 완료 기록의 날짜 0 도장, 도장 전 다음 세트 잠금, 마지막 도장 전 엔딩 우회 방지, B1/전체 판정, 저장하지 않는 미리보기 검사가 포함된다.
- 새 격리 프로필의 실제 Chromium에서 마지막 연습만 남긴 기록을 준비해, **결과 복습 → Enter로 마지막 오답 듣기 → 세트 도장 → Enter로 닫기 → 해당 엔딩 → Enter로 대사 진행 → Esc로 닫기**를 B1·전체 각각 실행했다. 게임 ticker는 결과·도장·엔딩 전 구간에서 꺼져 있었다. B1은 25세트 도장 뒤 B1, 전체는 50세트 도장 뒤 full로 열렸다. 결과는 [normal-paths.json](normal-paths.json), 재현은 [normal-paths.cjs](normal-paths.cjs).
- 대문자 `#ENDING=B1`은 B1으로 열리고 hash가 지워졌다. B1 마지막 화면은 “FABLE 1부 완주!”·3,159단어 큰 도장과 C1 버튼이었다. 미리보기 전후 저장값은 같았다.
- reduced-motion 프로필에서는 새 엔딩의 불꽃 입자 수가 0이었다. 산을 바로 채운 뒤 대사·큰 도장·닫기까지 도달했다. 모든 CSS 움직임이 정지하는지까지의 주장은 하지 않는다.
- 전체 엔딩의 정체 대사 타이핑 중 닫고 즉시 B1을 다시 열어 1.1초 기다렸다. 엔딩 DOM 1개, B1 모드·빌드 상태 유지, 이전 typing 잔류 없음. 현재 엔딩의 늦은 드론/폰트 콜백도 `feState===f`와 명령 순번을 확인한다.
- 위 브라우저 검사에서 페이지 JavaScript 오류는 0건이었다. 실제 오디오 청취/음질은 이 흐름 검사 범위가 아니다. 해당 음원 연결·취소 로직은 비교 범위에서 수정되지 않았다.

## 기존 문제와 분리

- `stAfter`의 `setTimeout(()=>stOrigEnding(),300)`에는 새 세션 재확인이 없다. 그 짧은 사이 다른 판을 시작하면 엔딩을 덮을 수 있는 경합 가능성은 baseline에도 같은 코드로 존재한다. 이번 회귀 finding으로 세지 않았고, 여기서는 실제 재현된 신규 F01과 구분한다.
- 일반 세트 도장의 지연 효과음·애니메이션 콜백도 이전 코드에 존재한다. 새 드론 콜백의 취소와 혼동하지 않았다.
- B1을 배지 대신 큰 도장으로 표현하는 것, 긴 주마등, 빠른 초반 단어, 불꽃 밀도, 메시지 단어 32개, 첫 B1 대사는 문서상 사용자 승인된 설계다. 결함으로 세지 않았다.
- `drawFlyer`의 `source-over` 복귀가 주석에 흡수된 줄(`runtime.js:546`)은 렌더 담당에게 전달했다. 이 보고서에서 별도 중복 finding으로 세지 않았다.

## 실행 환경과 한계

Windows의 설치 Chrome, Playwright, 390×844, 새 프로필. 현재 및 baseline HTML을 요청 가로채기로 그대로 공급했다. 첫 localhost 직접 접근은 환경의 `ERR_NETWORK_ACCESS_DENIED`로 실패해서 가로채기 응답으로 전환했다. 외부 폰트 요청은 차단했다. 파일·네트워크 실패를 앱 결함으로 분류하지 않았다. 성능측정은 하지 않았고, Safari 실기기는 확인하지 않았다.

```powershell
& 'C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' reviews/codex-20261017/flow/browser-flow.cjs
& 'C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' reviews/codex-20261017/flow/normal-paths.cjs
```
