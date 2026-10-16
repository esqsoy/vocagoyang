# 2026-10-17 renderer read-only review

대상: `5b4ffee..0d0f516`, `pipeline/set-stamp/runtime.js`, `style.css`, 생성된 FABLE HTML. 앱 원본은 수정하지 않았다. 이 폴더의 검증 도구·결과·스크린샷만 추가했다.

## 채택할 결함

### R1 · P2 · 광원 뒤 합성 모드를 돌리는 코드가 주석에 먹혀 글자도 가산 합성된다

- 위치: `pipeline/set-stamp/runtime.js:546` (관련 호출 543, 548–549).
- `// 무대 위끝에서 잘려 네모 자국이 남지 않게ctx.globalCompositeOperation='source-over';`에서 모드 복귀 문장이 주석 안에 있다. 따라서 sprite glow에 필요한 `lighter`가 텍스트까지 이어진다.
- 실제 Chrome에서 `reading`을 그릴 때 `strokeText`와 `fillText` 모두 `globalCompositeOperation === 'lighter'`였다. fillStyle은 `#9b85f2`인데 화면 글자는 빛과 더해져 흰색으로 날아간다. 어두운 테두리도 빛을 가리는 방식으로 작동하지 못한다.
- 재현: `vocagoyangfable.html#ending`을 열고 첫 메시지 reading을 본다. 직접 복귀 코드 한 문장을 실행 가능하게 옮기면 된다. 화려한 광원 자체를 줄일 이유는 없다.
- 증거: `message-original.png`와 `message-source-over-proof.png`. 후자는 앱 파일 변경 없이 검증 브라우저의 텍스트 그리기 직전만 source-over로 복귀시킨 대조 화면이다. 보라색 본문과 어두운 외곽선이 살아난다. 이 대조 이미지는 수정 완료본이 아니다.
- 기계 기록: `browser-results.json → glow.log`.

### R2 · P2 · 작은 화면에서 드론의 BIG가 화면 위로 나가 MOUNTAIN만 보인다

- 위치: `pipeline/set-stamp/runtime.js:445`.
- 하늘 영역의 y0를 처음에는 `-offY + 10`으로 제한하지만, 높이가 90px보다 작으면 곧바로 `y0 = y1 - 90`으로 다시 덮는다. 산·말풍선이 이미 화면 높이를 쓰는 작은 화면에서는 이 값이 뷰포트 위로 나간다. 새 드론 기능의 문제다.
- 재현: 320×568 Chrome에서 `#ending` → 쌓기 건너뛰기 → 한뫼 대사(전체 엔딩 step 5, "일산의 옛 이름은 한뫼…")까지 진행하고 드론 형태가 완성될 때까지 기다린다. BIG는 화면 밖이고 MOUNTAIN만 보인다. 844×390 가로 화면에서는 거의 전체 글자가 잘린다.
- 실제 픽셀 좌표: 320×568은 빛나는 드론 중심 650개 중 169개가 y<0, 가장 위 -30.90px. 360×640은 28개, -4.51px. 844×390은 526개, -66.35px. 390×844에서는 0개로 정상이다. 이는 효과가 화면 밖으로 퍼지는 의도와 달리, 이야기를 전달하는 글자 자체가 사라지는 문제다.
- 증거: `smallphone-bigmountain.png`, `landscape-bigmountain.png`, `browser-results.json → geometries`.
- 수정 방향: 하늘 높이를 90px로 강제하며 위로 밀지 말고, 실제 사용 가능한 상단 공간을 기준으로 드론 글자를 축소하거나 무대/드론 영역 높이를 함께 조정한다. 대사 줄 수 변경 뒤의 무대 위치도 반영해야 한다.

## 별도 관찰 · 주 결함으로 올리지 않은 항목

- **P3, 새 도장 reduced-motion 예외 누락:** `style.css:67–72`. JS는 reduced-motion에서 쌓기를 즉시 마치고 불꽃·드론을 만들지 않는다. 실제 parts=0이었다. 다만 새 `.fe-bigstamp .st-ink`는 reduced-motion에서도 `festamp`(0.55초, scale 1.9, translateY -34px, 회전)를 실행한다. 기존 `.fe-badge`의 endpop도 남는다. 도장 효과를 평상시 줄이자는 의견이 아니라, 사용자가 동작 줄이기를 켰을 때 이 새 효과도 정지 상태로 보여줄 수 있다는 지적이다. `stamp-results.json`에서 reduced=true와 animation=festamp를 함께 확인할 수 있다.
- **기존 동작, 회전 뒤 산 캔버스 크기 고정:** `runtime.js:304–305`, `331–332`. 844×390에서 연 뒤 390×844로 회전하면 산 캔버스가 여전히 480×226, x=-45가 되어 좌우 45px씩 잘린다. 이번 배경 FX는 resize를 처리하지만 산 크기 초기화 방식은 기준 커밋에도 있었으므로 이번 회귀 항목으로 올리지 않았다. 증거 `rotate-landscape-to-portrait.png`, `browser-results.json → rotated`.
- **보류, 빠른 진행 중 피날레와 드론 중첩:** `runtime.js:553–561`, `597–602`. 피날레는 약 9.5초까지 타이머로 이어지는데, 금빛 단어가 없으면 대사는 곧바로 시작한다. 사용자가 네 번 빠르게 진행하면 드론 동안 이미 예약된 starmine/finale가 계속 발사될 수 있다. dHold는 idle만 막는다. 실제 자연스러운 읽기 속도에서의 방해 정도를 이 분담에서는 측정하지 않았으므로 결함으로 단정하지 않았다.
- **성능 수치 없음:** 전체 60초 정상 재생 성능은 root가 독립 측정한다. 이 폴더의 브라우저 검사는 수동 프레임으로 기하·색·상태를 확인했으므로 FPS 근거로 사용하면 안 된다. 9,000알갱이 제한은 생성 한 번의 원자적 상한이 아니라 burst 진입 시점 기준이다. 이 사실만으로 현재 성능 결함이라고 판정하지 않았다.

## 확인해 기각한 의심

- 실제 데이터 순서가 메시지 이야기와 다르다는 의심: 기각. 32개 full / 20개 B1 모두 문서 순서와 일치한다. full은 1.000→59.000초, 간격 2.746→1.200초. B1은 1.000→29.000초, 간격 1.784→1.200초. 실제 단어 차례보다 앞당긴 메시지는 없다. `schedule-results.json`에 각 표제어·세트·실제 차례·메시지 시각이 있다.
- 메시지 지연으로 끝없이 쌓기 상태가 남는다는 의심: 기각. 마지막 full 메시지는 59초, hold 1.1초+비행0.75초로 자연스럽게 종료 가능하다. B1도 같은 원리다.
- fillBand가 현재 단어를 조용히 누락한다는 의심: 기각. 이 Chrome 글꼴 환경에서 6,531개 세트별 표제어 모두 6,531개 위치를 받았다. 글자 배율 범위는 0.8845–1.1926. 전역 고유 표제어 6,198과는 세트 간 재등장 때문에 다르다.
- B1 도장 padding7%가 화면 폭 기준으로 커져 그림을 망친다는 의심: 기각. `.fe-bigstamp` wrapper가 카드와 같은 230.4/270px 폭이어서 padding은16.125/18.891px이다. 390·1280에서는 settled 카드270px. 수치·날짜·버튼 모두 온전하다. `b1-stamp-reduced.png`.
- 비동기 필기체 font/panic 콜백이 다음 드론 모양을 덮는다는 의심: 정적 검토상 기각. dSeq와 feState===f 조건으로 늦은 콜백을 막는다. 반복 개방 시 타이머는 최대 수초 동안 옛 상태를 보유할 수 있으나, 닫힌 화면에 추가 실행하지 않는다.
- 생성 HTML 불일치: `node pipeline/set-stamp/build.cjs --check` 통과.
- 기존 기능 검사: `node pipeline/tests/set-stamp.test.cjs` 통과. 이 테스트는 메시지의 목록 존재만 검사하고 실제 canvas 합성·화면 밖 드론은 검사하지 않는다.

## 학습과 엔딩의 의미 · P3 의견

이번 엔딩의 강점은 학습한 표제어가 장면의 재료가 되고, 마지막 carry on → pay off가 노력을 계속한 학생의 경험을 짧게 닫는 점이다. 앞의 단어는 빨리, 메시지는 읽히게 처리한 방향은 승인된 축하 연출 목적과 잘 맞는다. 반복 학습 화면처럼 뜻·해설을 다시 얹거나 불꽃을 임의로 줄일 필요는 없다.

다만 0.7–1.1초의 단독 영어 표제어는 복습 시험보다는 감정적 회수에 가깝다. 학습 효과를 더 논의한다면 장면 자체를 설명문으로 채우기보다, 도장 앞 오답 단어 청취가 실제 복습을 맡고 엔딩은 성취를 기억시키는 역할이라는 분담을 유지하는 편이 낫다. 정답·의미를 확인하는 복습 기능을 이 장면이 대신한다고 주장할 근거는 없다.

## 재현 파일

- `schedule.cjs`: 현재 HTML을 기존 VM harness로 읽어 실제 seq와 메시지 시간표 재구성. 앱 파일 쓰기 없음.
- `browser.cjs`: Chrome의 Canvas 메서드를 관찰하고 rAF를 수동 진행해 스크린샷·좌표 확보. source-over 대조는 검증용 메모리 안에서만 적용. 외부 글꼴 로드 완료 후 실행.
- `stamp.cjs`: reduced-motion 상태의 B1 도장 기하·CSS animation 확인.
- Node: `C:/Users/Young/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
- Browser: `C:/Program Files/Google/Chrome/Application/chrome.exe`.
