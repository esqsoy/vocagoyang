# 발음 예외 음원

2026-10-15 영신이 contract 명사·동사 샘플을 듣고 구현을 승인했다. 샘플 A의 Heart(`af_heart`)를 기본으로 삼았다. 담당은 Codex다.

## 범위와 원본

- 일반 단어는 기존 미국식 브라우저 TTS와 속도 0.88을 유지한다.
- 예외는 **현재 카드의 표제어 + IPA 문자열**이 모두 맞을 때만 재생한다. 같은 철자라는 이유로 명사 음원을 동사 카드에 재사용하지 않는다.
- [catalog.json](catalog.json): 품사·의미 대조, 실제 IPA 별칭, 직접 지정한 Kokoro 음소, 사전 근거. [AUDIT.md](AUDIT.md): 선정·제외·변이 처리 근거.
- [../../assets/pronunciation/manifest.json](../../assets/pronunciation/manifest.json): 실제 파일 크기·길이·SHA256·생성 조건과 제작 모델 출처.
- `assets/pronunciation/*.mp3`: 24kHz mono, 64kbps. 모델·Python 패키지·WAV는 게임에 넣지 않는다.
- IPA 여러 개를 함께 제시하는 미분리 카드는 하나의 음원으로 임의로 확정하지 않는다. 기존 문맥 TTS가 남는다.
- 마더텅 `compliment` 명사는 사전과 실제 원문 `brand compliments`를 대조해 /ˈkɑmpləmənt/로 바로잡았다. 단어·뜻·예문·진도는 바꾸지 않았다.

## 재생

현재 카드 하나만 native Audio로 미리 읽는다. 전체 음원을 페이지 시작 시 내려받지 않으며, 브라우저 HTTP 캐시를 이용한다. 파일 URL에는 내용 해시가 붙어 후속 음원 교체 시 캐시가 갱신된다.

정답 공개·오답 따라쓰기 전의 읽기·따라쓰기 완료·정답 터치·결과 화면 복습에 같은 뜻별 음원을 쓴다. 따라쓰기 중에는 음성만 나오고 입력칸 위 IPA 효과는 입력을 마칠 때 나온다. 재생·무음·다음 카드·화면 이탈·백그라운드 전환에서 이전 음원과 지연 콜백을 취소한다.

FABLE 세트 도장 복습에서도 IPA가 하나인 행에는 같은 음원을 쓴다. 여러 뜻을 묶은 행에 서로 다른 IPA 또는 누락이 있으면 기존 TTS로 둔다. 수동 닫기·새 게임·다른 복습창은 재생을 취소하며, 마지막 단어에서 도장으로 넘어가는 자동 전환은 음성을 유지한다. 관련 회귀 검사는 `stamp.test.cjs`다.

`playing`과 `ended`에 시각 효과를 연결한다. 음절 내부 시점은 **실측 파일 길이에 나눠 맞춘 추정**이며 음소별 강제 정렬은 아니다. 녹음 시간은 브라우저 음성의 보정 캐시에 섞지 않는다. MP3 실패·차단·로딩 시간 초과는 기존 TTS로 한 번만 전환한다. 이때 브라우저 TTS의 발음 한계도 다시 적용된다.

`his`의 어말 /z/에는 자연스러운 부분 무성화가 있을 수 있다. 고정 음소 /hɪz/로 제작한 것이 모든 음향 구간에서 완전한 유성을 강제한다는 뜻은 아니다.

## 재생성

제작 환경에 `numpy`, `onnxruntime`, `imageio-ffmpeg`를 준비한다. 모델 디렉터리는 `model.onnx`, `tokenizer.json`, `af_heart.bin`, SHA256과 출처를 기록한 `sources.json`을 포함한다. 사용한 정확한 리비전·해시는 manifest에 있다.

```text
python pipeline/pronunciation-audio/generate.py --model-dir /path/to/models --runtime-dir /path/to/optional/pip-target
node pipeline/ipa-effects/build.cjs
```

생성기는 같은 제작 조건·음소·해시의 기존 파일을 보존한다. `--approved-samples`에 최초 contract 샘플 폴더를 주면 승인된 MP3 바이트를 그대로 사용한다. 신경망 재생성이 매번 같은 바이트를 보장하지 않으므로 승인 파일을 불필요하게 덮어쓰지 않는다.

공통 IPA 빌더가 음원 표·런타임을 세 HTML에 함께 넣는다. 생성 구간만 직접 고치지 않는다. 일반 어휘·표제어/뜻 구분·별칭 판정과는 독립적이다.

```text
node pipeline/pronunciation-audio/runtime.test.cjs
node pipeline/pronunciation-audio/host.test.cjs
node pipeline/pronunciation-audio/build.test.cjs
node pipeline/pronunciation-audio/stamp.test.cjs
node pipeline/pronunciation-audio/browser.test.cjs
node pipeline/pronunciation-audio/browser-stamp.test.cjs
node pipeline/ipa-effects/build.cjs --check
```

브라우저 검사는 Playwright와 Chromium이 필요하다. 필요시 `PLAYWRIGHT_MODULE`·`PW_CHROMIUM` 경로를 지정한다. 임시 로컬 HTTP 서버와 새 브라우저 프로필로 검사하며 학생 기록을 건드리지 않는다. `browser.test.cjs`는 `PRONUNCIATION_BASE_URL`을 지정하면 배포된 같은 앱에서도 검사할 수 있다.

## 출처와 검증 한계

- 제작 모델: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), Apache-2.0. ONNX 파일: [onnx-community](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX).
- 음소 체계: [Misaki](https://github.com/hexgrad/misaki), [Kokoro 공식 phoneme 예제](https://github.com/hexgrad/kokoro/blob/main/examples/phoneme_example.py). 사전의 음성 파일을 복제하지 않고, 검증한 발음을 직접 지정해 합성했다.
- 원래 contract 두 음원의 음질은 영신이 확인했다. 나머지 전체의 개별 청취를 완료했다고 주장하지 않는다. 파일 디코딩·무음/클리핑 검사와 발음의 청각적 자연스러움은 다른 검사다.
- 실제 학생 iPhone Safari 청취·기기 전환은 후속 확인 대상이다. 자동 Chromium 검사를 실기기 검증으로 부르지 않는다.
- 결과 화면의 마지막 복습 행이 다음 연습으로 자동 이동하면 음성이 짧게 끊길 수 있다. 기존 결과 화면 이동 방식이며 이번 작업에서 바꾸지 않았다.
