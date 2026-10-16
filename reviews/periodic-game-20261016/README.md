# esqsoy/periodic-game 정리 패치 (2026-10-16, 미푸시)

영신 요청: 주기율표 게임(첫 게임)을 GitHub 저장소 파일로 정리해 두고, 나중에 보카고양 노하우로 이어 가기. 로컬 원본은 영신이 지웠고 GitHub 것을 기준으로 했다.

- `0001-periodic-game-organize.patch` = periodic-game의 커밋(부모 1cc442d). `periodic-sweden.html.html` → `periodic-sweden.html`(index의 '개선 버전' 링크가 5월 12일부터 깨져 있었음), `README.md`·`AGENTS.md` 추가.
- 푸시가 403으로 막혔다. Claude GitHub 앱에 periodic-game 권한이 없다. 권한이 생기면 periodic-game 클론에서 `git am`으로 적용해 브랜치로 올리고, 영신 확인 뒤 main에 올린다(Pages가 main에서 배포된다).
- 적용되면 이 폴더는 지운다.
