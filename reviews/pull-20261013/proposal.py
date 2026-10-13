E=[]
def add(s,w,si,tag,why,**f): E.append(dict(set=s,word=w,si=si,tag=tag,why=why,fields=f))
# 26.10.13 3000급 채우기(PRINCIPLES 2-8): 26~45세트에서 9~25세트로 당긴 카드 중, 새 자리에서 순서 통제(2-1, 앞당김 둘 이상)에
# 걸리거나 그 세트에 너무 이른 문법(조명 문법 지도로 한참 뒤 항목)을 담은 예문을 고친다. 세트 번호는 새 화면 자리다.
O='순서 통제(2-1): 새 자리(앞 세트)에서 뒤에 배우는 단어가 둘 이상'
G='새 자리에 너무 이른 문법(조명 문법 지도 기준): 쉬운 문형으로'
add(10,'trainer',1,'예문·해석',O+' + If it weren\'t for(34세트 문법) → 현재 시제',
    ex='My {{BLANK}} at the gym makes me run every morning.',tr='헬스장 트레이너가 나한테 매일 아침 달리기를 시켜.')
add(15,'virus',1,'예문·해석',O+'(antibiotics 43, bacteria 18). 지식 예문으로: 감기·독감은 바이러스가 일으킨다(수동태는 14세트에서 배움)',
    ex='Colds and the flu are caused by {{BLANK}}es.',tr='감기와 독감은 바이러스 때문에 걸려.')
add(19,'aged',2,'예문·해석·고양',O+'(onto·anymore 23). 대사도 새 예문에 맞춤',
    ex='Our {{BLANK}} cat sleeps most of the day now.',tr='우리 늙은 고양이는 이제 하루 대부분을 자.',meow='자는 게 아니라 명상하는 거라고양. 품위 관리라고양.')
add(11,'fiction',2,'예문·해석',G+'(과거완료 26 + 관계절)',
    ex='His story about meeting a famous singer was pure {{BLANK}}.',tr='유명 가수를 만났다는 걔 얘기는 순전히 지어낸 거였어.')
add(18,'shy',1,'예문·해석',G+'(가정법 과거완료 33). 해설의 too shy to를 예문이 보여 줌',
    ex='My little brother is too {{BLANK}} to talk to new people.',tr='내 남동생은 너무 수줍어서 처음 보는 사람과 말을 못 해.')
add(18,'embarrassed',1,'예문·해석',G+'(must have p.p. 35)',
    ex='I was so {{BLANK}} when I fell at school.',tr='학교에서 넘어졌을 때 너무 민망했어.')
add(18,'relaxed',1,'예문·해석',G+'(부정어 도치 37)',
    ex='I finally felt {{BLANK}} after the exam was over.',tr='시험이 끝나고 나서야 긴장이 풀렸어.')
add(23,'cottage',1,'예문·해석',G+'(장소 도치 37)',
    ex='My grandparents live in a small {{BLANK}} by the lake.',tr='우리 할아버지 할머니는 호숫가의 작은 시골집에 사셔.')
add(16,'noisy',1,'예문·해석',G+'(However+형용사 41)',
    ex='The class got {{BLANK}}, but our teacher never shouted.',tr='반이 시끄러워졌는데도 우리 선생님은 소리를 안 지르셨어.')
add(13,'mobile',1,'예문·해석','순서 통제(2-1): clinic(27) 대신 이미 배운 library로',
    ex='A {{BLANK}} library visits our town every Friday.',tr='이동 도서관이 금요일마다 우리 동네에 와.')
add(14,'teenage',1,'예문·해석','순서 통제(2-1): noon(31) 대신 시각으로',
    ex='My {{BLANK}} cousin sleeps until eleven on Sundays.',tr='내 십 대 사촌은 일요일마다 열한 시까지 자.')
