import json,sys,collections
import os; B=os.path.dirname(os.path.abspath(__file__)); tag=sys.argv[1]
K={k['id']:k for k in json.load(open(B+'/answer-key.json'))}
F=json.load(open(B+f'/results/{tag}.json'))
byid=collections.defaultdict(list)
for f in F: byid[f['id']].append(f)
for kid in sorted(K):
    k=K[kid]; fs=byid.get(kid,[])
    fix='; '.join(f"{x['field']}: {str(x['old'])[:60]} -> {str(x['new'])[:60]}" for x in k['fix'])
    print(f"{kid} [{k['src'][:28]}|{k['cat']}] {k['card']['en']}  FIX: {fix[:170]}")
    if k['src'].startswith('A'): print(f"     truth: {k['problem'][:150]}")
    for f in fs: print(f"   >> {f['category']}/{f['severity']}/{f['field']}: {f['problem'][:200]}")
