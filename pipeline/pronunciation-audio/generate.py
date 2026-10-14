"""Offline authoring only. The site ships MP3s, never the model or Python runtime.

python generate.py --model-dir /path/to/models [--runtime-dir /path/to/pip-target]
The model directory must contain model.onnx, tokenizer.json, af_heart.bin,
and sources.json with pinned source URLs and SHA256 checksums.
"""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
import wave

ROOT = Path(__file__).resolve().parents[2]
CATALOG = Path(__file__).with_name('catalog.json')
OUT = ROOT / 'assets/pronunciation'
SR = 24000

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model-dir', required=True, type=Path)
    parser.add_argument('--runtime-dir', type=Path)
    parser.add_argument('--approved-samples', type=Path,
                        help='Optional original contract audition directory; preserves approved audio exactly')
    args = parser.parse_args()
    if args.runtime_dir:
        sys.path.insert(0, str(args.runtime_dir))
    import numpy as np
    import onnxruntime as ort
    import imageio_ffmpeg

    catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
    voice = catalog['voice']
    sources = json.loads((args.model_dir / 'sources.json').read_text(encoding='utf-8'))
    sources = [s for s in sources if s['file'] in ['model.onnx', 'tokenizer.json', voice+'.bin']]
    assert len(sources) == 3
    for src in sources:
        assert digest(args.model_dir / src['file']) == src['sha256'], src['file']
    recipe = {'engine': 'Kokoro-82M-v1.0 ONNX fp32', 'voice': voice,
              'speed': 1.0, 'sampleRate': SR, 'channels': 1, 'bitrateKbps': 64,
              'peakGain': 0.80, 'sources': sources}
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / 'manifest.json'
    def save_manifest(rows):
        temporary = OUT / '.manifest.tmp'
        temporary.write_text(json.dumps({'version': 1, 'voice': voice, 'recipe': recipe, 'entries': rows},
                                       ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        temporary.replace(dest)
    old = json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {}
    previous = {e['id']: e for e in old.get('entries', [])} if old.get('recipe') == recipe else {}
    vocab = json.loads((args.model_dir / 'tokenizer.json').read_text(encoding='utf-8'))['model']['vocab']
    styles = np.fromfile(args.model_dir / (voice+'.bin'), dtype='<f4').reshape(-1, 256)
    samples = []
    if args.approved_samples:
        samples = json.loads((args.approved_samples/'manifest.json').read_text(encoding='utf-8'))['clips']
    session = None
    results = []
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    for entry in catalog['entries']:
        if entry['status'] != 'ready':
            continue
        name, ph = entry['id'], entry['phonemes']
        assert name and all(c in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in name)
        assert all(c in vocab for c in ph), (name, set(ph)-vocab.keys())
        mp3 = OUT / (name+'.mp3')
        cached = previous.get(name)
        approved = next((s for s in samples if s['voice'] == voice and s['word'] == entry['term'] and s['input_phonemes'] == ph), None)
        approved_cache = not approved or (cached and cached.get('approvedSample') and cached['sha256'] == approved['sha256'])
        if approved_cache and cached and cached['phonemes'] == ph and mp3.exists() and digest(mp3) == cached['sha256']:
            results.append(cached)
            continue
        if approved:
            src = args.approved_samples/'audio'/f"contract-{approved['part_of_speech']}-{voice}.mp3"
            assert digest(src) == approved['sha256']
            mp3.write_bytes(src.read_bytes())
            seconds = approved['seconds']
        else:
            if session is None:
                options = ort.SessionOptions()
                options.intra_op_num_threads = 4
                options.inter_op_num_threads = 1
                session = ort.InferenceSession(str(args.model_dir/'model.onnx'), options,
                                               providers=['CPUExecutionProvider'])
            values = np.array([[0]+[vocab[c] for c in ph]+[0]], dtype=np.int64)
            signal = session.run(None, {'input_ids': values,
                'style': styles[len(ph):len(ph)+1].copy(),
                'speed': np.array([1.0], dtype=np.float32)})[0].reshape(-1)
            assert np.isfinite(signal).all() and SR/4 < len(signal) < SR*6, name
            peak = float(np.max(np.abs(signal)))
            assert peak > .005, name
            signal *= .80/peak
            seconds = len(signal)/SR
            with tempfile.TemporaryDirectory(prefix='.render-', dir=OUT) as tmp:
                assert Path(tmp).resolve().is_relative_to(OUT.resolve())
                wav = Path(tmp)/'word.wav'
                with wave.open(str(wav), 'wb') as f:
                    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
                    f.writeframes((signal*32767).astype('<i2').tobytes())
                subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav),
                    '-map_metadata', '-1', '-ac', '1', '-ar', str(SR), '-codec:a', 'libmp3lame',
                    '-b:a', '64k', str(mp3)], check=True)
        # Decode every new MP3, including approved samples. This detects broken
        # encoding/silence/clipping, not linguistic correctness or naturalness.
        raw = subprocess.check_output([ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', str(mp3),
            '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'])
        decoded = np.frombuffer(raw, dtype='<f4')
        assert np.isfinite(decoded).all() and len(decoded) > SR/4
        assert .005 < float(np.max(np.abs(decoded))) < 1
        row = {'id': name, 'phonemes': ph, 'src': f'assets/pronunciation/{name}.mp3',
               'duration': round(seconds, 4), 'bytes': mp3.stat().st_size, 'sha256': digest(mp3)}
        if approved:
            row['approvedSample'] = '2026-10-15 contract audition'
        results.append(row)
        # Progress survives interruptions; the builder refuses missing entries.
        save_manifest(results)
        print(f"{name}: {seconds:.2f}s / {row['bytes']} bytes", flush=True)
    save_manifest(results)
    print(json.dumps({'files': len(results), 'bytes': sum(r['bytes'] for r in results)}), flush=True)

if __name__ == '__main__':
    main()
