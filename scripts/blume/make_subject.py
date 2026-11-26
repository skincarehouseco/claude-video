"""Merge segmentation masks into stable RGBA speaker cut-outs (public/blume/subject/s_XXXX.webp).

human : u2net_human_seg mask for every frame (clean person edges, hijab, hands)
isnet : isnet-general-use mask for frames where products are held (keeps bottles that the
        human model drops). Only its high-confidence pixels are used, and only blobs that touch
        the person survive, so background objects never leak in.
Masks are temporally smoothed (weighted 5-frame window) to remove edge flicker, then lightly
contracted + feathered.
usage: make_subject.py frames_dir human_dir isnet_dir out_dir [workers]
"""
import os, sys, numpy as np, cv2
from multiprocessing import Pool
fdir, hdir, idir, odir = sys.argv[1:5]
WORKERS = int(sys.argv[5]) if len(sys.argv) > 5 else 3
os.makedirs(odir, exist_ok=True)
N = len([f for f in os.listdir(fdir) if f.endswith('.jpg')])

# Static dark object on the shelf just right of her neck during the B&W section and final shot (frames 737-949):
# the person model glues it to the hijab. Fade out only DARK pixels inside a soft ellipse over the
# object (shirt / skin / bottles are lighter and stay; no hard edges).
# (first frame, last frame, centre x, centre y, radius x, radius y) — the framing shifts slightly between takes
OBJS = [
    # colour takes: the object sits just right of her neck (fade dark + grey-wall pixels only)
    (1, 64, 700, 900, 62, 42), (65, 181, 700, 906, 62, 42), (182, 332, 715, 906, 62, 42),
    (333, 414, 697, 904, 62, 42), (415, 471, 694, 902, 60, 40), (472, 519, 802, 985, 64, 44),
    (520, 542, 694, 892, 62, 42), (543, 576, 698, 892, 62, 42), (577, 629, 860, 1030, 62, 44),
    (630, 728, 700, 912, 62, 42),
    # black & white take and final shot
    (737, 907, 742, 912, 66, 62), (908, 949, 692, 898, 74, 46),
]
_yy, _xx = np.mgrid[0:1920, 0:1080].astype(np.float32)
UPPER = np.clip((900 - _yy) / 25, 0, 1)  # above her shoulder line there is only wall + object
WEIGHTS = []
for a_, b_, cx, cy, rx, ry in OBJS:
    d = np.sqrt(((_xx - cx) / rx) ** 2 + ((_yy - cy) / ry) ** 2)
    WEIGHTS.append((a_, b_, np.clip((1.25 - d) / 0.35, 0, 1)))  # 1 inside, soft falloff to 0 at 1.25 radii

def clean_static(n, m):
    w = next((w for a_, b_, w in WEIGHTS if a_ <= n <= b_), None)
    if w is None: return m
    bgr = cv2.GaussianBlur(cv2.imread(f"{fdir}/f_{n:04d}.jpg"), (0, 0), 1.5)
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    dark = np.clip((105 - g) / 25, 0, 1)
    if n < 737:
        # colour shots: also fade grey wall / shelf (low saturation); shirt, skin and bottles are saturated
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
        wall = np.clip((0.22 * 255 - hsv[..., 1]) / 20, 0, 1) * (g > 80)
        return m * (1 - w * np.maximum(dark, wall))
    return m * (1 - w * np.maximum(dark, UPPER))

def raw(n):
    h = cv2.imread(f"{hdir}/f_{n:04d}.png", cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
    h = clean_static(n, h)  # person-model mask only; product pixels from isnet are merged after
    ip = f"{idir}/f_{n:04d}.png"
    if os.path.exists(ip):
        i = cv2.imread(ip, cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
        prod = np.clip((i - 0.55) / 0.3, 0, 1)
        # products are light / saturated; never add dark background (chair, shadows) from isnet
        g = cv2.imread(f"{fdir}/f_{n:04d}.jpg", cv2.IMREAD_GRAYSCALE).astype(np.float32)
        prod *= np.clip((cv2.GaussianBlur(g, (0, 0), 3) - 95) / 30, 0, 1)
        u = np.maximum(h, prod)
        # keep only blobs connected to the person
        nl, lab = cv2.connectedComponents((u > 0.5).astype(np.uint8), connectivity=8)
        keep = np.zeros(nl, bool)
        person = h > 0.5
        for k in range(1, nl):
            if (person & (lab == k)).any(): keep[k] = True
        solid = keep[lab]
        solid = cv2.dilate(solid.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
        m = np.where(solid, u, h)
    else:
        m = h
    return m

cache = {}
def get(n):
    if n not in cache: cache[n] = raw(n)
    return cache[n]

def work(rng):
    a, b = rng
    for n in range(a, b + 1):
        ws = {-2: 0.1, -1: 0.2, 0: 0.4, 1: 0.2, 2: 0.1}
        acc = 0; tot = 0
        for d, w in ws.items():
            k = n + d
            if 1 <= k <= N:
                acc = acc + get(k) * w; tot += w
        for k in list(cache):
            if k < n - 3: del cache[k]
        m = acc / tot
        m = cv2.erode(m, np.ones((3, 3), np.uint8))
        m = cv2.GaussianBlur(m, (0, 0), 1.3)
        m = np.clip((m - 0.06) / 0.86, 0, 1)
        img = cv2.imread(f"{fdir}/f_{n:04d}.jpg")
        rgba = np.dstack([img, (m * 255).astype(np.uint8)])
        cv2.imwrite(f"{odir}/s_{n:04d}.webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 94])
    return b - a + 1

if __name__ == "__main__":
    step = (N + WORKERS - 1) // WORKERS
    chunks = [(s, min(N, s + step - 1)) for s in range(1, N + 1, step)]
    with Pool(WORKERS) as p:
        print("frames:", sum(p.map(work, chunks)))
