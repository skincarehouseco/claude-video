"""Procedurally render the illustrative background textures (no stock / third-party images).
All skin textures are ILLUSTRATIONS, not clinical photos — the edit labels them "ilustrasi".

Usage: python3 scripts/make_textures.py public/bg
"""
import os, sys
import numpy as np
import cv2

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/bg"
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
rng = np.random.default_rng(3)


def fbm(h, w, octaves=5, base=6, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n = base * 2**o
        g = r.standard_normal((n * h // w + 2, n + 2)).astype(np.float32)
        out += amp * cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
        tot += amp
        amp *= 0.5
    out /= tot
    return (out - out.min()) / (out.max() - out.min() + 1e-6)


def shade(height, strength=6.0, light=(-0.5, -0.7, 0.5)):
    gy, gx = np.gradient(height * strength)
    n = np.dstack([-gx, -gy, np.ones_like(height)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    l = np.array(light, np.float32)
    l /= np.linalg.norm(l)
    return np.clip((n * l).sum(2), 0, 1), n


def pores(h, w, count, rmin=1.5, rmax=3.5, seed=1):
    r = np.random.default_rng(seed)
    m = np.zeros((h, w), np.float32)
    for _ in range(count):
        x, y = r.integers(0, w), r.integers(0, h)
        cv2.circle(m, (int(x), int(y)), int(r.uniform(rmin, rmax)), 1.0, -1, cv2.LINE_AA)
    return cv2.GaussianBlur(m, (0, 0), 1.2)


def skin_base(tone=(205, 160, 135)):
    # BGR order for cv2
    b = fbm(H, W, 6, 4, 11)
    col = np.array(tone[::-1], np.float32)[None, None]
    img = col * (0.88 + 0.18 * b[..., None])
    return img, b


def save(name, img):
    cv2.imwrite(os.path.join(OUT, name), np.clip(img, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("saved", name)


# 1. neutral skin macro (illustration)
img, b = skin_base()
p = pores(H, W, 2600, seed=2)
micro = fbm(H, W, 6, 40, 5)
height = 0.6 * micro - 1.2 * p + 0.3 * b
s, n = shade(height, 4.0)
skin = img * (0.75 + 0.35 * s[..., None])
save("skin.jpg", skin)

# 2. oily skin: same base + strong specular highlights and sebum droplets
img, b = skin_base((214, 168, 138))
p = pores(H, W, 2600, seed=2) * 1.3
drops = np.zeros((H, W), np.float32)
r = np.random.default_rng(9)
for _ in range(260):
    x, y = r.integers(0, W), r.integers(0, H)
    rad = r.uniform(4, 22)
    cv2.ellipse(drops, (int(x), int(y)), (int(rad), int(rad * r.uniform(0.6, 1))), r.uniform(0, 180), 0, 360, 1.0, -1, cv2.LINE_AA)
drops = cv2.GaussianBlur(drops, (0, 0), 3)
height = 0.5 * fbm(H, W, 6, 40, 5) - 1.0 * p + 2.5 * drops + 0.3 * b
s, n = shade(height, 5.0)
# Blinn-phong style specular from a soft top-left light
hv = np.array([-0.3, -0.5, 0.8], np.float32)
hv /= np.linalg.norm(hv)
spec = np.clip((n * hv).sum(2), 0, 1) ** 40
sheen = fbm(H, W, 3, 3, 21)
oily = img * (0.72 + 0.35 * s[..., None]) + 255 * (0.9 * spec * (0.4 + 0.6 * sheen))[..., None] + 40 * sheen[..., None]
save("oily.jpg", oily)

# 3. dry / flaky skin: voronoi crack network + raised flakes, desaturated
img, b = skin_base((198, 160, 140))
pts = np.stack([r.uniform(0, W, 380), r.uniform(0, H, 380)], 1).astype(np.float32)
small = 4
hs, ws = H // small, W // small
yy, xx = np.mgrid[0:hs, 0:ws].astype(np.float32) * small
d1 = np.full((hs, ws), 1e9, np.float32)
d2 = np.full((hs, ws), 1e9, np.float32)
for px, py in pts:
    d = (xx - px) ** 2 + (yy - py) ** 2
    m = d < d1
    d2 = np.where(m, d1, np.minimum(d2, d))
    d1 = np.where(m, d, d1)
edge = np.sqrt(d2) - np.sqrt(d1)
edge = cv2.resize(edge, (W, H), interpolation=cv2.INTER_LINEAR)
crack = np.exp(-edge / 2.0)
warp = fbm(H, W, 4, 8, 33)
crack = np.clip(crack * (0.7 + 0.6 * warp), 0, 1)
flake = np.clip((edge / 30.0), 0, 1) ** 0.5
height = 0.5 * fbm(H, W, 6, 50, 7) - 1.6 * crack + 0.5 * flake
s, _ = shade(height, 5.0)
dry = img * (0.7 + 0.35 * s[..., None])
gray = dry.mean(2, keepdims=True)
dry = dry * 0.7 + gray * 0.3 + 18  # paler, ashier
dry -= (crack * 45)[..., None]
# lifted, whitish flake rims just beside each crack
rim = np.exp(-((edge - 5.0) ** 2) / 6.0) * (fbm(H, W, 3, 20, 2) > 0.45)
dry += (rim * 55)[..., None]
save("dry.jpg", dry)

# 4. bathroom: white subway tiles with grout and soft window light
tile = np.full((H, W, 3), 238, np.float32)
th, tw = 90, 180
for row in range(H // th + 1):
    off = (tw // 2) * (row % 2)
    y = row * th
    cv2.line(tile, (0, y), (W, y), (205, 205, 200), 5)
    for x in range(-tw, W + tw, tw):
        cv2.line(tile, (x + off, y), (x + off, y + th), (205, 205, 200), 5)
# bevel highlight on each tile
for row in range(H // th + 1):
    off = (tw // 2) * (row % 2)
    for x in range(-tw, W + tw, tw):
        cv2.line(tile, (x + off + 6, row * th + 8), (x + off + tw - 6, row * th + 8), (252, 252, 252), 3)
light = np.dstack([np.linspace(1.04, 0.86, W)[None, :].repeat(H, 0)] * 3)
vgrad = np.linspace(1.02, 0.9, H)[:, None, None]
tile = tile * light * vgrad
tile[..., 0] *= 1.03  # slightly cool
save("tiles.jpg", tile)

# 5. water / rinse: blue caustics
c1 = fbm(H, W, 4, 5, 41)
c2 = fbm(H, W, 4, 7, 42)
caust = np.abs(np.sin(c1 * 18) * np.sin(c2 * 15))
caust = cv2.GaussianBlur(caust.astype(np.float32), (0, 0), 2) ** 0.6
base = np.array([210, 170, 60], np.float32)  # BGR -> blue water
deep = np.array([150, 90, 20], np.float32)
g = np.linspace(0, 1, H)[:, None, None]
water = base * (1 - g) + deep * g
water = water + caust[..., None] * np.array([70, 60, 30])[None, None]
save("water.jpg", water)
