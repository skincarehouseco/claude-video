"""Hybrid background replacement for hands + foam + product shot against a plain warm-white wall.

Matte = union of (a) hue-difference key (scripts/matte_huekey.py: very reliable for hands/skin, teal can, dark sleeves,
greenish foam) and (b) rembg u2net saliency mask (fills in the pale/white foam the hue key misses), minus pixels whose
colour matches the wall (keeps e.g. the hole of a foam donut open). Then small-hole fill, temporal smoothing,
edge decontamination, subtle optical-style bokeh on the new background, matched grain, soft shadow and light wrap.

usage: [BG_BLUR=4] [GRAIN=2] python bg_replace_hybrid.py <in.mp4> <background.png> <out.mp4> [offset_x=0.5]
needs: numpy, opencv-python-headless, rembg (u2net), ffmpeg. Audio is not copied (mux it later).
"""
import os, subprocess, sys
import numpy as np, cv2
from PIL import Image
from rembg import new_session, remove
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from matte_huekey import matte as huekey

src, bg_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
offx = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
BG_BLUR = float(os.environ.get('BG_BLUR', '4'))
GRAIN = float(os.environ.get('GRAIN', '2'))
W, H = 1080, 1920
w2, h2 = 540, 960
sess = new_session('u2net')

bg = cv2.cvtColor(cv2.imread(bg_path), cv2.COLOR_BGR2RGB).astype(np.float32)
s = max(W / bg.shape[1], H / bg.shape[0])
bg = cv2.resize(bg, (round(bg.shape[1] * s), round(bg.shape[0] * s)), interpolation=cv2.INTER_LANCZOS4)
x0 = int((bg.shape[1] - W) * offx); y0 = (bg.shape[0] - H) // 2
bg = bg[y0:y0 + H, x0:x0 + W]
# subtle optical bokeh: blur that grows slightly towards the frame edges (lens-like), never a uniform smear
blur_c = cv2.GaussianBlur(bg, (0, 0), BG_BLUR)
blur_e = cv2.GaussianBlur(bg, (0, 0), BG_BLUR * 1.6)
yy, xx = np.mgrid[0:H, 0:W]
edge = np.clip(np.hypot((xx - W / 2) / (W / 2), (yy - H * 0.45) / (H * 0.6)) - 0.4, 0, 1)[..., None]
bg = blur_c * (1 - edge) + blur_e * edge
bg_wrap = cv2.GaussianBlur(bg, (0, 0), 16)
rng = np.random.default_rng(3)

def wall_like(small):
    x = small.astype(np.float32); r, g, b = x[..., 0], x[..., 1], x[..., 2]; lum = x.mean(-1)
    border = lambda a: np.concatenate([a[:30].ravel(), a[:, :20].ravel()])
    gr, rb, lm = np.median(border(g - r)), np.median(border(r - b)), np.median(border(lum))
    d = np.maximum.reduce([np.abs((g - r) - gr) / 5, np.abs((r - b) - rb) / 9, np.clip((lm - 18 - lum) / 10, 0, None)])
    return np.clip(1.5 - d, 0, 1)  # 1 = looks exactly like the wall

def matte(frame):
    small = cv2.resize(frame, (w2, h2), interpolation=cv2.INTER_AREA)
    hk = huekey(small, small_hole=1500, min_blob=1200)
    sal = np.asarray(remove(Image.fromarray(small), session=sess, only_mask=True), np.float32) / 255
    a = np.maximum(hk, sal * (1 - wall_like(small)))
    b = (a > 0.5).astype(np.uint8)
    holes = (1 - b).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(holes)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if not (x == 0 or y == 0 or x + w >= w2 or y + h >= h2) and area < 1500:
            b[lab == i] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(b)
    keep = np.zeros_like(b)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 1200:
            keep[lab == i] = 1
    a = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.2)
    return cv2.resize(a, (W, H), interpolation=cv2.INTER_CUBIC).clip(0, 1)

fps = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip()
rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
wr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', fps, '-i', '-',
                       '-c:v', 'libx264', '-crf', '15', '-preset', 'slow', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
prev, n = None, 0
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    a = matte(f)
    if prev is not None:
        a = 0.72 * a + 0.28 * prev  # temporal smoothing against edge flicker
    prev = a
    a = cv2.GaussianBlur(a, (0, 0), 1.5)
    fg = f.astype(np.float32)
    core = (a > 0.92).astype(np.float32)
    cb = cv2.GaussianBlur(core, (0, 0), 5)[..., None]
    fgx = cv2.GaussianBlur(fg * core[..., None], (0, 0), 5) / np.maximum(cb, 1e-3)
    wgt = np.clip((a[..., None] - 0.55) / 0.4, 0, 1) ** 2
    fg = np.where(cb > 0.02, fg * wgt + fgx * (1 - wgt), fg)
    sh = cv2.GaussianBlur(np.roll(np.roll(a, 26, 0), 10, 1), (0, 0), 30)
    b = bg * (1 - 0.14 * sh[..., None])
    if GRAIN > 0:
        b = b + rng.normal(0, GRAIN, (H, W, 1)).astype(np.float32)
    A = a[..., None]
    comp = fg * A + b * (1 - A)
    band = (a * (1 - cv2.GaussianBlur(a, (0, 0), 6)))[..., None]
    comp = comp + (bg_wrap - comp) * np.clip(band * 1.4, 0, 0.3)
    wr.stdin.write(np.clip(comp, 0, 255).astype(np.uint8).tobytes())
    n += 1
    if n % 100 == 0:
        print(n, 'frames', flush=True)
wr.stdin.close(); wr.wait(); rd.wait()
print(f'{n} frames -> {out}')
