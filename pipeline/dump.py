import json,sys
p=sys.argv[1]; o=json.load(open(p)); exs=o['exercises'] if isinstance(o,dict) else o
n=0
for e in exs:
    print('##',e['ex'],e['name'])
    for w in e['words']:
        n+=1; print(f"{n} [{w['word']}/{w['si']}] {w['pos']} {w['ko']} | {w['ex']} | {w['tr']}")
print('total',n)
