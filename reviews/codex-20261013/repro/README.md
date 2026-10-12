# 재현 방법

앱 기준은 921e8ff다. 결과 파일은 기본적으로 운영체제 임시 폴더의 `vocagoyang-review-20261013`에 쓴다. `REVIEW_OUT`으로 바꿀 수 있다. 추적된 앱·증거 파일은 고치지 않는다.

저장소 루트에서 Node와 Git이 PATH에 있는 상태로:

```sh
node reviews/codex-20261013/repro/migration-audit.cjs
node reviews/codex-20261013/repro/restoration-audit.cjs
node reviews/codex-20261013/repro/browser-audit.cjs
```

- Git 경로를 따로 지정하려면 `GIT_EXE`를 쓴다.
- 브라우저 검사는 Playwright 패키지와 Chrome이 필요하다. 패키지를 Node가 찾게 설정하고, Chrome 경로가 기본 설치와 다르면 `CHROME_PATH`를 지정한다. 외부 사이트에는 접속하지 않으며 로컬 정적 서버를 쓴다.
- `browser-seeds.json`은 실제 학생 자료가 아닌 합성 저장값이다. 구버전 저장 형식으로 완료·저장 카드·축하 확인값을 구성했다.
- 브라우저 검사는 정상 통과 항목과 **재현되는 life 오표기**를 함께 기록한다. 이 스크립트의 종료 코드 0이 모든 카드가 정상이라는 뜻은 아니다.
- 검사 이후 앱이 바뀌었다면 921e8ff 별도 체크아웃에 이 리뷰 폴더만 복사해 재현한다. 런타임 보조 모듈은 해당 체크아웃에서 읽는다.

Windows에서 milestones의 CRLF 문자열 비교만 정규화하려면:

```sh
node --require ./reviews/codex-20261013/repro/normalize-lfs.cjs pipeline/tests/milestones.test.cjs
```

형태 오류를 수동 재현하려면 FABLE 1세트에서 life② 카드를 열고 `life`를 입력한다. 공개문에 `lifes`가 보인다. 보관된 화면은 [life-reveal.png](../evidence/life-reveal.png)다.
