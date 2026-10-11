# 원문 링크와 저장소 경로 대응

대화와 리뷰 파일은 기록 보존을 위해 로컬 절대경로까지 그대로 두었다. 아래 대응표로 찾는다.

| 원문 경로의 끝부분 | 이 묶음 안 경로 |
|---|---|
| work/opus-review-20261011/review.json | [1차 종합 리뷰](opus-review-20261011/review.json) |
| work/opus-review-20261011/각 검토 파일 | [1차 자료 폴더](opus-review-20261011/) |
| work/full-review-20261011/REPORT.html | [전수 읽기 보고서](full-review-20261011/REPORT.html) |
| work/full-review-20261011/review.json | [전수 검토 원장](full-review-20261011/review.json) |
| work/full-review-20261011/cards.json | [카드 고정본](full-review-20261011/cards.json) |
| work/full-review-20261011/coverage.json | [전량 검토 범위](full-review-20261011/coverage.json) |
| work/grammar-review-20261011/각 검토 파일 | [문법 자료 폴더](grammar-review-20261011/) |
| work/opus-review-20261011/repo/저장소파일 | [검토 커밋의 소스](https://github.com/esqsoy/vocagoyang/tree/e9c178d) |

문법 원장의 source_file/line은 카드 고정본의 동일한 내용을 가리킨다. 파일을 바꾸지 않고 복사했으므로 해당 줄 번호도 유지된다. 앱 소스 줄 번호는 아래 **검토 커밋**의 파일에서 확인한다.

- [FABLE 소스](https://github.com/esqsoy/vocagoyang/blob/e9c178d/vocagoyangfable.html)
- [마더텅 소스](https://github.com/esqsoy/vocagoyang/blob/e9c178d/vocagoyangksat2027.html)
- [EBS 소스](https://github.com/esqsoy/vocagoyang/blob/e9c178d/vocagoyangebs2027.html)

과거 59aaf81 로컬 체크아웃의 HANDOFF 전체를 가져오지 않았다. 이번 리뷰의 최종 기록만 최신 저장소 인수인계에 연결해, 과거 미반영 예문 초안이 새 앱 원본으로 혼동되지 않게 했다.
