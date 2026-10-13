E=[]
def add(s,w,si,tag,why,**f): E.append(dict(set=s,word=w,si=si,tag=tag,why=why,fields=f))
# 26.10.13 Oxford 5000 836개를 넣은 뒤 검사에 걸린 것.
add(4,'sex',2,'예문·해석','순서 통제(2-1): reproduction이 39세트 새 표제어가 되어 앞당김 둘(chapter 25, reproduction 39)',
    ex='In science class, we learned about {{BLANK}} and how babies are born.',tr='과학 시간에 성과 아기가 어떻게 태어나는지 배웠어.')
add(37,'composition',1,'예문·해석','폰 줄 수: 360px 문제 화면 5줄 → 숫자를 빼서 줄임',
    ex='The {{BLANK}} of air is mostly nitrogen and oxygen.',tr='공기는 대부분 질소와 산소로 이루어져 있어.')
add(42,'ecological',1,'예문·해석','폰 줄 수: 360px 정답 문장 4줄 → 줄임',
    ex='An {{BLANK}} footprint measures how much nature your lifestyle uses.',tr='생태 발자국은 네 생활 방식이 자연을 얼마나 쓰는지 재.')
add(39,'correlation',1,'예문·해석','폰 줄 수: 360px 정답 문장 4줄 → 줄임(여름 이유는 해석이 풀어 줌)',
    ex='Ice cream sales and drowning deaths show a {{BLANK}}.',tr='아이스크림 판매와 익사 사고는 상관관계를 보여. 둘 다 여름에 늘거든.')
add(40,'exclusion',1,'예문·해석','폰 줄 수: 360px 정답 문장 4줄 → 줄임',
    ex="Swiss women's {{BLANK}} from national votes lasted until 1971.")
