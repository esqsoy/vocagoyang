"""Execute the real assembler with writes captured in memory; never modify app files."""
from pathlib import Path
import contextlib
import hashlib
import io
import json
import runpy
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
writes = []
subprocesses = []
original_write = Path.write_text
original_unlink = Path.unlink
original_run = subprocess.run

def capture_write(self, text, *args, **kwargs):
    rel = self.resolve().relative_to(ROOT).as_posix()
    assert rel == 'vocagoyangfable.html' or rel in {f'pipeline/out/set{n}.json' for n in range(46, 51)}, rel
    existing = self.read_text(encoding='utf-8')
    equal = existing == text
    semantic_equal = json.loads(existing) == json.loads(text) if rel.endswith('.json') else equal
    writes.append({'path': rel, 'textEqualAfterUniversalNewlines': equal, 'semanticEqual': semantic_equal,
                   'sha256': hashlib.sha256(text.encode('utf-8')).hexdigest()})
    assert semantic_equal, f'Stale generated output: {rel}'
    return len(text)

def deny_unlink(self, *args, **kwargs):
    raise AssertionError(f'Assembler unexpectedly attempted unlink: {self}')

def capture_subprocess(args, *pos, **kwargs):
    assert len(args) == 2 and args[0] == 'node' and Path(args[1]).resolve() == ROOT / 'pipeline/index-stats.cjs', args
    subprocesses.append({'args': list(args), 'executed': False, 'reason': 'The regression driver independently runs index-stats.cjs --check.'})
    return subprocess.CompletedProcess(args, 0)

output = io.StringIO()
sys.path.insert(0, str(ROOT / 'pipeline'))  # Match direct execution's import path.
try:
    Path.write_text = capture_write
    Path.unlink = deny_unlink
    subprocess.run = capture_subprocess
    with contextlib.redirect_stdout(output):
        runpy.run_path(str(ROOT / 'pipeline/assemble.py'), run_name='__main__')
finally:
    Path.write_text = original_write
    Path.unlink = original_unlink
    subprocess.run = original_run

result = {'root': str(ROOT), 'appWritesPerformed': 0, 'capturedWrites': writes,
          'subprocesses': subprocesses, 'stdout': output.getvalue(), 'pass': True}
(HERE / 'fable-assembly-results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
