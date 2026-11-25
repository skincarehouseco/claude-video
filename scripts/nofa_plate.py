"""Background enhancement plate for the Nofa video (public/nofa/plate.mp4).

Foreground = union of the product/hand matte (isnet-general-use) and the human matte (RVM), so hands, arm,
jewellery, tubes and swatches are protected. The foreground keeps the ORIGINAL pixels, untouched, so shade
colours, skin tone and packaging colours stay exactly as filmed.
Only the background is graded: re-toned to a warm ivory studio tone, softly lifted, with a slow-drifting
window-light shadow (diffused) — subtle enough to read as real light.
Mattes are temporally smoothed (reset at cuts) and the edit starts ~6 px outside the subject, so there is
no visible cut-out edge.

usage: nofa_plate.py frames_dir isnet_masks rvm_alphas cuts.json out.mp4
"""
import glob, json, os, subprocess, sys
import cv2
import numpy as np

frames, mdir, rdir, cuts_file, out = sys.argv[1:6]
cuts = set(json.load(open(cuts_file)))
files = sorted(glob.glob(f"{frames}/f_*.jpg"))
if len(sys.argv) > 6:  # optional: only these frames (for checks)
    keep = set(int(x) for x in sys.argv[6].split(','))
    files = [f for f in files if int(os.path.basename(f)[2:6]) in keep]
H, W = 1920, 1080
ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
     "-c:v", "libx264", "-crf", "13", "-preset", "slow", "-pix_fmt", "yuv420p", "-g", "15", out],
    stdin=subprocess.PIPE,
)
IVORY = np.array([244, 236, 224], np.float32)  # warm ivory (RGB)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# soft directional daylight: brighter top-left, gently falling off
light = 1.04 - 0.10 * ((xx / W) * 0.6 + (yy / H) * 0.4)


def window_shadow(t):
    """diffused window-pane shadow (two mullions + a sill), drifting very slowly"""
    a = np.deg2rad(-24)
    u = (xx - W * 0.5) * np.cos(a) - (yy - H * 0.4) * np.sin(a) + t * 6.0
    v = (xx - W * 0.5) * np.sin(a) + (yy - H * 0.4) * np.cos(a)
    bars = np.exp(-(((u % 520) - 260) ** 2) / (2 * 26 ** 2))  # vertical mullions every 520 px
    sill = np.exp(-(((v + 520) % 900 - 450) ** 2) / (2 * 30 ** 2))
    sh = np.clip(bars + 0.7 * sill, 0, 1)
    sh = cv2.GaussianBlur(sh.astype(np.float32), (0, 0), 38)
    return 1 - 0.11 * sh / (sh.max() + 1e-6)


prev = None


def robust_fg(img, soft):
    """conservative foreground: faint matte counts, skin is always protected, enclosed holes are filled"""
    hard = (soft > 0.12).astype(np.uint8)
    ycc = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_RGB2YCrCb)
    skin = ((ycc[..., 1] > 136) & (ycc[..., 1] < 180) & (ycc[..., 2] > 80) & (ycc[..., 2] < 132) & (ycc[..., 0] > 50)).astype(np.uint8)
    skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    m = cv2.morphologyEx(hard | skin, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    # fill holes: anything not reachable from the border through background is foreground
    inv = (1 - m).astype(np.uint8)
    ff_mask = np.zeros((H + 2, W + 2), np.uint8)
    reach = inv.copy()
    for x0, y0 in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (0, H // 2), (W - 1, H // 2)]:
        if reach[y0, x0] == 1:
            cv2.floodFill(reach, ff_mask, (x0, y0), 2)
    m = np.where(reach == 2, 0, 1).astype(np.uint8)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
    return np.clip(cv2.GaussianBlur(m.astype(np.float32), (0, 0), 9), 0, 1)


k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))
for i, f in enumerate(files):
    n = int(os.path.basename(f)[2:6])
    img = cv2.imread(f)[:, :, ::-1].astype(np.float32)
    m1 = cv2.imread(f"{mdir}/f_{n:04d}.png", 0).astype(np.float32) / 255
    m2 = cv2.imread(f"{rdir}/a_{n:04d}.png", 0).astype(np.float32) / 255
    fg = robust_fg(img, np.maximum(m1, m2))
    if n in cuts:
        prev = None
    if prev is not None:
        fg = np.maximum(fg, 0.6 * fg + 0.4 * prev)  # smoothing may only ADD protection, never remove it
    prev = fg
    # background re-tone: keep the real texture/luminance, move hue to warm ivory, lift slightly
    lum = img.mean(axis=2, keepdims=True)
    ref = max(1.0, float(np.median(lum[fg < 0.1])) if (fg < 0.1).any() else 200.0)
    tone = IVORY[None, None] * (0.86 + 0.14 * lum / ref) * (lum / ref) ** 0.35
    bg = (0.3 * img + 0.7 * tone) * (light * window_shadow(n / 30.0))[..., None]
    outf = img * fg[..., None] + np.clip(bg, 0, 255) * (1 - fg[..., None])
    ff.stdin.write(outf.astype(np.uint8).tobytes())
    if i % 100 == 0:
        print("plate", n, flush=True)
ff.stdin.close()
ff.wait()
print("done", out)
