"""Build the presenter cut-out video (public/subject.webm, VP9 with alpha) from the source frames and
Robust Video Matting alphas (scripts/rvm.py).

Per frame:
  * alpha is lightly contracted (removes the 1-2px wall halo) and feathered, then blended 70/30 with
    the previous frame's alpha to suppress edge shimmer (RVM is already temporally stable);
  * faint matte islands not attached to her body (>20px away) are removed;
  * edge colours are decontaminated: the light wall colour that leaks into semi-transparent edge pixels
    is estimated from nearby background pixels and removed (F = (I - (1-a)B) / a), so the hijab edge
    doesn't glow over darker backgrounds.
Face, skin and product pixels (alpha ~1) are untouched.

Usage: python3 scripts/make_subject.py <frames_dir> <alpha_dir> public/subject.webm
"""
import glob, os, subprocess, sys
import cv2
import numpy as np

frames_dir, alpha_dir, out = sys.argv[1:4]
files = sorted(glob.glob(f"{frames_dir}/f_*.jpg"))
H, W = 1920, 1080
ff = subprocess.Popen(
    [
        "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "22", "-deadline", "good", "-cpu-used", "5",
        "-row-mt", "1", "-threads", "4", "-auto-alt-ref", "0", out,
    ],
    stdin=subprocess.PIPE,
)
import json
CUTS = set(json.load(open(os.path.join(os.path.dirname(__file__), 'cuts.json'))))
prev = None
k3 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
kbig = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))
for i, f in enumerate(files):
    n = int(os.path.basename(f)[2:6])
    img = cv2.imread(f)[:, :, ::-1].astype(np.float32)
    a = cv2.imread(f"{alpha_dir}/a_{n:04d}.png", 0).astype(np.float32) / 255
    # drop faint matte islands that aren't attached to her body (ghosts of the wall art)
    core = (a > 0.6).astype(np.uint8)
    cnt, lab, st, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    keep = np.zeros_like(core)
    for c in range(1, cnt):
        if st[c, cv2.CC_STAT_AREA] > 4000:
            keep[lab == c] = 1
    allowed = cv2.dilate(keep, kbig).astype(np.float32)
    a = a * cv2.GaussianBlur(allowed, (0, 0), 6)
    a = cv2.erode(a, k3)
    a = cv2.GaussianBlur(a, (0, 0), 0.9)
    a = np.clip((a - 0.04) / 0.92, 0, 1)
    if n in CUTS:
        prev = None  # never blend across a jump cut
    if prev is not None:
        a = 0.7 * a + 0.3 * prev
    prev = a
    # background colour estimate around the edge: normalised blur of pixels that are clearly background
    bgw = (a < 0.05).astype(np.float32)
    small = lambda x: cv2.resize(x, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    num = cv2.GaussianBlur(small(img * bgw[..., None]), (0, 0), 6)
    den = cv2.GaussianBlur(small(bgw), (0, 0), 6)[..., None] + 1e-4
    B = cv2.resize(num / den, (W, H), interpolation=cv2.INTER_LINEAR)
    edge = (a > 0.02) & (a < 0.98)
    F = img.copy()
    ae = np.maximum(a, 0.15)[..., None]
    Fd = np.clip((img - (1 - a[..., None]) * B) / ae, 0, 255)
    F[edge] = Fd[edge]
    rgba = np.dstack([F, a * 255]).astype(np.uint8)
    ff.stdin.write(rgba.tobytes())
    if i % 300 == 0:
        print("subject", n, flush=True)
ff.stdin.close()
ff.wait()
print("done", out)
