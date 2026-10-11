#!/usr/bin/env python3
"""세트 하나를 영신 직검수용 TXT로 뽑는다(26.10.11 영신: 한 세트 단위 TXT에 줄마다 코멘트를 단다).

사용: python3 pipeline/review-txt.py 세트번호 [--since 커밋] [--out 폴더]
  --since 커밋: 그 커밋 뒤로 바뀐 카드에 ★와 바뀐 칸을 붙인다(새 카드는 ★새 카드).
카드 번호는 세트-연습-카드(0-05-03). 영신은 고칠 줄 바로 아래에 '>'로 시작하는 줄을 넣는다.
화면 DATA(vocagoyangfable.html)를 읽으므로 assemble.py 뒤에 돌린다.
"""
import json, re, subprocess, sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'vocagoyangfable.html'
FIELDS = [('ko', '뜻'), ('ex', '예문'), ('tr', '해석'), ('c', '해설'), ('meow', '고양'), ('ipa', '발음'), ('pos', '품사')]


def data_of(html):
    return json.loads(re.search(r'^const DATA = (\[.*\]);\s*$', html, re.M).group(1))


def alts_of(html):
    i = html.index('const ALT={')
    j = html.index('};', i)
    return json.loads(re.sub(r'//.*', '', html[i + len('const ALT='):j + 1]))


def filled(w):
    ex = w.get('ex') or ''
    if not ex:
        return '(예문 없음)'
    term = w['en']
    if ex.startswith('{{BLANK}}'):
        term = term[:1].upper() + term[1:]
    return ex.replace('{{BLANK}}', f'[{term}]')


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    lesson = int(args[0])
    opt = {args[i]: args[i + 1] for i in range(1, len(args) - 1, 2)}
    html = HTML.read_text(encoding='utf-8')
    data, alts = data_of(html), alts_of(html)
    L = next(L for L in data if L['lesson'] == lesson)
    head = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
    before = {}
    if '--since' in opt:
        old = subprocess.run(['git', '-C', str(ROOT), 'show', f"{opt['--since']}:vocagoyangfable.html"], capture_output=True, text=True, check=True).stdout
        for OL in data_of(old):
            if OL['lesson'] == lesson:
                for e in OL['exercises']:
                    for w in e['words']:
                        before[(w['word'], w.get('si', 1))] = w
    cards = sum(len(e['words']) for e in L['exercises'])
    out = [f"보카고양 FABLE 직검수 · {L['label']} · {L.get('name', '')}",
           f"기준 {head} ({date.today().isoformat()}) · {len(L['exercises'])}연습 · {cards}장",
           "코멘트: 고칠 줄 바로 아래에 '>'로 시작하는 줄을 넣어 줘. 카드 번호만 남아 있으면 어디에 적어도 돼.",
           "보는 법: [ ]는 학생이 치는 정답 자리. 다른 정답은 오답 처리하지 않고 받아 주는 말."]
    if '--since' in opt:
        out.append(f"★는 {opt['--since']} 뒤로 바뀐 카드(바뀐 칸 표시).")
    changed = 0
    for ei, e in enumerate(L['exercises'], 1):
        out += ['', f"==== Exercise {e['ex']} · {e.get('name', '')} ({len(e['words'])}장) ====", '']
        for ci, w in enumerate(e['words'], 1):
            cid = f"{lesson}-{ei:02d}-{ci:02d}"
            mark = ''
            if '--since' in opt:
                b = before.get((w['word'], w.get('si', 1)))
                if b is None:
                    mark = '  ★새 카드'
                else:
                    diff = [label for key, label in FIELDS if (b.get(key) or '') != (w.get(key) or '')]
                    if diff:
                        mark = '  ★' + '·'.join(diff)
                changed += bool(mark)
            out.append(f"{cid} {w['en']}  {w.get('ko', '')}  {w.get('pos', '')} /{w.get('ipa', '')}/{mark}")
            out.append(f"  예문 {filled(w)}")
            if w.get('tr'):
                out.append(f"  해석 {w['tr']}")
            out.append(f"  해설 {w.get('c') or '(없음)'}")
            if w.get('meow'):
                out.append(f"  고양 {w['meow']}")
            alt = alts.get(f"{w['word']}/{w.get('si', 1)}")
            if alt:
                out.append(f"  다른 정답 {', '.join(alt)}")
    outdir = Path(opt.get('--out', '.'))
    outdir.mkdir(parents=True, exist_ok=True)
    path = outdir / f"FABLE-{lesson:02d}세트-직검수-{date.today().strftime('%Y%m%d')}.txt"
    path.write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(json.dumps({'file': str(path), 'exercises': len(L['exercises']), 'cards': cards, 'changed': changed}, ensure_ascii=False))


if __name__ == '__main__':
    main()
