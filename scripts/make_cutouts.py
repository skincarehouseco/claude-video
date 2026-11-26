"""Build per-frame RGBA speaker cut-outs (public/glow/cut/s_XXXX.webp) for GlowEdit.

BiRefNet-portrait masks are computed on every 3rd frame (scripts/seg_birefnet.py) because it costs
~20 s/frame on CPU. In-between masks are made by warping the two neighbouring keyframe masks onto
the current frame with DIS optical flow and blending them by distance. Masks are then temporally
smoothed, slightly contracted + feathered and saved as lossy WebP with alpha.

usage: make_cutouts.py <frames_dir> <masks_dir> <out_dir> a-b [a-b ...]
"""
import os, sys, cv2, numpy as np
from concurrent.futures import ProcessPoolExecutor
fr_dir, mk_dir, out_dir = sys.argv[1:4]
ranges = [tuple(map(int, r.split('-'))) for r in sys.argv[4:]]
os.makedirs(out_dir, exist_ok=True)

def img(n): return cv2.imread(f"{fr_dir}/f_{n:04d}.jpg")
def mask(n): return cv2.imread(f"{mk_dir}/f_{n:04d}.png", cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255
S = 0.5  # flow at half res
def warp(m_key, im_cur, im_key):
    g1 = cv2.cvtColor(cv2.resize(im_cur, None, fx=S, fy=S), cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(cv2.resize(im_key, None, fx=S, fy=S), cv2.COLOR_BGR2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    flow = dis.calc(g1, g2, None)  # for each pixel of current frame: where it is in key frame
    flow = cv2.resize(flow, (im_cur.shape[1], im_cur.shape[0])) / S
    h, w = m_key.shape
    gx, gy = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(m_key, gx + flow[..., 0], gy + flow[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def raw_mask(n, keys):
    if n in keys: return mask(n)
    k0 = max(k for k in keys if k < n); k1 = min(k for k in keys if k > n)
    cur = img(n)
    m0 = warp(mask(k0), cur, img(k0)); m1 = warp(mask(k1), cur, img(k1))
    w1 = (n - k0) / (k1 - k0)
    return m0 * (1 - w1) + m1 * w1

def job(args):
    a, b, ra, rb = args  # chunk [a,b] inside shot range [ra,rb]; keyframes come from the whole shot
    keys = {int(f[2:6]) for f in os.listdir(mk_dir) if f.startswith('f_') and ra <= int(f[2:6]) <= rb}
    raws = {n: raw_mask(n, keys) for n in range(a, b + 1)}
    for n in range(a, b + 1):
        nb = [raws[k] for k in (n - 1, n + 1) if k in raws]
        m = raws[n] * 0.6 + (sum(nb) / len(nb)) * 0.4 if nb else raws[n]
        m = cv2.erode(m, np.ones((3, 3), np.uint8))
        m = cv2.GaussianBlur(m, (0, 0), 1.4)
        m = np.clip((m - 0.06) / 0.88, 0, 1)
        rgba = cv2.cvtColor(img(n), cv2.COLOR_BGR2BGRA)
        rgba[..., 3] = (m * 255).astype(np.uint8)
        cv2.imwrite(f"{out_dir}/s_{n:04d}.webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 92])
    return b - a + 1

if __name__ == "__main__":
    # split long ranges into chunks that share keyframe boundaries
    chunks = []
    for a, b in ranges:
        s = a
        while s <= b:
            e = min(b, s + 59)
            chunks.append((s, e, a, b)); s = e + 1
    with ProcessPoolExecutor(int(os.environ.get("JOBS", "3"))) as ex:
        print("frames:", sum(ex.map(job, chunks)))
