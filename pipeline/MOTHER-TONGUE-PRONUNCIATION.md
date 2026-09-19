# 마더텅 발음 자료

`mother-tongue-pronunciations.json`은 기존 17강·6,498카드의 4,028개 영어 표현에 연결되는 별도 발음 자료다. 기존 DATA, 뜻, 순서, 판정, 제한 시간, 진도 키는 변경하지 않는다. Fable·EBS도 변경하지 않는다.

정답 공개와 따라쓰기 화면에서 Fable과 같은 IPA 강세 강조를 표시하고 자동 재생한다. 별도 듣기 버튼은 없으며 Fable처럼 공개된 표제어를 누르면 다시 읽는다. 다음 문제로 넘어가면 아직 시작하지 않은 음성 예약을 취소한다. 이미 시작한 발화는 마칠 수 있으며 하단 소리 토글·종료·새 발화는 기존 음성을 취소한다. 원래의 1,500ms / 650ms 진행 시간은 유지한다.

미국 영어 기준의 넓은 IPA를 사용한다. 기본 자료는 [CMUdict](https://github.com/cmusphinx/cmudict)이며, 원본 해시는 JSON에 기록했다. 구 표현은 구성 단어의 사전형 발음을 연결했다. 미등재 파생어와 전문어, 품사별 발음은 따로 검토했고 각 항목의 `basis`와 `sources`에 사전 확인과 규칙적 추정을 구별했다. 전 항목을 개별 사전에서 확인한 자료는 아니다. CMU 라이선스는 별도 파일과 독립 실행 HTML 모두에 포함한다.

`meanings`는 기존 한국어 뜻 문자열과 정확히 일치하는 경우에만 적용한다. 한 카드에 품사가 여럿이면 `label`과 `alternatives`로 IPA를 구별한다. 음성은 Fable과 같이 브라우저의 SpeechSynthesis를 사용하며 기기별 음질·발음은 달라질 수 있다. IPA를 음성 엔진에 강제로 주입하는 방식은 아니다. 일부 동형어에는 `to house`, `a wound`처럼 짧은 문맥을 붙여 잘못 읽을 가능성을 줄인다. 괄호 속 철자 설명과 대안 기호는 읽지 않는다.

저장소 루트에서 실행:

```sh
python pipeline/assemble-mother-tongue-pronunciations.py
python pipeline/assemble-mother-tongue-pronunciations.py --check
node pipeline/test-mother-tongue-pronunciation-data.cjs
node pipeline/test-mother-tongue-pronunciation.cjs
node pipeline/test-mother-tongue-layout.cjs
```

첫 검사는 카드별 발음 누락·뜻 연결·표기 정리·원본과 HTML 일치를 확인한다. 두 번째 검사는 Fable식 표시, 정답 노출 시점과 음성 동작을 실제 앱 함수로 검사한다. 세 번째 검사는 데이터·판정·진도·시간 보존과 글자 칸 입력을 전체 카드로 확인한다. 발음 데이터만 변경할 때는 JSON을 수정한 뒤 다시 조립한다.
