"""Track the three swatch centres (Vanilla / Light / Natural) with pyramidal Lucas-Kanade optical flow so the
labels' tracking lines follow the arm. Seeds are placed by hand on one clean frame per shot and tracked
forwards/backwards inside that shot. Output: src/nofa/swatch_track.json {frame: [[x,y]x3]} (1-based frames)."""
import json, sys
import cv2, numpy as np

fr = sys.argv[1]
SHOTS = [  # (first, last, seed frame, seeds V/L/N)
    (131, 237, 200, [(540, 820), (540, 1060), (540, 1300)]),  # Vanilla only is on the arm here
    (238, 390, 360, [(680, 820), (600, 1060), (500, 1380)]),
    (391, 448, 420, [(360, 600), (440, 820), (560, 1120)]),
]
lk = dict(winSize=(61, 61), maxLevel=4, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))
g = lambda n: cv2.cvtColor(cv2.imread(f"{fr}/f_{n:04d}.jpg"), cv2.COLOR_BGR2GRAY)
out = {}
for a, b, s, seeds in SHOTS:
    # track a small cloud around each seed and use its median, which is robust to the finger passing over
    offs = np.array([(dx, dy) for dx in (-40, 0, 40) for dy in (-25, 0, 25)], np.float32)
    for direction in (1, -1):
        pts = np.concatenate([np.array(p, np.float32) + offs for p in seeds])[:, None, :]
        prev = g(s)
        out[s] = [list(map(float, p)) for p in seeds]
        n = s + direction
        while a <= n <= b:
            cur = g(n)
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, pts, None, **lk)
            back, st2, _ = cv2.calcOpticalFlowPyrLK(cur, prev, nxt, None, **lk)
            ok = (st[:, 0] == 1) & (np.linalg.norm(back - pts, axis=2)[:, 0] < 2.0)
            centres = []
            for k in range(3):
                sl = slice(k * len(offs), (k + 1) * len(offs))
                d = (nxt[sl] - pts[sl])[ok[sl]]
                mv = np.median(d[:, 0, :], axis=0) if len(d) else np.zeros(2, np.float32)
                pts[sl] = pts[sl] + mv  # rigid move of the cloud keeps its shape
                centres.append(list(map(float, (np.array(seeds[k]) if not centres and False else pts[sl].mean(axis=0)[0]))))
            out[n] = centres
            prev = cur
            n += direction
# light temporal smoothing
keys = sorted(out)
arr = np.array([out[k] for k in keys])
sm = arr.copy()
for i in range(len(keys)):
    lo, hi = max(0, i - 3), min(len(keys), i + 4)
    seg = lambda k: 0 if k <= 237 else 1 if k <= 390 else 2
    same = [j for j in range(lo, hi) if seg(keys[j]) == seg(keys[i])]
    sm[i] = arr[same].mean(axis=0)
json.dump({str(k): [[round(x, 1), round(y, 1)] for x, y in sm[i]] for i, k in enumerate(keys)}, open("src/nofa/swatch_track.json", "w"))
print(len(keys), "frames tracked")
