"""Record which face-demo clips exist and how long they are (src/facedemo/clips.json), and normalise them to
1080x1920 / 30 fps H.264 so Remotion can cut them cleanly.
usage: python3 deliverables/facedemo/register_clips.py   (run from the repo root; needs ffmpeg)"""
import glob, json, os, subprocess

CLIPS = 'public/facedemo/clips'
out = {}
for p in sorted(glob.glob(f'{CLIPS}/C*.*')):
    cid = os.path.splitext(os.path.basename(p))[0].split('_')[0].upper()
    if p.endswith('.norm.mp4'):
        continue
    norm = f'{CLIPS}/{cid}.norm.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-vf',
                    'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,fps=30',
                    '-an', '-c:v', 'libx264', '-crf', '15', '-preset', 'slow', '-pix_fmt', 'yuv420p', norm], check=True)
    os.replace(norm, f'{CLIPS}/{cid}.mp4')
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{CLIPS}/{cid}.mp4'],
                             capture_output=True, text=True).stdout)
    out[cid] = round(d, 3)
    print(cid, out[cid], 's')
json.dump(out, open('src/facedemo/clips.json', 'w'), indent=1)
print('->', 'src/facedemo/clips.json')
