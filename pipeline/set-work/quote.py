# 소설 명문장 원문 대조(원문 텍스트 폴더는 NOVELS 환경 변수, 저장소에는 넣지 않는다): python3 quote.py 책 "문장"   (책 = novels/의 파일 이름, 예: alice, oz, pride)
# 찾기:                python3 quote.py 책 --grep "단어" [최대 단어 수]
import re, sys, os
D = os.environ.get('NOVELS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'novels')
def norm(s):
    s = s.replace('\r', '').replace('_', '')
    s = re.sub(r'[‘’]', "'", s); s = re.sub(r'[“”]', '"', s); s = s.replace('—', '--')
    return re.sub(r'\s+', ' ', s)
book = sys.argv[1]
t = norm(open(os.path.join(D, book + '.txt'), encoding='utf-8', errors='replace').read())
if sys.argv[2] == '--grep':
    w = sys.argv[3].lower(); mx = int(sys.argv[4]) if len(sys.argv) > 4 else 14
    for s in re.split(r'(?<=[.!?])\s+', t):
        s2 = s.strip(' "\'')
        if re.search(r'\b' + re.escape(w) + r'\b', s2.lower()) and len(s2.split()) <= mx:
            print('-', s2)
    sys.exit()
q = norm(sys.argv[2]); i = t.find(q)
if i >= 0: print('EXACT |', t[max(0, i - 120):i + len(q) + 60])
else:
    j = t.lower().find(q.lower())
    print(('CASE | ' + t[max(0, j - 120):j + len(q) + 60]) if j >= 0 else 'MISS')
