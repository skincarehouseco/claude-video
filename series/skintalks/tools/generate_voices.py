"""Skin Talks — voice generation (permanent voice profiles in series/skintalks/voices.json).

For every script line: generate N takes with mesolitica/Malaysian-TTS-0.6B-v1 (+ DistilCodec), transcribe each take
with Whisper large-v3, keep the take whose transcript best matches the script, trim silence, and save word timings.

usage (python env with torch, transformers, distilcodec, faster-whisper, librosa, soundfile):
  python generate_voices.py <episode_dir> <out_dir> [takes=3] [only=line_id,line_id]   (only: regenerate just those lines)
outputs: <out_dir>/<line_id>.wav (24 kHz mono) and <out_dir>/manifest.json
"""
import json, re, sys, time, difflib, os
import numpy as np, soundfile as sf, librosa, torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from distilcodec import DistilCodec
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
ep_dir, out_dir = sys.argv[1], sys.argv[2]
TAKES = int(sys.argv[3]) if len(sys.argv) > 3 else 3
ONLY = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
CODEC_DIR = os.environ.get('DISTILCODEC_DIR', 'models/codec')
os.makedirs(out_dir, exist_ok=True)
script = json.load(open(os.path.join(ep_dir, 'script.json')))
voices = json.load(open(os.path.join(HERE, '..', 'voices.json')))
torch.set_num_threads(4)

codec = DistilCodec.from_pretrained(config_path=f'{CODEC_DIR}/model_config.json', model_path=f'{CODEC_DIR}/g_00204000', use_generator=True, is_debug=False).eval()
tok = AutoTokenizer.from_pretrained(voices['model'])
model = AutoModelForCausalLM.from_pretrained(voices['model'], torch_dtype=torch.float32).eval()
asr = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)

norm = lambda s: re.sub(r'[^a-z0-9 ]', '', s.lower().replace('-', ' '))

def tts(speaker, text, seed, temperature):
    torch.manual_seed(seed)
    prompt = f'<|im_start|>{speaker}: {text}<|speech_start|>'
    with torch.no_grad():
        g = model.generate(**tok(prompt, return_tensors='pt', add_special_tokens=False), max_new_tokens=1500,
                           temperature=temperature, do_sample=True, repetition_penalty=1.1)
    st = tok.decode(g[0]).split('<|speech_start|>')[-1].replace('<|endoftext|>', '')
    codes = list(map(int, re.findall(r'speech_(\d+)', st)))
    with torch.no_grad():
        y = codec.decode_from_codes(codes, minus_token_offset=False)
    return y[0, 0].cpu().numpy().astype(np.float32)

def transcribe(y):
    y16 = librosa.resample(y, orig_sr=24000, target_sr=16000)
    segs, info = asr.transcribe(y16, language='ms', word_timestamps=True, beam_size=5)
    words = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]
    return ' '.join(w['w'] for w in words), words

old = {m['id']: m for m in json.load(open(os.path.join(out_dir, 'manifest.json')))} if ONLY and os.path.exists(os.path.join(out_dir, 'manifest.json')) else {}
manifest = []
for line in script['lines']:
    if ONLY and line['id'] not in ONLY and line['id'] in old:
        manifest.append(old[line['id']]); continue
    prof = voices['hosts'][line['speaker']]
    best = None
    for k in range(TAKES):
        t0 = time.time()
        y = tts(prof['tts_speaker'], line['text'], seed=prof['seed'] + k, temperature=prof['temperature'])
        y, _ = librosa.effects.trim(y, top_db=35)
        txt, words = transcribe(y)
        score = max(difflib.SequenceMatcher(None, norm(ref), norm(txt)).ratio() for ref in (line['text'], line.get('display', line['text'])))
        print(f"{line['id']} take {k}: {score:.3f} {len(y)/24000:.1f}s ({time.time()-t0:.0f}s) | {txt}", flush=True)
        if best is None or score > best[0]:
            best = (score, y, txt, words, k)
        if score > 0.97:
            break
    score, y, txt, words, k = best
    y = np.concatenate([np.zeros(int(0.05 * 24000), np.float32), y, np.zeros(int(0.05 * 24000), np.float32)])
    words = [dict(w=w['w'], s=w['s'] + 0.05, e=w['e'] + 0.05) for w in words]
    sf.write(os.path.join(out_dir, f"{line['id']}.wav"), y, 24000)
    manifest.append(dict(id=line['id'], speaker=line['speaker'], text=line['text'], display=line.get('display', line['text']),
                         duration=round(len(y) / 24000, 3), asr=txt, score=round(score, 3), take=k, words=words))
    json.dump(manifest, open(os.path.join(out_dir, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(manifest, open(os.path.join(out_dir, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print('done')
