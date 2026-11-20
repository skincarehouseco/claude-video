"""Replace a neutral (grey/black/white) background with a new background image, frame by frame.

Works when the subject is coloured (skin, green foam, products) and the original background is neutral
(e.g. the grey slat wall in the foam clips): the matte comes from chroma (max(RGB) - min(RGB)), with
morphological closing, border-aware hole filling, small-blob removal and light temporal smoothing,
so it is stable and does not flicker. Then: soft depth-of-field on the new background, a soft contact
shadow, warm colour match and a light wrap on the edges.

usage: python bg_replace_chroma.py <in.mp4> <background.png> <out.mp4> [bg_offset_x=0.5]
(needs numpy, opencv-python-headless; ffmpeg on PATH; audio is copied from the input)
"""
import subprocess, sys
import numpy as np, cv2

src, bg_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
offx = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
W, H = 1080, 1920

# --- background: cover-scale to 9:16, soft depth of field, very slight lift ---
bg = cv2.cvtColor(cv2.imread(bg_path), cv2.COLOR_BGR2RGB).astype(np.float32)
s = max(W / bg.shape[1], H / bg.shape[0])
bg = cv2.resize(bg, (round(bg.shape[1] * s), round(bg.shape[0] * s)), interpolation=cv2.INTER_LANCZOS4)
x0 = int((bg.shape[1] - W) * offx); y0 = (bg.shape[0] - H) // 2
bg = bg[y0:y0 + H, x0:x0 + W]
bg = cv2.GaussianBlur(bg, (0, 0), 2.2)
bg_wrap = cv2.GaussianBlur(bg, (0, 0), 18)

K_CLOSE = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))  # small: closes noise, keeps gaps between fingers open

def matte(f):
    x = f.astype(np.float32)
    chroma = x.max(2) - x.min(2)
    chroma = cv2.GaussianBlur(chroma, (0, 0), 2.0)
    b = (chroma > 15).astype(np.uint8)
    b = cv2.morphologyEx(b, cv2.MORPH_CLOSE, K_CLOSE)
    # fill only SMALL enclosed holes (white highlights inside the foam); big enclosed areas such as the gaps
    # between fingers stay background, so the new studio shows through them
    holes = (1 - b).astype(np.uint8)
    nh, labh, sth, _ = cv2.connectedComponentsWithStats(holes)
    for i in range(1, nh):
        x, y, w, h, area = sth[i]
        touches = x == 0 or y == 0 or x + w >= b.shape[1] or y + h >= b.shape[0]
        if not touches and area < 3000:
            b[labh == i] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(b)
    keep = np.zeros_like(b)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 6000:
            keep[lab == i] = 1
    keep = cv2.erode(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    hard = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2.5)
    # soft ramp near the main shapes keeps motion-blurred edges semi-solid instead of ghostly
    near = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))).astype(np.float32)
    ramp = np.clip((chroma - 9) / 9, 0, 1) * near
    return np.maximum(hard, ramp)

probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip()
rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-vf', f'scale={W}:{H}', '-'], stdout=subprocess.PIPE)
wr = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', probe, '-i', '-', '-i', src,
                       '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'copy', out], stdin=subprocess.PIPE)
prev = None
n = 0
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    a = matte(f)
    if prev is not None:
        a = 0.78 * a + 0.22 * prev  # light temporal smoothing (stable edges without ghosting fast tosses)
    prev = a
    fg = f.astype(np.float32)
    fg = np.clip(fg * np.array([1.035, 1.01, 0.97]) * 1.04 + 4, 0, 255)  # warm/bright match to the studio light
    # soft shadow of the subject on the background (offset down-right, warm-dark)
    sh = cv2.GaussianBlur(np.roll(np.roll(a, 22, 0), 14, 1), (0, 0), 24)
    b = bg * (1 - 0.2 * sh[..., None]) + np.array([90, 60, 50]) * 0.2 * sh[..., None] * 0.15
    A = a[..., None]
    comp = fg * A + b * (1 - A)
    # light wrap: let the bright background bleed slightly onto the subject's edges
    band = (a * (1 - cv2.GaussianBlur(a, (0, 0), 6)))[..., None]
    comp = comp + (bg_wrap - comp) * np.clip(band * 1.6, 0, 0.35)
    wr.stdin.write(np.clip(comp, 0, 255).astype(np.uint8).tobytes())
    n += 1
wr.stdin.close(); wr.wait(); rd.wait()
print(f'{n} frames -> {out}')
