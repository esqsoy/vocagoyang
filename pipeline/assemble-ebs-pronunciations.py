"""Embed the reviewed EBS IPA sidecar; never modify the source wordset."""
from pathlib import Path
import argparse
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'pipeline/ebs-pronunciations.json'
PAGE = ROOT / 'vocagoyangebs2027.html'
LICENSE = ROOT / 'pipeline/CMUDICT-LICENSE.txt'


def runtime_entry(entry):
    result = {key: entry[key] for key in ('ipa', 'speech', 'label') if key in entry}
    if 'alternatives' in entry:
        result['alternatives'] = [runtime_entry(item) for item in entry['alternatives']]
    if 'meanings' in entry:
        result['meanings'] = {meaning: runtime_entry(item) for meaning, item in entry['meanings'].items()}
    return result


def build_page(page, source=None):
    """Pure builder, also usable by a parent release assembler without file writes."""
    source = source or json.loads(SOURCE.read_text(encoding='utf-8'))
    data_line = re.search(r'^const DATA = (.*);$', page, re.M)
    assert data_line, 'Expected the unchanged EBS wordset assignment'
    data = json.loads(data_line.group(1))
    cards = [w for lesson in data for ex in lesson['exercises'] for w in ex['words']]
    terms = {w['en'] for w in cards}
    assert len(cards) == source['sourceCardCount'] == 597
    assert len(terms) == source['sourceTermCount'] == 545
    assert terms == set(source['entries']), 'EBS IPA keys must match every exact existing term'
    digest = hashlib.sha256(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    assert digest == source['dataSha256'], 'EBS vocabulary changed; review/update the IPA sidecar before rebuilding'
    runtime = {term: runtime_entry(entry) for term, entry in source['entries'].items()}
    encoded = json.dumps(runtime, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c')
    assignment = 'const MT_PRONUNCIATIONS = ' + encoded + ';'
    license_block = '/* CMUDICT PRONUNCIATION DATA LICENSE\n' + LICENSE.read_text(encoding='utf-8').strip() + '\nEND CMUDICT PRONUNCIATION DATA LICENSE */\n'
    updated = re.sub(r'/\* CMUDICT PRONUNCIATION DATA LICENSE\n.*?END CMUDICT PRONUNCIATION DATA LICENSE \*/\n', '', page, flags=re.S)
    updated, count = re.subn(r'^const MT_PRONUNCIATIONS = .*;[^\n]*$', lambda _: license_block + assignment, updated, flags=re.M)
    assert count == 1, 'Expected exactly one EBS pronunciation assignment'
    assert data_line.group(0) == re.search(r'^const DATA = .*;$', updated, re.M).group(0), 'Original wordset must remain byte-identical'
    return updated


def assemble(check=False, output=None):
    page = PAGE.read_text(encoding='utf-8')
    updated = build_page(page)
    if check:
        assert updated == page, 'Embedded EBS IPA is stale; run the assembler without --check'
    else:
        (Path(output) if output else PAGE).write_text(updated, encoding='utf-8', newline='\n')
    print(f'{"Verified" if check else "Embedded"} EBS: 545 terms / 597 unchanged cards.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--output', help='Write a preview copy instead of the release HTML')
    args = parser.parse_args()
    assert not (args.check and args.output), '--check and --output are mutually exclusive'
    assemble(args.check, args.output)
