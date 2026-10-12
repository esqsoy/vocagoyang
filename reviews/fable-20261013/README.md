# Fable 독립 검토 · 2026-10-13

영신: "2번으로 해보는거 어때? 노력의 정도도 설정가능해?" → 노력 단계 xhigh(영신 "엑스트라로 바꾸자"), 대상은 지금 판(a8bbbd3, 영신 선택). "아스트라 리뷰와 같은 과정을 거치면 돼 … 반영할만한게 있으면 반영하고 배포해줘."

## 방법

- Claude가 하위 에이전트 5명을 Fable 모델·노력 xhigh로 띄웠다. 각자 acfe20e 이후 바뀐 카드 1,651장 중 세트 범위 한 몫(307~359장)을 전부 읽었다.
- 공통 지침: [BRIEF-REVIEW.md](BRIEF-REVIEW.md). 아스트라가 이미 낸 23건과 일부러 남긴 판단은 다시 내지 않게 했다. 해설을 줄일 때 한정어를 지우지 않는다는 원칙(PRINCIPLES 2-2, 26.10.13)은 검토자에게 미리 알려 주었다.
- 저장소는 건드리지 않았고, 결과는 카드별 판정([findings-1~5.json](findings-1.json))과 반영안으로 받았다. Claude가 지적마다 직접 확인해 반영할 것만 골랐다([applied-proposal.py](applied-proposal.py), 원장 `fable-review-20261013`).

## 결과

24건: 오류 0 · 보완 11 · 제안 13. **20건(카드 23장)을 반영했고 4건은 반영하지 않았다.**

| 종류 | 반영한 카드 |
|---|---|
| 줄이며 빠진 한정어·범위 | lend ①(loan은 주로 미국), railway ①(미국은 주로 railroad), congregation ①(보통), pond ①(보통), ought ①("늘" 빼기), third ①(21st·22nd·23rd 예외), angle ①(평면: 종이에 그린 삼각형) |
| 같은 칸 수 경쟁어 | even ②/much, rather ③/fairly, path ①/lane, screw ③/twist, minister ②/preacher, clue ①/hint(이 문장에서는 안 바뀌어 구별로 고침) |
| 카드 안 불일치 | the ① 해설 예시 dog → cat, specialize ①(예문은 in 없이 씀) |
| 소설 인용 표기 | mistake ①·beginning ①·depend ①·moral ② 작가 이름, believe ①은 『피터 팬』 13장 제목임을 밝힘 |
| 사실·겹침 | gene ①(단백질을 만드는 유전자는 "대부분"이 아니라 "많은"), state ②(0세트 fifty와 같은 "미국은 50개 주" → 알래스카), queue ①(발음 설명) |

Claude가 문구를 조정한 곳: third(더 짧게), path(footpath의 "영국" 한정어 유지), screw(표준 문구), beginning(해설 말투 평서문), state(fifty 대신 state 쪽을 바꿈).

**반영하지 않은 것**

- seventy(F1-04): 검토자는 "한국 땅의 약 70%가 산"을 산림청 산림 면적(63%)과 비교했다. 그런데 산림(토지 피복)과 산지(지형)는 다른 수치다. 70%는 교과서·백과사전의 산지 비율이고, 예문에 About도 있다. 지형 정의에 따라 더 낮게 잡는 2013년 논문은 있다. 0세트 영신 직검수 카드라 그대로 둔다.
- network/trade(F1-06): 같은 세트의 실크로드 지식 예문 짝이다. 작업 전부터 있던 짝이라 건드리지 않았다.
- gross ②(F4-02): GDP 예문에 value를 넣자는 제안이다. 17단어로 길어지고, 예문은 전부터 있던 것이며 해석이 "값"을 채운다.
- anthropology(F5-03): 문장이 참이고 선택 사항이다.

## 검증

- 검토자들이 확인했다: 소설 명문장 135장 원문 대조와 화자·장면, 정답을 채운 어미 꼴, 날짜·사실·강세·발음 표기. 새로 찾은 오류는 없었다.
- 사전 사이트는 프록시 403으로 열지 못해 검색 결과 요약과 자체 지식으로 확인했다고 밝혔다.
- 반영 뒤(Claude, 새로 실행): Codex 검사 35개 + set5.test 36/36, Chromium 390px smoke 콘솔 오류 없음, ordercheck 2개 이상 0, linecheck 390·360px 초과 0, deepcheck A5·A7 0.
