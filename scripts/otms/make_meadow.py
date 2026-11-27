"""Procedural dreamy sunlit meadow (original artwork, no external images).
Outputs two layers so Remotion can parallax them: meadow_back.jpg (sky+far grass) and meadow_front.png (near grass, RGBA)."""
import numpy as np, sys, os
from PIL import Image, ImageDraw, ImageFilter
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 1300, 2300
rng = np.random.default_rng(11)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# --- sky / light: warm hazy gradient with light from top-left
y = np.linspace(0, 1, H)[:, None]; x = np.linspace(0, 1, W)[None, :]
top = np.array([246, 243, 228]); mid = np.array([168, 180, 128]); low = np.array([118, 138, 92])
t = np.clip(y * 3.0, 0, 1)
base = (top * (1 - t)[..., None] + mid * t[..., None])
base = np.where((y > 0.55)[..., None], mid * (1 - (y - 0.55) / 0.45)[..., None] + low * ((y - 0.55) / 0.45)[..., None], base)
glow = np.exp(-(((x - 0.15) ** 2) / 0.12 + ((y - 0.05) ** 2) / 0.08))[..., None]
base = base * (1 - 0.5 * glow) + np.array([255, 251, 236]) * 0.5 * glow
img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8).repeat(1, 0) if base.shape[1] == W else np.broadcast_to(base, (H, W, 3)).astype(np.uint8)).convert('RGB')

def pblur(L, r):
    a = np.asarray(L, np.float32) / 255.0
    rgb = a[..., :3] * a[..., 3:4]
    def gb(ch): return np.asarray(Image.fromarray((ch * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255.0
    A = gb(a[..., 3]); C = np.stack([gb(rgb[..., i]) for i in range(3)], -1)
    C = C / np.maximum(A[..., None], 1e-4)
    return Image.fromarray(np.clip(np.concatenate([C, A[..., None]], -1) * 255, 0, 255).astype(np.uint8), 'RGBA')

def grass_layer(n, y0, y1, length, width, cols, blur, alpha_rng, sway):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for _ in range(n):
        bx = rng.uniform(-100, W + 100); by = rng.uniform(y0, y1)
        ln = rng.uniform(*length); ang = np.deg2rad(rng.normal(-62, 10) + sway)
        c = cols[rng.integers(len(cols))]; a = int(rng.uniform(*alpha_rng))
        pts = []
        for k in range(12):
            s = k / 11
            px = bx + np.cos(ang) * ln * s + 0.25 * ln * s * s
            py = by - abs(np.sin(ang)) * ln * s
            pts.append((px, py))
        d.line(pts, fill=c + (a,), width=max(1, int(rng.uniform(*width))))
        # feathery seed head (the soft plume look)
        if rng.random() < 0.55:
            hx, hy = pts[-1]
            for j in range(10):
                cx, cy = hx + rng.normal(0, 7), hy + rng.normal(0, 18); r = rng.uniform(5, 10)
                d.ellipse([cx - r, cy - r * 1.4, cx + r, cy + r * 1.4], fill=(255, 252, 238, min(255, int(a * 0.9))))
    return pblur(L, blur)

def flowers(n, y0, y1, r, blur, cols):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    for _ in range(n):
        fx = rng.uniform(0, W); fy = rng.uniform(y0, y1); rr = rng.uniform(*r); c = cols[rng.integers(len(cols))]
        for k in range(5):
            a = k * 2 * np.pi / 5 + rng.uniform(0, 1)
            d.ellipse([fx + np.cos(a) * rr * 0.6 - rr * 0.55, fy + np.sin(a) * rr * 0.6 - rr * 0.55, fx + np.cos(a) * rr * 0.6 + rr * 0.55, fy + np.sin(a) * rr * 0.6 + rr * 0.55], fill=c + (215,))
        d.ellipse([fx - rr * 0.3, fy - rr * 0.3, fx + rr * 0.3, fy + rr * 0.3], fill=(252, 224, 120, 230))
    return pblur(L, blur)

greens = [(128, 146, 96), (156, 170, 118), (104, 124, 80), (206, 210, 168), (236, 232, 204), (186, 194, 146)]
pinks = [(242, 182, 196), (246, 200, 210), (236, 168, 186), (250, 222, 160)]
img = img.convert('RGBA')
img.alpha_composite(grass_layer(1400, 150, 900, (160, 320), (3, 6), greens, 16, (80, 150), -4))
img.alpha_composite(flowers(70, 300, 900, (10, 18), 10, pinks))
img.alpha_composite(grass_layer(1600, 600, 1500, (200, 380), (2, 5), greens, 4, (120, 200), 0))
img.alpha_composite(flowers(90, 800, 1500, (9, 15), 2.5, pinks))
img.alpha_composite(grass_layer(1300, 1100, 2000, (260, 460), (3, 6), greens, 7, (130, 210), 6))
img.alpha_composite(flowers(60, 1200, 2000, (14, 22), 6, pinks))
# light shafts
rays = Image.new('RGBA', (W, H), (0, 0, 0, 0)); rd = ImageDraw.Draw(rays)
for k in range(6):
    x0 = rng.uniform(-200, 700); wdt = rng.uniform(60, 160)
    rd.polygon([(x0, -50), (x0 + wdt, -50), (x0 + wdt + 900, H), (x0 + 900, H)], fill=(255, 250, 230, 38))
img.alpha_composite(rays.filter(ImageFilter.GaussianBlur(40)))
# bloom + haze for the sunlit, dreamy look
rgb = img.convert('RGB'); arr = np.asarray(rgb, np.float32)
bright = np.clip(arr - 170, 0, 255) * 2.2
bloom = np.asarray(Image.fromarray(np.clip(bright, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(30)), np.float32)
arr = 255 - (255 - arr) * (255 - bloom * 0.45) / 255
haze = np.array([252, 248, 232]); vy = np.linspace(1, 0, arr.shape[0])[:, None, None] ** 2; arr = arr * (1 - 0.35 * vy) + haze * 0.35 * vy
Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'meadow_back.jpg'), quality=92)

front = Image.new('RGBA', (W, H), (0, 0, 0, 0))
front.alpha_composite(grass_layer(500, 1750, 2400, (420, 760), (6, 12), greens, 14, (150, 220), 10))
front.alpha_composite(flowers(26, 1850, 2300, (22, 34), 12, pinks))
front.save(os.path.join(OUT, 'meadow_front.png'))
print('ok')
