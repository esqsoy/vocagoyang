# 문법 체화 설계

FABLE 5,000단어를 순서대로 플레이하면 예문과 해설만으로 영문법이 몸에 배게 하려는 작업의 원본·도구다. 결정과 이유는 [PRINCIPLES 12](../../PRINCIPLES.md#12-문법-순서대로-플레이하면-몸에-밴다), 진행 상태는 [HANDOFF](../../HANDOFF.md)를 따른다.

## 측정

`measure.py`는 빈칸에 정답을 채운 예문을 spaCy로 구문 분석해 문법 항목별 예문 수·처음 나오는 세트·구간별 분포·나오는 세트 수를 보고한다.

```
pip install spacy && python3 -m spacy download en_core_web_sm
python3 pipeline/grammar/measure.py                    # 표로 보기
python3 pipeline/grammar/measure.py --json out.json    # 항목별 집계 저장
python3 pipeline/grammar/measure.py --cards cards.json # 카드별 태그 저장
```

- 자동 분석 추정치다. 현재완료·관계대명사·가정법 등은 정규식으로 보정한다. 판정은 사람이 한다.
- 구간: 0 / 1-5 / 6-20 / 21-45 / 46-50세트.
- `baseline-20261010.json`: 문법 작업 전 기준값(7,140카드). 역사적 기준이므로 덮어쓰지 않는다.

기준값에서 드러난 것(2026-10-10): 기초 문형(be 현재·과거·복수·3인칭 -s·명령문)은 수백~수천 문장인데, 현재완료 약 30, 관계대명사 약 36, if 조건절 21, 가정법 2, 과거완료 1, 분사구문 4문장이다. 규칙은 have ③·would ③ 해설에서 한 번씩 나오지만 뒤의 용례가 거의 없다.
