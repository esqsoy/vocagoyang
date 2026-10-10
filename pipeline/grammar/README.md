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

## 초안 (2026-10-10)

- `syllabus-draft-20261010.json`: 문법 지도 143항목. 구간(처음 소개하는 세트)·등급(노출 목표 집중 15·표준 8·주변 3회)·한국 학습자 약점·수능 어법 핵심·EGP 첫 수준. 읽기 페이지: https://claude.ai/artifact/Dhp7PgRApVa9LctYUgmNV6
- `set0-draft-20261010.json`: 0세트 전체 234장·23연습 초안(초석 45장 + 기존 0세트 187장 + Oxford no one·ice cream). 초석 44장 시범본을 이어받았다. 26.10.10 영신 "완벽합니다...갑시다!"로 데이터에 반영했다(로컬·배포 전, [pipeline README](../README.md#0세트-재구성--2026-10-10)). 읽기 페이지: https://claude.ai/artifact/BB5W7HkzszXtuQ1H2UnC8E
- 근거: 최신 연구(명시적 규칙 뒤 직접 쓰기, 첫 소개 뒤 고른 반복, 날을 달리한 재회, 한국어가 허용하는 오류에 O/X), 수능·평가원 23회 어법 정답 포인트, Cambridge EGP 수출본. 2022 교육과정 [별표 4] 원문 대조는 네트워크 제한으로 남았다.
