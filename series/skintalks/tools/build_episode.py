"""Skin Talks — build the Remotion timeline for an episode.

Reads series/skintalks/episodes/<ep>/script.json + public/skintalks/<ep>/lines/manifest.json (from generate_voices.py)
and writes src/skintalks/episodes/<ep>.json with: absolute line timings, word-level caption timings (script spelling,
Whisper timing), per-frame voice energy for the speaking indicator, shot plan, infographic cues, and which
lip-sync clips exist (public/skintalks/<ep>/clips/<line_id>.mp4 — optional, produced by an external tool).

usage: python3 series/skintalks/tools/build_episode.py ep01
"""
import json, os, re, sys, difflib, wave
import numpy as np

ep = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
script = json.load(open(f'{ROOT}/series/skintalks/episodes/{ep}/script.json'))
voices = json.load(open(f'{ROOT}/series/skintalks/voices.json'))
lines_dir = f'{ROOT}/public/skintalks/{ep}/lines'
manifest = {m['id']: m for m in json.load(open(f'{lines_dir}/manifest.json'))}
FPS = 30
INTRO = 1.2  # title moment before the first line
GAP = voices['mix']['gap_between_lines_s']
OUTRO = 1.3

norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

def align(display, asr_words, dur):
    """give each display word a start/end time using Whisper word timings (sequence-matched)."""
    disp = display.split()
    a = [norm(w['w']) for w in asr_words]
    d = [norm(w) for w in disp]
    times = [None] * len(disp)
    sm = difflib.SequenceMatcher(None, d, a, autojunk=False)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for k in range(i2 - i1):
                times[i1 + k] = (asr_words[j1 + k]['s'], asr_words[j1 + k]['e'])
        elif tag == 'replace' and j2 > j1:
            # spread the replaced display words over the matched asr span
            s0, e0 = asr_words[j1]['s'], asr_words[j2 - 1]['e']
            n = i2 - i1
            for k in range(n):
                times[i1 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
    # fill gaps by interpolation
    known = [i for i, t in enumerate(times) if t]
    for i in range(len(times)):
        if times[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            s = times[prev][1] if prev is not None else 0.05
            e = times[nxt][0] if nxt is not None else dur - 0.05
            times[i] = (s, max(s + 0.08, e))
    return [dict(t=w, s=round(t[0], 3), e=round(t[1], 3)) for w, t in zip(disp, times)]

def energy(path):
    with wave.open(path) as w:
        sr = w.getframerate(); y = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    hop = sr // FPS
    e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2)) for i in range(0, len(y) - hop + 1, hop)])
    e = e / (e.max() + 1e-6)
    return [round(float(x), 3) for x in e]

timeline, t = [], INTRO
for i, line in enumerate(script['lines']):
    m = manifest[line['id']]
    words = align(line.get('display', line['text']), m['words'], m['duration'])
    for w in words:
        w['s'] = round(w['s'] + t, 3); w['e'] = round(w['e'] + t, 3)
    clip = f'skintalks/{ep}/clips/{line["id"]}.mp4'
    timeline.append(dict(id=line['id'], speaker=line['speaker'], start=round(t, 3), end=round(t + m['duration'], 3),
                         audio=f'skintalks/{ep}/lines/{line["id"]}.wav', words=words, energy=energy(f'{lines_dir}/{line["id"]}.wav'),
                         clip=clip if os.path.exists(f'{ROOT}/public/{clip}') else None))
    t += m['duration'] + GAP
duration = t - GAP + OUTRO

# full-length talking clips per host (e.g. from Kling: host image + that host's full-episode audio track, silent while the other speaks)
host_clips = {h: f'skintalks/{ep}/clips/{h}_full.mp4' for h in ('maya', 'nadia') if os.path.exists(f'{ROOT}/public/skintalks/{ep}/clips/{h}_full.mp4')}

# shot plan: speaker close-up by default, two-shot for the opening line, short reactions, and every ~3rd line
# (with talking clips for both hosts: always show the speaking host; the still two-shot only for the intro title)
shots = []
if len(host_clips) == 2:
    shots.append(dict(line=timeline[0]['id'], kind='two', start=0, end=timeline[0]['start'] - 0.05))
for i, L in enumerate(timeline):
    kind = L['speaker'] if len(host_clips) == 2 else ('two' if i == 0 or (i % 3 == 2 and L['speaker'] == 'maya') else L['speaker'])
    start = (L['start'] - 0.05 if len(host_clips) == 2 else L['start'] - INTRO) if i == 0 else L['start'] - GAP / 2
    shots.append(dict(line=L['id'], kind=kind, start=start, end=L['end'] + GAP / 2))
shots[-1]['end'] = duration

cues = []
for ig in script.get('infographics', []):
    L = next(x for x in timeline if x['id'] == ig['at_line'])
    cues.append(dict(ig, start=L['start'], end=L['end'] + 0.15))

out = dict(episode=script['episode'], title=script['title'], fps=FPS, hostClips=host_clips, duration=round(duration, 3),
           durationInFrames=int(round(duration * FPS)), intro=INTRO, lines=timeline, shots=shots, infographics=cues)
os.makedirs(f'{ROOT}/src/skintalks/episodes', exist_ok=True)
json.dump(out, open(f'{ROOT}/src/skintalks/episodes/{ep}.json', 'w'), ensure_ascii=False, indent=1)
print(f'{ep}: {duration:.2f}s, {len(timeline)} lines, per-line clips: {sum(1 for x in timeline if x["clip"])}/{len(timeline)}, full host clips: {sorted(host_clips)}')
for L in timeline:
    print(f"  {L['start']:6.2f}-{L['end']:6.2f} {L['speaker']:5s} " + ' '.join(w['t'] for w in L['words']))
