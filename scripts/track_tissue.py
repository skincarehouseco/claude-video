"""Track the tissue she holds up (42.5-45s) so the highlight ring/arrow follows it.
Tissue = bright, unsaturated, *smooth* pixels inside the presenter matte (the striped shirt is
bright too but has high local contrast). Writes src/tissue_track.json {frame: [x, y]} (1080x1920 px)."""
import json, sys
import cv2, numpy as np

frames_dir, alpha_dir = sys.argv[1:3]
start, end = int(sys.argv[3]), int(sys.argv[4])
pts = {}
for f in range(start, end + 1):
    im = cv2.imread(f"{frames_dir}/f_{f:04d}.jpg")
    a = cv2.imread(f"{alpha_dir}/a_{f:04d}.png", 0)
    im = cv2.resize(im, (270, 480)); a = cv2.resize(a, (270, 480))
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mu = cv2.blur(g, (7, 7)); sd = np.sqrt(np.maximum(cv2.blur(g * g, (7, 7)) - mu * mu, 0))
    m = ((hsv[..., 2] > 215) & (hsv[..., 1] < 30) & (sd < 7) & (a > 128)).astype(np.uint8)
    m[:150] = 0  # ignore face / hijab area
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    if n > 1:
        i = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        if st[i, cv2.CC_STAT_AREA] > 500:
            pts[f] = [float(cen[i][0] * 4), float(cen[i][1] * 4)]
# fill gaps + smooth (EMA both directions)
keys = sorted(pts)
out = {}
if keys:
    xs = np.interp(range(start, end + 1), keys, [pts[k][0] for k in keys])
    ys = np.interp(range(start, end + 1), keys, [pts[k][1] for k in keys])
    for arr in (xs, ys):
        for d in (1, -1):
            rng = range(1, len(arr)) if d == 1 else range(len(arr) - 2, -1, -1)
            for i in rng:
                arr[i] = 0.75 * arr[i - d] + 0.25 * arr[i]
    out = {str(f): [round(float(xs[i]), 1), round(float(ys[i]), 1)] for i, f in enumerate(range(start, end + 1))}
json.dump(out, open("src/tissue_track.json", "w"))
print("detected", len(pts), "of", end - start + 1)
for f in range(start, end + 1, 10): print(f, out.get(str(f)))
