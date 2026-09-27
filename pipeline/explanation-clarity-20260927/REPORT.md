# Fable 해설 문장·군더더기 전수 검수 · 2026-09-27

51세트의 6,876카드를 모두 확인했다. 그중 기존 해설이 있는 카드는 6,252장이다. 개별 문맥을 읽고 수정 대상을 골랐으며 접속어를 일괄 치환하지 않았다.

## 반영 범위

- 원본 해설 478개를 수정하고 46세트의 복습 카드 3개에 같은 내용을 반영했다. 이번 전수 검수는 총 481카드다.
- 앞선 topic/subject 피드백 3카드를 함께 배포하므로 직전 공개본 대비 해설 변경은 총 484카드다.
- 해설 전체가 불필요했던 7카드에서는 해설만 지웠다. 단어·뜻·예문·발음은 그대로다.
- 수정한 481카드의 해설은 22,514자에서 17,422자로 약 23% 짧아졌다. 전체 해설을 이 비율로 줄였다는 뜻은 아니다.
- 단어의 추가·삭제, 예문 수정, 연습 재배치, 게임·UI 변경은 없다. 51세트·612연습·6,876카드와 기존 저장 키를 유지한다.

## 편집 기준

독립적인 정보는 마침표로 나눈다. 뜻풀이와 다른 표현 소개를 ‘~이며’, ‘~하며’로 억지로 묶지 않는다. 인과·대조 등 실제 관계가 있는 문장은 유지한다.

학습 독려, 중요도·출제 빈도 강조, 단순한 한국어 뜻 반복, 다른 표제어로 벗어나는 여담은 덜어낸다. ‘~와 연결’, ‘뜻이 겹친다’처럼 사용 범위를 알 수 없는 동의어 설명은 구체적인 표현으로 고치거나 삭제한다. 바꿔 쓸 수 있는 뜻을 안내할 때는 대응하는 표제어의 해당 뜻도 확인한다.

동사 뒤의 형태, 전치사 선택, 가산성, 실제 어감·문체 차이, 의미·품사에 따른 발음 차이는 남긴다. 그리스어 원문을 포함한 어근·어원 연구 정보와 출처는 유지한다.

## 대표 수정

| 카드 | 변경 내용 |
| --- | --- |
| topic / subject | ‘겹쳐 쓴다’를 ‘대화·글의 주제는 …로도 표현한다’로 구체화했다. off topic / change the subject는 별도 문장으로 정리했다. |
| start / begin | start a lesson / begin a lesson처럼 바꿔 쓸 수 있는 표현을 양쪽에 제시했다. start the engine의 차이는 남겼다. |
| replace | 막연한 ‘put back과 연결’을 replace the lid / put the lid back으로 바꿨다. |
| respond | ‘respond to+질문·연락. 명사는 response.’로 정리했다. |
| summer / passport | 다른 계절의 표현이나 boarding pass로 벗어나던 해설을 지웠다. |
| figure out / find out | 생각해서 답을 찾는 뜻과 새 사실·정보를 알아내는 뜻을 짧게 설명했다. |
| 어근·동사 결합 과정 | ‘이 단어와 연결해 보자’ 대신 해당 표현의 뜻·구조를 직접 제시했다. |

문법·대체 범위 확인에는 Cambridge의 [replace](https://dictionary.cambridge.org/dictionary/english/replace), [if/whether](https://dictionary.cambridge.org/us/grammar/british-grammar/if-or-whether), [although/though](https://dictionary.cambridge.org/grammar/british-grammar/although), [begin/start](https://dictionary.cambridge.org/grammar/british-grammar/begin-or-start%29) 및 Oxford의 [large](https://www.oxfordlearnersdictionaries.com/definition/english/large_1)를 참고했다.

## 검증

- 모든 DATA 차이가 해설 필드 `c`에 한정됨을 확인했다. 카드 수·순서·나머지 필드·연습 메타데이터가 동일하다.
- HTML의 DATA/MORPHOLOGY/CONNECTIONS 상수를 제외한 부분이 그대로다. 어근·결합 과정의 해설 외 메타데이터도 그대로다.
- 원본 JSON에서 재조립했고 생성된 복습 카드·어근·결합 카드와 원본을 대조했다.
- 기존 검사 8종을 통과했다. 모의 플레이 7,344회, 결합 표현 입력 1,336경로, 과거 완료·이어하기 조합 및 첫 글자 입력·공백·IME 처리를 포함한다.
- reading-core의 어근 원본 동기화 비교는 현행 원본을 현행 DATA와 비교하도록 바로잡았다. 과거 진도 검사는 기존 스냅샷과 해시를 그대로 사용한다.

개별 전후 문구와 세트별 검수 범위는 `findings.json`, 검사 결과는 `validation.json`에 있다. 직전 공개본부터의 전체 변경 이력은 `../player-feedback-20260927.json`에 있으며 역순 적용으로 기존 기준 해시를 복원한다.

배포 전 기준 커밋: `b99dd9bfdb39806a1319d5c71448723bf03df324`. 공개 배포 완료 여부는 GitHub Pages 결과와 공개 HTML 바이트를 확인해 별도로 보고한다.
