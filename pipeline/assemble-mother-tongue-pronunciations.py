"""Embed the pronunciation sidecar without modifying vocabulary or gameplay."""
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'pipeline/mother-tongue-pronunciations.json'
PAGE = ROOT / 'vocagoyangksat2027.html'
LICENSE = ROOT / 'pipeline/CMUDICT-LICENSE.txt'

def runtime_entry(entry):
    result = {key: entry[key] for key in ('ipa', 'speech', 'label') if key in entry}
    if 'alternatives' in entry:
        result['alternatives'] = [runtime_entry(item) for item in entry['alternatives']]
    if 'meanings' in entry:
        result['meanings'] = {meaning: runtime_entry(item) for meaning, item in entry['meanings'].items()}
    return result

def assemble(check=False):
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    page = PAGE.read_text(encoding='utf-8')
    data_line = re.search(r'^const DATA = (.*);$', page, re.M)
    data = json.loads(data_line.group(1))
    terms = {w['en'] for lesson in data for ex in lesson['exercises'] for w in ex['words']}
    assert terms == set(source['entries']), 'Pronunciation keys must match the existing vocabulary exactly'
    runtime = {term: runtime_entry(entry) for term, entry in source['entries'].items()}
    encoded = json.dumps(runtime, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c')
    assignment = 'const MT_PRONUNCIATIONS = ' + encoded + ';'
    license_block = '/* CMUDICT PRONUNCIATION DATA LICENSE\n' + LICENSE.read_text(encoding='utf-8').strip() + '\nEND CMUDICT PRONUNCIATION DATA LICENSE */\n'
    updated = re.sub(r'/\* CMUDICT PRONUNCIATION DATA LICENSE\n.*?END CMUDICT PRONUNCIATION DATA LICENSE \*/\n', '', page, flags=re.S)
    updated, count = re.subn(r'^const MT_PRONUNCIATIONS = .*;$', lambda _: license_block + assignment, updated, flags=re.M)
    assert count == 1, 'Expected exactly one pronunciation assignment'
    assert data_line.group(0) == re.search(r'^const DATA = .*;$', updated, re.M).group(0)
    if check:
        assert updated == page, 'Embedded IPA is stale; run this script without --check'
    else:
        PAGE.write_text(updated, encoding='utf-8', newline='\n')
    print(f'{"Verified" if check else "Embedded"} {len(runtime):,} pronunciations; original DATA unchanged.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    assemble(parser.parse_args().check)
