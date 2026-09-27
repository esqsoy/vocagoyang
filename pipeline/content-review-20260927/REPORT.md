# FABLE 전수 내용 검수 · 2026-09-27

> 후속 상태: 아래는 어휘 풀 변경 승인 전의 검수 기록이다. 이후 운영자가 추가·통합 제안을 승인하여 [어휘 풀 보완](../pool-expansion-20260927/REPORT.md)에 반영했다. 이번 배포에는 이 검수 결과도 함께 포함된다.

51개 세트의 6,861개 카드를 전부 읽고 검수했다. 174개의 원본 카드에서 193개 필드를 수정했으며, 복습 카드 자동 반영까지 합치면 175장·195개 필드가 바뀌었다. 단어·뜻 카드 추가와 삭제는 실행하지 않았다.

예문 20, 해설 142, 뜻 11, 번역 18, 고양이 대사 4개 필드. 어원 대표 카드 43장(그리스 16·라틴 22·고대영어 5)의 해설 개선을 포함한다.

## 검수 기준

뜻의 범위, 실제 문장 구조와 품사, 자연스러운 결합, 번역의 정확성, 동의어의 겹침, 영미 용법·발음 변이, 추측성 어원 풀이, 불필요한 학습 지시를 함께 보았다. 먼저 전체를 읽은 후 불확실한 항목의 사전·문법·어원 출처를 확인했고, 수정안은 다른 검수와 다시 대조했다.

## 검증

7개 기존 검사 모두 통과. 7,344개 모의 학습 세션과 1,336개 입력 경로를 포함한다. 원본 카드·정답·허용 정답·배치·연습 수·게임 코드·UI는 보존했다. 변경 필드 외 데이터 전체가 검수 전과 같은지도 비교했다. 미리보기에서 제공하는 데이터의 SHA-256도 원본 수정본과 일치한다.

GitHub 배포는 하지 않았다. 로컬 미리보기 http://127.0.0.1:8774/?layout=space 에 반영했다.

## 다음 추가 제안 — 아직 미적용

다음 우선순위는 현재 교재의 실제 누락과 독해에 미치는 역할에 따른 편집 판단이다. 학생 오답률·시험 빈도로 효과 크기를 측정한 결과는 아니다. 기존 해설·동의어·허용 정답에 등장하는 경우와 해당 단어를 직접 회상하는 카드가 있는 경우를 구별했다.

| 후보 | 뜻 | 제안 우선순위 | 확인된 공백 |
|---|---|---|---|
| eventually | 결국, 시간이 지나 마침내 | 중 | eventually 자체는 표제어·예문·해설·허용 정답 모두에 없다. 다만 finally의 시간 경과 후 결과와 나열의 마지막이라는 두 의미를 이미 직접 학습한다. |
| virtually | 거의, 사실상 | 상 | virtually·virtual은 전체 데이터에 없다. almost·nearly·practically의 거의라는 뜻은 이미 직접 연습한다. |
| respectively | 앞서 말한 순서대로 각각 | 상 | respectively·respective은 전체 데이터에 없다. each와 individually는 있지만 두 목록의 순서 대응을 연습하지 않는다. |
| thereby | 그렇게 함으로써, 그 결과로 | 상 | thereby는 전체 데이터에 없다. thus와 therefore는 결과·결론 뜻으로 직접 학습하지만 thereby를 쓰는 행위-결과 연결은 없다. |
| given | ~을 고려하면 | 상 | 전치사 given을 목표 답으로 하는 카드는 없다. give의 과거분사 설명 2회와 given rules의 수식어 용법 1회, 허용 정답 3곳은 있다. considering·in light of로 의미는 배운다. |
| nothing but | 오직, ~밖에 없는 | 상 | 표현 자체의 직접·간접 제시가 없다. nothing, but=except, only는 있다. |
| anything but | 결코 ~이 아닌 | 상 | 표현 자체가 없다. anything과 but=except는 별개로 존재한다. |
| even if | 설령 ~하더라도 | 상 | even if 자체가 없고, even·if·though·although를 각각 배우는 정도다. |
| even though | 실제로 ~인데도 | 상 | though·although·despite의 양보 의미는 이미 직접 학습하지만 even though라는 결합은 없다. |
| worry | 걱정시키다 | 중 | worry의 목표 카드에는 자동사 걱정하다만 있다. worried 해설에 worry=걱정하게 하다가 이미 명시되어 있고, worrying 및 concern 타동사도 학습한다. |
| surprise | 놀라게 하다 | 중 | 명사 surprise와 형용사 surprised·surprising은 목표 카드가 있다. surprise someone 동사는 없으며 shock가 유사한 원인 주어 문형을 연습한다. |
| bill | 법안 | 중 | 법안은 기존 카드 ko에 지폐와 함께 쓰여 있고 대사에도 있으므로 의미가 완전히 빠진 것은 아니다. 그러나 목표 예문이 지폐여서 법안을 회상할 상황은 없다. |
| furnish | 정보·증거 등을 제공하다 | 중 | furnish는 가구를 갖추다 한 카드뿐이다. provide/supply는 이미 학습한다. |
| entertain | 생각·가능성을 고려하다 | 상 | 즐겁게 하다·손님 대접하다만 있고, 생각이나 가능성을 검토하는 entertain은 없다. consider/contemplate라는 다른 철자의 유사 뜻은 있다. |
| essential | 필수적인; 본질적인 | 상 | 표제어·목표 예문·허용 정답에는 없다. essence 카드 해설에 essential(필수적인)이 한 번 등장한다. |
| as long as | ~하기만 하면, ~하는 한(조건) | 상 | 전체 데이터에 이 표현이 없다. long의 기간 의미와 provided/providing 조건 의미는 따로 있다. |

독립 단어 후보는 eventually, virtually, respectively, thereby, given, essential. 기존 표제어의 뜻 보충 후보는 entertain, furnish, worry, surprise와 bill의 법안 의미 분리. 결합 표현 후보는 nothing but, anything but, even if, even though, as long as다. essential의 두 뜻을 나누면 전체 약 17카드 규모이며, 새 어족 17개라는 뜻은 아니다.

중복 통합은 proceeding/proceedings의 법적 절차 의미와 tyre/tire의 철자 변이를 후보로 제안한다. tempt의 두 카드는 의미가 가깝지만 능동·수동 구문 회상에 도움이 될 수 있어 당장 줄일 필요는 낮다. 어느 후보도 실제로 삭제하지 않았다.

## 변경 내역 전체

ID는 검수 전 DATA의 세트:원본 연습 번호:0부터 시작하는 카드 위치다. 화면의 분할 Exercise 번호와는 다르다. 원본/복습 중복은 구분해 기록했다.

| ID · 단어 | 항목 | 이전 | 수정 |
|---|---|---|---|
| 0:9:9 · homework | 예문 | I forgot my English {{BLANK}} at home. | I left my English {{BLANK}} at home. |
| 1:5:5 · home | 해설 | 건물보다 '보금자리'에 가깝다. house는 건물로서의 집, home은 마음이 머무는 곳이다. | home은 자신이 사는 집·생활 터전. house는 건물에 초점을 두고, home은 그곳에서 사는 사람과 생활에 초점을 둬. |
| 1:7:2 · house | 해설 | house=건물(물리적) / home=가정·보금자리(마음). | house는 사람이 사는 건물, home은 누군가가 사는 집·생활 터전. 아파트나 고향도 그 사람의 home이 될 수 있어. |
| 2:6:1 · other | 뜻 | ② (the other) 둘 중 나머지 하나 | ② (the other) 나머지 하나 |
| 2:6:1 · other | 해설 | 둘뿐일 때, 하나를 뺀 '그 나머지 하나'. 정해진 것이라 the가 붙는다. | 정해진 것 중 나머지 하나. one ... the other ...로 두 대상을 구별할 때 흔히 써. |
| 2:6:2 · other | 해설 | 셋 이상일 때 남은 것 '전부'. the other(둘 중 나머지 하나) / the others(셋 이상 중 나머지 전부). | 정해진 무리에서 남은 여러 사람·여러 개 전부. 하나가 남으면 the other, 여럿이면 the others. |
| 3:10:9 · march | 고양이 대사 | 3월에 행진하는 건 대문자 March뿐이라고양. 소문자는 행진이고양. | 달 이름 March는 대문자, 행진하는 march는 소문자라고양. 3월에 행진하면 둘 다 만나고양. |
| 4:8:10 · learn | 해설 | study=공부하다(과정) / learn=익히다·배워서 알게 되다(결과). study English / learn English. | study는 공부하는 활동, learn은 지식·기술을 익히는 것. I am learning처럼 배우는 과정에도 써. |
| 4:10:7 · bill | 고양이 대사 | bill, 청구서도 지폐도 법안도 다 같은 단어라고양. 돈이 핵심이고양. | bill, 청구서도 지폐도 법안도 다 같은 단어라고양. 법안은 돈 얘기가 아닐 수도 있다고양. |
| 5:3:6 · his | 예문 | I like {{BLANK}} new hair. | I like {{BLANK}} new haircut. |
| 6:5:8 · drive | 해설 | drive A mad = A를 미치게 하다. 미국에선 crazy를 더 쓰고, mad는 보통 '화난'. | drive는 어떤 상태로 몰아가다. drive A crazy/mad는 A를 미치게 하다·몹시 짜증 나게 하다. |
| 6:7:11 · practice | 예문 | Taking off shoes is common {{BLANK}} in Korea. | Taking off shoes before entering a home is common {{BLANK}} in Korea. |
| 6:7:11 · practice | 번역 | 한국에선 신발 벗는 게 흔한 관행이야. | 한국에선 집에 들어가기 전에 신발을 벗는 게 일반적인 관행이야. |
| 8:2:15 · committee | 고양이 대사 | committee, 위원회. m·t·e가 두 개씩이라고양. 철자 시험 단골이고양. | committee, 위원회. m·t·e가 두 개씩이라고양. |
| 8:5:9 · notice | 예문 | Did you {{BLANK}} her new hair? | Did you {{BLANK}} her new haircut? |
| 9:6:0 · finger | 해설 | 엄지는 따로 thumb. 그래서 finger는 보통 4개로 센다. | 엄지는 thumb. finger는 엄지를 제외해 쓰기도, 포함해 다섯 손가락을 통틀어 말하기도 한다. |
| 9:8:8 · successful | 해설 | succeed(동사)-success(명사)-successful(형용사) 세트로. | succeed는 동사, success는 명사, successful은 형용사. |
| 10:2:0 · belief | 번역 | 너에 대한 내 신념은 굳건해. | 너에 대한 내 믿음은 굳건해. |
| 10:3:2 · complete | 번역 | 그 파티는 완전한 깜짝 파티였어. | 그 파티는 전혀 예상하지 못한 일이었어. |
| 10:6:15 · stupid | 해설 | It was stupid of me처럼 성격엔 of. 남에게 대고 쓰면 큰 모욕. | It was stupid of me는 내 행동이 어리석었다는 평가야. 사람에게 직접 stupid라고 하면 모욕이 될 수 있어. |
| 10:8:11 · guest | 해설 | 초대한 손님 guest, 가게 손님 customer, 승객 passenger. | 초대받은 손님이나 호텔 투숙객은 guest, 물건·서비스를 사는 고객은 customer, 승객은 passenger. |
| 11:4:11 · influence | 번역 | 네 새 친구, 너한테 나쁜 영향이야. | 네 새 친구는 너한테 나쁜 영향을 줘. |
| 11:4:11 · influence | 해설 | influence on~=~에 미치는 영향. 안으로 흘러들어 바꾸는 힘. | a bad influence on someone은 그 사람에게 나쁜 영향을 주는 사람·것을 가리켜. |
| 11:5:0 · respect | 해설 | 다시(re) 볼(spect) 만큼 훌륭해서 존경하다. 명사도 respect. | 라틴어 respicere(돌아보다·고려하다)에서 온 말. 명사도 respect(존경·존중). |
| 11:9:1 · pound | 뜻 | ① 파운드 | ① 파운드(무게 단위) |
| 12:2:14 · slow | 해설 | slow down(속도를 줄이다)까지 세트로. 반대는 fast. | slow down(속도를 줄이다). 반대는 fast. |
| 12:7:7 · profit | 해설 | make a profit(이익을 내다) ↔ loss(손해). | 매출에서 비용을 빼고 남는 이익. make a profit(이익을 내다) ↔ make a loss(손실을 보다). |
| 13:4:3 · lock | 해설 | 잠그다 lock ↔ 열다 unlock. 열쇠는 key. | 잠그다 lock ↔ 잠금을 풀다 unlock. 열쇠는 key. |
| 13:5:8 · apart | 해설 | fall apart 무너지다, apart from ~을 빼고. | fall apart는 무너지다. apart from은 문맥에 따라 ‘~을 제외하고’ 또는 ‘~외에도’. |
| 14:5:2 · creature | 해설 | create(창조하다)된 것 → 살아 있는 모든 것. 괴생물 느낌도. | 주로 동물이나 상상 속 생물을 가리키며, 사람에게도 쓴다. 식물까지 포함한 모든 생물은 living things. |
| 16:6:8 · sink | 해설 | 물이 '가라앉아 빠지는' 곳이라 부엌 개수대도 sink. | 부엌의 개수대나 세면대처럼 물을 받아 쓰는 시설. kitchen sink는 부엌 개수대. |
| 16:9:5 · acid | 번역 | 이 산은 금속까지 뚫고 태울 수 있어. | 이 산은 금속도 부식시켜 뚫을 수 있어. |
| 17:8:12 · kingdom | 해설 | the animal kingdom = 동물의 왕국. | the animal kingdom은 생물 분류의 ‘동물계’. |
| 18:1:11 · precious | 해설 | 값을 못 매길 만큼 소중한 것. precious time, precious memory. | 값이 나가거나 개인에게 소중한. precious metals는 귀금속, precious memories는 소중한 추억. |
| 18:6:0 · parliament | 해설 | 영국식 의회가 parliament. 미국 의회는 Congress. | 영국을 비롯한 여러 나라의 의회. 미국 의회는 Congress. |
| 19:3:10 · hunger | 예문 | One apple was not enough to stop my {{BLANK}}. | One apple was not enough to satisfy my {{BLANK}}. |
| 19:4:8 · chemistry | 해설 | chemical(화학 물질)과 세트. 사람 사이의 '케미'도 chemistry. | chemical은 ‘화학의·화학 물질’. 사람 사이의 ‘케미’도 chemistry. |
| 19:8:5 · cord | 해설 | 굵은 끈·전깃줄. 가는 실은 string, 밧줄은 rope. | 끈·전깃줄. 바느질실은 thread, 굵은 밧줄은 rope. |
| 20:6:4 · liquid | 예문 | Water becomes {{BLANK}} when ice melts. | Ice turns into {{BLANK}} water when it melts. |
| 20:6:4 · liquid | 번역 | 얼음이 녹으면 물이 액체 상태가 돼. | 얼음은 녹으면 액체 상태의 물이 돼. |
| 20:8:0 · circular | 예문 | The plane flew in a slow {{BLANK}} path. | The plane followed a {{BLANK}} path above the airport. |
| 20:8:0 · circular | 번역 | 비행기가 천천히 원을 그리는 궤도로 날았어. | 비행기가 공항 위에서 원을 그리는 경로로 날았어. |
| 21:2:7 · ache | 해설 | 머리·이·배가 아프면 headache, toothache, stomachache로 붙여 쓴다. | My head aches(머리가 아프다). headache·toothache·stomachache는 두통·치통·복통(명사). |
| 21:5:11 · cultivate | 뜻 | ① 경작하다, (땅을) 갈다 | ① 재배하다, 경작하다 |
| 21:10:3 · hourly | 해설 | hour+ly '매시간의'. daily·weekly·monthly와 한 세트. | hourly bus는 한 시간마다 오는 버스, hourly pay는 시급. |
| 22:2:3 · loaf | 해설 | 자르기 전 빵 한 덩이. a loaf of bread. 복수는 loaves. | a loaf of bread는 빵 한 덩이. 썰어 놓아도 한 덩이 전체라면 loaf. 복수는 loaves. |
| 22:8:13 · worst | 해설 | bad의 최상급. '최악'은 the를 붙여 the worst. | bad의 최상급. the worst movie처럼 쓰며, my worst day처럼 소유사와도 쓴다. |
| 22:9:3 · yearly | 해설 | year+-ly=해마다의. monthly(다달이)·weekly(주마다)와 세트. | a yearly event=an annual event(해마다 열리는 행사). |
| 23:6:10 · trial | 예문 | Give the new app a free {{BLANK}} first. | The app offers a seven-day free {{BLANK}}. |
| 23:6:10 · trial | 번역 | 그 새 앱은 먼저 무료 체험을 해 봐. | 그 앱은 7일간 무료 체험을 제공해. |
| 23:8:9 · consumer | 예문 | {{BLANK}}s want cheap prices and good service. | {{BLANK}}s want low prices and good service. |
| 23:10:5 · generally | 해설 | general(일반적인)+ly. in general(일반적으로)로 바꿔 쓸 수 있다. | Generally speaking=In general(일반적으로 말하면). |
| 24:1:3 · file | 번역 | 우리 아빠는 직장에 보고서를 정식으로 접수해야 했어. | 우리 아빠는 직장에서 보고서를 정식으로 제출해야 했어. |
| 24:3:11 · presidential | 해설 | president+-ial. 강세가 -den-으로 옮겨 간다. | president(대통령)의 형용사. 강세 주의. |
| 24:5:7 · honey | 해설 | 가족·연인을 부르는 애칭. 친한 사이에서만 쓴다. | 주로 가족·연인을 다정하게 부르는 애칭. |
| 24:9:4 · used | 해설 | used to+동사원형은 과거의 습관. 여기서는 [유스트]로 읽는다. | used to+동사원형은 과거의 습관·상태. 지금은 그렇지 않다는 뜻을 담는다. 여기서는 [유스트]로 읽는다. |
| 24:9:14 · english | 해설 | 항상 대문자로 씀. 언어 이름 앞에는 the를 쓰지 않는다. | 항상 대문자로 쓴다. 언어 이름 자체를 말할 때는 보통 the 없이 쓴다. |
| 24:9:15 · english | 해설 | English는 잉글랜드의 것. 영국 전체에 관한 말은 British. | English는 ‘영어의’ 또는 ‘잉글랜드의’. 영국 전체에 관한 말은 British. |
| 25:4:11 · rating | 해설 | TV ratings = 시청률. 시청자 수로 방송을 '평가'한 것이라 이 뜻이 됐다. | TV ratings는 프로그램의 시청자 수·시청 비율을 나타내는 수치. |
| 25:6:14 · bible | 해설 | 대문자로 씀. 앞에 the를 붙인다. 소문자면 '필독서'라는 뜻. | the Bible은 성경. a gardener's bible처럼 특정 분야의 권위 있는 지침서를 가리킬 때는 소문자로 쓴다. |
| 25:9:2 · scared | 고양이 대사 | 겁먹었냐고양? scared는 무섭다는 뜻이라고양. | 겁먹었냐고양? scared는 겁먹은 쪽이라고양. |
| 26:1:10 · parking | 예문 | There is no {{BLANK}} in front of the store. | Free {{BLANK}} is available behind the store. |
| 26:1:10 · parking | 번역 | 그 가게 앞에는 주차 공간이 없어. | 가게 뒤에서 무료로 주차할 수 있어. |
| 26:2:8 · musical | 해설 | music+-al. musical talent처럼 '음악에 재능 있는' 뜻도 된다. | a musical family는 음악적 재능이 있는 집안. musical instrument는 악기. |
| 26:10:3 · lane | 뜻 | ① 차선 | ① 차로 |
| 26:10:3 · lane | 번역 | 그 트럭이 천천히 오른쪽 차선으로 옮겼어. | 그 트럭이 천천히 오른쪽 차로로 옮겼어. |
| 26:10:3 · lane | 해설 | 도로의 줄 하나. change lanes, a bike lane처럼 쓴다. | 차 한 대가 지나는 도로의 구획. change lanes는 차로를 바꾸다, a bike lane은 자전거 전용 차로. |
| 27:7:5 · hip | 해설 | 허리 아래 옆쪽 관절. 형용사로 '유행에 밝은'이란 뜻도 있다. | 허리 아래 몸의 양옆이나 그 안의 고관절. 엉덩이 뒤쪽 살을 가리키는 buttocks와 구별한다. |
| 27:10:11 · differently | 해설 | different(다른)+ly. 미국은 different than도 흔히 쓴다. | differently from/than은 ‘~와 다르게’. |
| 28:2:1 · measurement | 해설 | measure(재다)+-ment. 재는 '행위'를 뜻할 땐 셀 수 없다. | measure(재다)의 명사. 측정 과정 전체는 불가산, 개별 측정은 a measurement로 센다. |
| 28:3:9 · ban | 해설 | ban A from B(A가 B를 못 하게 하다). 명사로도 같은 뜻. | ban A from -ing는 A가 ~하지 못하게 하다. ban phones는 휴대폰을 금지하다. |
| 28:4:13 · sue | 예문 | They will {{BLANK}} the company for the damage. | They will {{BLANK}} the company for damages. |
| 28:4:13 · sue | 해설 | 피해 배상 등을 법원에 청구하다. sue A for B=A에게 B를 이유로 소송을 걸다. | sue A for damages는 A에게 손해배상을 청구하는 소송을 제기하다. damages는 여기서 ‘손해배상금’. |
| 28:5:0 · photographer | 해설 | photograph+-er인데 강세가 둘째 음절로 옮겨 간다. | photograph(사진)+-er. 강세 주의. |
| 29:5:4 · corruption | 해설 | corrupt(부패한)+ion. 셀 수 없어 관사를 붙이지 않는다. | corrupt(부패한)의 명사. 이 뜻에서는 보통 불가산으로 쓴다. |
| 29:6:3 · corps | 해설 | 부대 이름에서는 대문자로 씀. 끝의 ps는 소리 내지 않는다. | 단수는 /kɔr/, 복수도 corps로 쓰지만 /kɔrz/로 읽는다. Marine Corps는 해병대. |
| 29:7:3 · athletic | 해설 | athlete(운동선수)+ic. 강세가 -let-으로 옮겨 가니 주의. | athlete(운동선수)의 형용사. 강세 주의. |
| 29:8:1 · blanket | 해설 | 이불보다 얇은 덮개. a blanket of snow처럼도 쓴다. | a blanket of snow는 담요처럼 땅을 덮은 눈. |
| 29:8:3 · bug | 예문 | This app has a {{BLANK}} in the last update. | The latest update introduced a {{BLANK}} into the app. |
| 29:8:3 · bug | 번역 | 이 앱은 지난 업데이트에 버그가 하나 있어. | 최신 업데이트로 앱에 오류가 하나 생겼어. |
| 29:8:8 · pollution | 해설 | pollute(오염시키다)+ion. 셀 수 없어 관사를 안 붙인다. | pollute(오염시키다)의 명사. 보통 불가산으로 쓴다. |
| 30:3:2 · continued | 해설 | 끊이지 않고 계속되는. continued support는 지속적인 지원. To be continued는 다음에 계속된다는 표시. | 이전부터 이어지는. continued support는 지속적인 지원. To be continued는 다음에 계속된다는 표시. |
| 30:4:0 · essence | 해설 | in essence는 '본질적으로'. essential(필수적인)의 명사 짝이다. | in essence는 ‘본질적으로’. essential에는 ‘필수적인’ 외에 ‘본질적인’이라는 뜻도 있다. |
| 30:4:5 · plead | 예문 | She {{BLANK}}ed with her mom to stay out later. | She {{BLANK}}ed with her mom to let her stay out later. |
| 30:10:3 · pit | 해설 | 미국에서는 복숭아처럼 큰 과일 씨도 pit이라고 부른다. | 미국에서는 복숭아·체리 등의 단단한 씨도 pit이라고 부른다. |
| 31:1:12 · spouse | 예문 | Each teacher may bring one {{BLANK}} to the party. | Each teacher may bring their {{BLANK}} to the party. |
| 31:1:12 · spouse | 번역 | 선생님마다 배우자 한 명을 파티에 데려와도 돼. | 선생님들은 각자 배우자를 파티에 데려와도 돼. |
| 31:2:13 · estimated | 해설 | estimate(어림잡다)+d. estimated time은 예상 시각이다. | estimate(어림잡다)의 과거분사형. estimated time of arrival은 예상 도착 시각. |
| 31:9:3 · outlet | 뜻 | ③ 아울렛, 직판 매장 | ③ 판매점, 직판 매장 |
| 31:9:3 · outlet | 해설 | 회사가 직접 싸게 파는 매장. 신문·방송 같은 '(언론) 매체'도 news outlet이라 한다. | retail outlet은 판매점, factory outlet은 공장 직판 매장. news outlet은 언론 매체. |
| 32:1:6 · cruise | 뜻 | ② (차·배가) 순항하다, 천천히 달리다 | ② 순항하다, 일정한 속도로 나아가다 |
| 32:1:6 · cruise | 번역 | 버스가 텅 빈 도로를 천천히 달렸어. | 버스가 텅 빈 도로를 일정한 속도로 달렸어. |
| 32:5:8 · kinda | 해설 | kind of의 발음을 편하게 적은 구어체 철자. 좀·약간이라는 뜻이며 격식 있는 글에서는 kind of라고 쓴다. | kind of의 구어체 발음을 적은 철자. 격식 있는 글에서는 ‘좀·약간’이라는 뜻에 somewhat 등을 쓴다. |
| 32:6:4 · tuck | 해설 | tuck A into B(A를 B 안에 밀어 넣다). tuck in은 이불을 덮어 주다. | tuck A into B는 A를 B 안에 밀어 넣다. tuck someone in은 잠자리에서 이불을 잘 덮어 주다. |
| 32:7:2 · accent | 예문 | The {{BLANK}} falls on the second part here. | The {{BLANK}} falls on the second syllable. |
| 32:7:2 · accent | 번역 | 여기서는 악센트가 두 번째 부분에 와. | 강세가 두 번째 음절에 와. |
| 32:7:10 · verse | 뜻 | ② (노래·시의) 절 | ② (노래의) 절, (시의) 연 |
| 33:3:6 · pillow | 해설 | pillow fight는 베개 싸움. 소파 쿠션은 cushion이라 한다. | pillow fight는 베개 싸움. 소파 쿠션은 cushion이며, 미국에서는 pillow라고도 한다. |
| 33:4:4 · graphic | 해설 | graph(도표)+-ic. graphic design, graphic novel로 쓴다. | graph(도표)와 한 어근. graphic design, graphic novel로 쓴다. |
| 33:8:11 · addiction | 해설 | addict(중독자)+-ion. addiction to ~ 로 to를 쓴다. | addiction to ~는 ~에 대한 중독. be addicted to ~는 ~에 중독되어 있다. |
| 34:2:3 · sack | 해설 | 종이나 천으로 만든 큰 자루. bag보다 크고 거칠다. | 곡물·감자 등을 담는 큰 자루. bag은 가방·봉투·자루를 두루 가리키는 더 넓은 말이다. |
| 34:6:11 · proceedings | 해설 | proceed(진행하다)에서 왔고 늘 복수형. legal proceedings가 흔하다. | proceed(진행하다)에서 왔다. 법적 절차는 보통 복수 proceedings로 쓰지만 단수 proceeding도 가능하다. |
| 35:1:7 · columnist | 해설 | column(칼럼)+-ist. column에서 묵음이던 n을 여기서는 발음한다. | column(칼럼)+-ist. column의 n은 묵음이지만 columnist는 n을 발음하는 꼴과 생략하는 꼴이 모두 있다. |
| 35:5:1 · vocabulary | 뜻 | ① 어휘, 단어 | ① 어휘, 어휘력 |
| 36:1:3 · pants | 해설 | 늘 복수형. 한 벌은 a pair of pants. 영국은 trousers. | 복수형. 한 벌은 a pair of pants. 미국에선 바지, 영국에선 주로 속옷. 영국에서 바지는 trousers. |
| 37:6:8 · compact | 해설 | com-(함께)+pact(묶다). 작지만 알차게 짜인 느낌이다. | 라틴어 com-(함께)+pangere(단단히 붙이다)에서 왔다. 작지만 알차게 짜인 느낌이다. |
| 37:7:7 · thesis | 해설 | 글 전체를 이끄는 중심 주장. thesis statement 주제문. | thesis statement는 글 전체의 중심 주장 문장. topic sentence는 한 문단의 중심 문장. |
| 37:7:8 · warfare | 해설 | war+fare(가다). 셀 수 없는 명사로 전쟁의 '방식'을 뜻한다. | 전쟁을 벌이는 행위나 방식. 셀 수 없는 명사이며 modern warfare는 현대전이다. |
| 37:8:10 · mob | 해설 | crowd와 달리 폭력적인 무리를 뜻한다. 동사로 '몰려들다'. | crowd보다 무질서하거나 위협적인 느낌이 강하다. a mob of fans처럼 몰려든 팬들에게도 쓴다. |
| 38:2:4 · straw | 해설 | 이 뜻으로는 셀 수 없다. the last straw는 '인내의 한계'. | 짚을 통틀어 말하면 셀 수 없다. the last straw는 더는 참을 수 없게 만든 마지막 사건이다. |
| 38:2:12 · feat | 뜻 | ① 위업, 뛰어난 솜씨 | ① 위업, 대단한 성취 |
| 38:10:1 · countryside | 해설 | the countryside처럼 the를 붙인다. 도시 밖 들판을 뜻한다. | 도시나 큰 마을을 벗어난 시골 지역. 보통 the countryside로 쓰며 들판뿐 아니라 숲과 산도 포함한다. |
| 39:4:7 · destructive | 해설 | destroy(파괴하다)+-ive. 명사는 destruction이다. | destroy(파괴하다)·destruction(파괴)과 한 어근. destructive criticism은 파괴적인 비판. |
| 39:5:8 · immense | 해설 | im-(아닌)+mense(재다). '잴 수 없이 큰'. huge보다 격식체다. | 라틴어 immensus(측정되지 않은)에서 왔다. ‘잴 수 없이 큰’ 느낌으로, 크기뿐 아니라 양·정도에도 쓴다. |
| 39:9:4 · monopoly | 해설 | mono-(하나)+poly(팔다). have a monopoly on ~ 꼴로 쓴다. | mono-(하나)+그리스어 pōlein(팔다). poly-(많은)와 별개. a monopoly on은 ~의 독점. |
| 40:5:0 · wardrobe | 뜻 | ① (영) 옷장 | ① 옷장 |
| 40:5:0 · wardrobe | 해설 | (영) 옷장. 미국에서는 보통 closet이라고 한다. | 옷을 걸어 두는 큰 장. 붙박이 옷장은 영국에서 fitted wardrobe, 미국에서 보통 closet이라 한다. |
| 40:5:4 · epidemic | 해설 | epi-(위에)+demos(사람들). 한 지역에 퍼진 병이다. | epi-(위에)+demos(사람들). 한 지역에서 많은 사람이 같은 병에 걸리는 유행을 뜻한다. |
| 40:9:11 · boiling | 예문 | Drop the eggs into {{BLANK}} water for ten minutes. | Cook the eggs in {{BLANK}} water for ten minutes. |
| 40:9:11 · boiling | 번역 | 달걀을 끓는 물에 십 분 넣어 둬. | 달걀을 끓는 물에 10분 동안 삶아. |
| 41:5:14 · spontaneous | 해설 | 누가 시키지 않아도 스스로 하는. 비슷한 말은 voluntary. | 미리 계획하거나 억지로 하지 않고 자연스럽게 나온 반응. voluntary는 스스로 선택해서 한다는 뜻에 초점이 있다. |
| 41:6:10 · fracture | 해설 | 뼈에 간 금. 동사로도 쓰며 break보다 의학적인 말이다. | 뼈에 금이 가거나 부러진 것. 동사로도 쓰며 break보다 의학적인 말이다. |
| 41:7:2 · sewing | 해설 | sew(꿰매다)+-ing. 발음은 [소잉]으로 so와 같은 소리다. | sew(꿰매다)는 so와 발음이 같다. 여기에 -ing를 붙인 말이 sewing이다. |
| 42:2:8 · substrate | 해설 | sub-(아래)+stratum(층). 과학 글에서 '아래 깔린 바탕'을 뜻한다. | 바탕이 되는 층·재료. 생화학에서는 효소가 작용하는 물질인 ‘기질’을 뜻한다. |
| 42:4:0 · militant | 해설 | military(군대)와 한 뿌리. 뜻을 위해 물러서지 않는 태도다. | military와 한 뿌리. 목적을 이루려고 강한 압력이나 무력도 쓰려는 전투적인 태도다. |
| 42:9:13 · dialect | 해설 | dia-(사이)+lect(말하기). 한 언어 안의 지역 말씨를 뜻한다. | 한 언어 안에서 지역·사회 집단에 따라 달라지는 말. 어휘·문법·발음에 차이가 있으며, 발음에 초점을 둔 말은 accent다. |
| 42:10:4 · haunt | 해설 | 나쁜 기억이 사람을 계속 따라다니다. 목적어는 사람이다. | 나쁜 기억·생각 등이 마음에서 떠나지 않고 계속 괴롭히다. |
| 43:2:6 · tsunami | 해설 | 일본어에서 온 말. t는 소리 내지 않아 [수나미]로 읽는다. | 일본어에서 온 말. 영어에서는 첫 t를 생략한 발음과 /ts/로 시작하는 발음을 모두 쓴다. |
| 43:5:3 · kidnap | 해설 | kid(아이)+nap(낚아채다). 과거는 p를 겹쳐 kidnapped. | kid(아이)+옛 속어 nap(낚아채다)에서 왔다. 과거형은 p를 겹쳐 kidnapped. |
| 43:6:3 · wrongly | 해설 | wrong(틀린)+ly. 주로 과거분사 앞에 온다. | wrongly assume(잘못 가정하다), be wrongly accused(잘못 고발되다)처럼 동사·분사와 쓴다. |
| 43:7:2 · biscuit | 해설 | 영국의 biscuit은 미국의 cookie를 가리킨다. | 영국 biscuit 중 달콤한 것은 미국의 cookie에 해당해. 짭짤한 과자도 biscuit에 포함돼. |
| 43:10:11 · coefficient | 예문 | In math, the {{BLANK}} is the number in front. | In 3x, the {{BLANK}} of x is 3. |
| 43:10:11 · coefficient | 번역 | 수학에서 계수는 문자 앞에 붙은 숫자야. | 3x에서 x의 계수는 3이야. |
| 43:10:11 · coefficient | 해설 | co-(함께)+efficient. 식에서 문자 앞에 붙은 수를 뜻한다. | 문자나 식에 곱해지는 수·인수. 3x에서는 3이 x에 곱해지므로 x의 계수는 3이다. |
| 44:9:3 · incline | 해설 | be inclined to do(~하고 싶다, ~하는 경향이 있다)가 핵심. | be inclined to do는 ~하고 싶다, ~하는 경향이 있다. |
| 44:10:4 · oblige | 해설 | 부탁을 기꺼이 들어주다. I'd be obliged는 격식 있는 감사말. | 부탁을 기꺼이 들어주다. I'd be obliged if ~는 '~해 주시면 감사하겠습니다'라는 격식 있는 부탁이다. |
| 45:1:3 · granddad | 해설 | grand+dad로 d가 둘. 영국에서는 d 하나인 grandad로도 쓴다. | grand+dad로 가운데 d가 겹친다. 영국에서는 가운데 d가 하나인 grandad로도 쓴다. |
| 45:1:8 · erupt | 해설 | 화산이 주어. e-(밖으로)+rupt(터지다). 명사는 eruption. | 화산이 분출하거나 용암·화산재가 뿜어져 나오다. e-(밖으로)+rupt(터지다). 명사는 eruption. |
| 46:1:5 · practice (복습) | 예문 | Taking off shoes is common {{BLANK}} in Korea. | Taking off shoes before entering a home is common {{BLANK}} in Korea. |
| 46:1:5 · practice (복습) | 번역 | 한국에선 신발 벗는 게 흔한 관행이야. | 한국에선 집에 들어가기 전에 신발을 벗는 게 일반적인 관행이야. |
| 47:8:4 · accessible | 해설 | access(접근)+-ible. accessible to로 이용 가능한 대상을 이어. | access(접근)+-ible. accessible to everyone은 누구나 접근하거나 이용할 수 있다는 뜻. |
| 47:8:7 · economic | 뜻 | 경제의, 경제적인 | 경제의, 경제와 관련된 |
| 47:9:3 · widely | 해설 | wide(넓은)→widely(널리). 형용사 성질이 받아들여지는 범위를 설명해. | wide(넓은)→widely(널리). 여기서는 accepted를 꾸며 받아들여지는 범위가 넓다는 뜻이야. |
| 48:1:0 · produce | 해설 | producere는 앞으로 내오다는 뜻. 생산하다·생겨나게 하다로 이어져. | 라틴어 ducere(이끌다)→producere(앞으로 내오다). 생산하다·생겨나게 하다로 이어져. |
| 48:1:3 · transfer | 해설 | trans-는 건너, ferre는 나르다. 돈·사람·정보를 다른 곳으로 옮겨. | 라틴어 ferre(나르다)에 trans-(건너). 돈·사람·정보를 다른 곳으로 옮겨. |
| 48:1:6 · transport | 해설 | trans-와 portare가 결합한 계열. 한 곳에서 다른 곳으로 실어 나르는 뜻이야. | 라틴어 trans-(건너)+portare(나르다). 한 곳에서 다른 곳으로 실어 나르다. |
| 48:2:0 · reject | 해설 | reicere는 뒤로 던지다. 제안·신청 등을 받아들이지 않는 뜻으로 이어져. | 라틴어 iacere(던지다)→reicere(뒤로 던지다). 제안 등을 받아들이지 않다. |
| 48:2:2 · transmit | 해설 | transmit은 건너 보내다에서 이어져. 신호·정보뿐 아니라 병도 전파해. | 라틴어 mittere(보내다)→분사 어간 miss-. 신호·정보뿐 아니라 병도 전파해. |
| 48:2:6 · opponent | 해설 | opponere는 맞은편에 두다. 경기 상대나 어떤 주장에 반대하는 사람을 뜻해. | 라틴어 ponere(놓다)→opponere(맞은편에 두다). 경기 상대·반대하는 사람. |
| 48:3:0 · affect | 해설 | affect는 영향을 주는 동사. have an effect on과 바꾸어 표현할 수 있어. | 라틴어 facere(하다·만들다) 계열. affect는 동사, have an effect on은 같은 뜻. |
| 48:3:2 · accept | 해설 | accept는 제안·사실 등을 받아들이다. capere 계열의 ‘받아 취함’과 연결돼. | 라틴어 capere(잡다·취하다)의 합성어 계열. 제안·사실 등을 받아들이다. |
| 48:3:6 · maintain | 해설 | maintain that은 자기 주장이 맞다고 계속 말하다. 상태 유지와 구별해. | 라틴어 manu tenere(손에 지니다) 계열. maintain that은 ~라고 주장을 고수하다. |
| 48:4:0 · convert | 해설 | convert A into B는 A를 B로 바꾸다. 형태·용도·신념의 변화에도 써. | 라틴어 vertere(돌리다)의 합성어 계열. convert A into B는 A를 B로 바꾸다. |
| 48:4:2 · describe | 해설 | describe는 특징이나 작동 방식을 말·글로 설명하다. 반드시 글로 쓰진 않아. | 라틴어 scribere(쓰다) 계열. describe는 특징 등을 말·글로 설명하므로 구두로도 돼. |
| 48:4:5 · inspect | 해설 | inspect는 자세히 살펴 상태를 검사하다. in-은 여기서 부정 ‘아닌’이 아니야. | 라틴어 specere(보다) 계열. inspect는 자세히 검사하다. in-은 부정이 아니야. |
| 48:5:2 · vision | 해설 | vision의 vis-는 videre 계열. 여기서는 미래 구상이나 환상이 아니라 시력이야. | 라틴어 videre(보다)의 분사 어간 vis- 계열. 여기서는 미래 구상·환상이 아니라 시력이야. |
| 48:5:3 · credible | 해설 | credible은 신뢰할 수 있는. 믿을 만하다는 판단과 참으로 입증됐다는 말은 달라. | 라틴어 credere(믿다). credible은 믿을 만하다는 뜻이며, 참으로 입증됐다는 말은 아니야. |
| 48:5:5 · predict | 해설 | pre-는 먼저, dict-는 말하다 계열. 아직 일어나지 않은 일을 예상하는 뜻이야. | 라틴어 dicere(말하다)의 분사 어간 dict-. pre-(먼저)와 결합해 ‘예측하다’. |
| 48:6:0 · attract | 해설 | attract는 자기 쪽으로 끌다. 사람의 관심·손님·동물을 끄는 데도 써. | 라틴어 trahere(끌다)의 분사 어간 tract-. 관심·손님·동물을 자기 쪽으로 끌다. |
| 48:6:3 · interrupt | 해설 | inter-는 사이에. 진행 중인 말이나 행동의 흐름을 끊는다는 뜻이야. | 라틴어 rumpere(깨뜨리다)의 분사 어간 rupt-. inter-(사이): 말·행동의 흐름을 끊다. |
| 48:6:6 · structure | 해설 | structure는 부분들이 짜인 방식. struct-의 쌓고 배열한다는 계열과 연결돼. | 라틴어 struere(쌓다·배열하다)의 분사 어간 struct-. 부분들이 짜인 방식이 구조야. |
| 48:7:0 · proceed | 해설 | proceed는 앞으로 나아가 진행하다. proceed with a plan. | 라틴어 cedere(가다)와 pro-(앞으로). proceed with a plan은 계획을 진행하다. |
| 48:7:3 · agent | 해설 | agent는 작용을 하는 주체. 사람뿐 아니라 물질이나 자연의 힘도 될 수 있어. | 라틴어 agere(행하다)의 현재분사 계열. agent는 사람·물질·힘 등 작용의 주체야. |
| 48:8:1 · correct | 해설 | correct errors는 오류를 바로잡다. 형용사 ‘정확한’과 문장 기능이 달라. | 라틴어 regere(곧게 이끌다) 계열. correct errors는 오류를 바로잡다. 여기서는 동사. |
| 48:8:2 · sequence | 해설 | sequence는 하나가 다른 하나 뒤를 따르는 순서. 인과관계까지 보장하진 않아. | 라틴어 sequi(뒤따르다) 계열. 차례로 이어지는 순서이지 인과관계까지 뜻하지는 않아. |
| 48:9:0 · biology | 해설 | bio-(생명)와 -logy(학문). 생물과 생명 현상을 연구하는 학문 이름이야. | 그리스어 βίος(bios, 삶·생명)+-logy(학문). 생물과 생명 현상을 연구해. |
| 48:9:2 · geography | 해설 | geo-(땅)와 -graphy(기술·기록). 자연환경뿐 아니라 사람과 지역도 다뤄. | 그리스어 γῆ(gē, 땅)→geo-. 지리학은 자연환경뿐 아니라 사람과 지역도 다뤄. |
| 48:9:4 · graphic | 해설 | graph-(그리다). graphic description에서는 생생한·노골적인 묘사라는 뜻도 돼. | 그리스어 γράφω(graphō, 쓰다·그리다). graphic은 생생한·노골적인이라는 뜻도 돼. |
| 48:10:0 · sociology | 해설 | socio-(사회)와 -logy(학문). 앞부분은 라틴어, 뒷부분은 그리스어 계열이야. | 그리스어 -λογία(-logia, 학문·설명). socio-는 라틴어, -logy는 그리스어 계열. |
| 48:10:2 · telephone | 해설 | tele-(멀리)와 phon-(소리). | 그리스어 φωνή(phōnē, 소리). tele-(멀리)와 결합. 영어 -phone은 /foʊn/. |
| 48:10:4 · photosynthesis | 해설 | photo-(빛)와 synthesis(합성). 여기서 photo-는 사진이 아니야. | 그리스어 φῶς(phōs, 빛)의 어간 phot-. synthesis(합성)와 결합한 광합성. |
| 48:11:0 · thermal | 해설 | therm-(열)과 -al(형용사형). thermal energy는 열에너지야. | 그리스어 θερμός(thermos, 뜨거운)→therm-. thermal energy는 열에너지. |
| 48:11:2 · chronic | 해설 | chron-(시간). 오랫동안 지속되는 상태이며, 단순히 심하다는 뜻은 아니야. | 그리스어 χρόνος(khronos, 시간). chronic은 오래 지속되는, 단순히 심한 게 아니야. |
| 48:11:4 · psychology | 해설 | psych-(마음)와 -logy(학문). 첫 p는 발음하지 않아. | 그리스어 ψυχή(psykhē, 마음·영혼)와 -logy(학문). 영어 psychology의 p는 묵음. |
| 48:12:0 · anthropology | 해설 | anthrop-(인간)와 -logy(학문). 인간의 생물학적 측면을 다루는 분야도 있어. | 그리스어 ἄνθρωπος(anthrōpos, 인간)와 -logy(학문). 생물학적 인간 연구도 포함해. |
| 48:12:2 · automatic | 해설 | auto-(스스로). automatic response에서는 의식하지 않아도 나오는 반응이야. | 그리스어 αὐτός(autos, 자신). automatic response는 의식 없이 나오는 반응. |
| 48:12:4 · television | 해설 | tele-(멀리)와 vision 계열(보기). 서로 다른 언어의 재료를 결합한 말이야. | 그리스어 τῆλε(tēle, 멀리)+라틴어 videre(보다) 계열. 서로 다른 언어가 결합했어. |
| 48:13:0 · microbe | 해설 | micro-(작은)와 bio-(생명)가 바탕이야. 모든 미생물이 병원균인 건 아니야. | 그리스어 μικρός(mikros, 작은)+βίος(bios, 생명). 미생물이 모두 병원균은 아니야. |
| 48:13:2 · microscope | 해설 | micro-(작은)와 -scope(관찰 기구). 아주 작은 대상을 확대해 봐. | 그리스어 σκοπέω(skopeō, 살피다)→-scope. micro-(작은)와 결합한 관찰 기구. |
| 48:14:0 · empathy | 해설 | 타인의 처지에서 감정을 이해하고 함께 느끼는 데 초점이 있어. | 그리스어 πάθος(pathos, 경험·감정). empathy는 타인의 처지에서 감정을 이해·공유함. |
| 48:14:2 · democracy | 해설 | demo-(민중)와 -cracy(통치). | 그리스어 δῆμος(dēmos, 민중)+κράτος(kratos, 권력). 민중이 다스리는 체제. |
| 48:15:0 · blood | 해설 | 명사 blood /blʌd/와 동사 bleed /bliːd/는 오래된 영어의 관련어야. | 고대영어 blōd(피)→blood, blēdan(피를 흘리다)→bleed. 현대 모음은 /ʌ/와 /iː/. |
| 48:15:2 · food | 해설 | 먹는 대상은 food, 먹이를 주는 행동은 feed로 연결해. | 고대영어 fōda(음식)→food, fēdan(먹이다)→feed. 먹는 대상과 먹이는 행동을 연결해. |
| 48:15:4 · strong | 해설 | 성질은 strong, 그 힘이나 강점은 strength. 모음과 끝소리가 달라. | 고대영어 strang(강한)→strong, strengþu(힘)→strength. 성질과 그 힘·강점. |
| 48:16:0 · broad | 해설 | 공간의 넓이에서 주제·시야의 폭으로도 쓰여. 명사 가족은 breadth야. | 고대영어 brād(넓은)→broad, brǣdu(폭)→breadth. 지식·경험의 폭에도 써. |
| 48:16:2 · long | 해설 | 길이와 지속 시간에 모두 쓸 수 있어. 명사 가족은 length야. | 고대영어 lang(긴)→long, lengðu(길이)→length. 공간의 길이와 시간의 길이에 써. |
| 49:2:4 · over | 예문 | Sales doubled {{BLANK}} the past five years. | Sales have doubled {{BLANK}} the past five years. |
| 49:10:0 · from | 해설 | separate A from B는 A를 B와 분리하다. from 뒤에는 분리하는 상대가 와. | keep A separate from B는 A를 B와 분리해 두다. 여기서 separate는 ‘분리된’이라는 형용사야. |
| 49:10:4 · of | 예문 | Loud traffic deprived us {{BLANK}} sleep. | Traffic noise deprived us {{BLANK}} sleep. |
| 50:1:1 · depend on | 해설 | 조건에 달림은 depend on. conditional on도 조건을 나타내. | 여기서는 결과를 좌우하는 조건을 나타내. depend on someone은 사람을 믿고 의지하다는 뜻. |
| 50:1:4 · contribute to | 해설 | contributor가 기여자라면 contribute to는 결과에 한몫하는 거야. | contribute to는 결과를 낳는 여러 원인 중 하나가 되다. 좋은 결과뿐 아니라 문제·실패에도 써. |
| 50:2:8 · figure out | 해설 | solve처럼 생각해서 답을 알아내. 정보를 알게 되는 find out과 구별해. | figure out은 생각해서 답을 찾는 데, find out은 새 사실을 알게 되는 데 초점. 문맥에 따라 겹쳐. |
| 50:3:8 · make up for | 해설 | loss 같은 손실을 다른 것으로 보상해. 부족한 양 자체를 채울 때는 make up이야. | make up for+손실·부족은 이를 보상하다. make up the difference는 부족한 차액을 채우다. |
| 50:5:5 · wear out | 해설 | damage 중에서도 오래 써서 닳는 거야. tire out은 사람을 지치게 해. | 오래 써서 닳는 뜻. wear someone out은 tire someone out처럼 사람을 지치게 해. |
| 50:9:2 · make up | 해설 | shortage의 부족분을 채우다. make up for는 손실을 다른 것으로 보상하는 뜻이야. | make up the required number는 필요한 수를 채우다. make up for a loss는 손실을 보상하다. |

전체 출처와 개별 수정 이유는 findings.json, 후보별 관련 카드 대조는 pool-proposals.json에 보존했다.
