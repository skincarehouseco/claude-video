"""Track the speaker's face per frame (OpenCV Haar) -> smoothed src/v2/face.json (x, y, w in 1080x1920 px)."""
import cv2, json, sys, numpy as np
cap = cv2.VideoCapture(sys.argv[1] if len(sys.argv) > 1 else "public/v2/main.mp4")
cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
raw = []
prev = None
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (540, 960)), cv2.COLOR_BGR2GRAY)
    fs = cc.detectMultiScale(g, 1.1, 6, minSize=(120, 120))
    if len(fs):
        # keep the biggest face, or the one nearest the previous detection
        fs = sorted(fs, key=lambda f: -f[2] if prev is None else abs(f[0] + f[2]/2 - prev[0]) + abs(f[1] + f[3]/2 - prev[1]))
        x, y, w, h = fs[0]
        prev = (x + w/2, y + h/2)
        raw.append([2*(x + w/2), 2*(y + h/2), 2*w])
    else:
        raw.append(None)
n = len(raw)
# fill gaps by interpolation
idx = [i for i, r in enumerate(raw) if r]
arr = np.array([raw[i] for i in idx], float)
full = np.stack([np.interp(range(n), idx, arr[:, k]) for k in range(3)], 1)
# median then gaussian smoothing (~0.4 s), restarting at hard cuts so the track jumps with the footage
cuts = [0, 652, 792, n]
out = np.zeros_like(full)
for a, b in zip(cuts, cuts[1:]):
    seg = full[a:b].copy()
    for k in range(3):
        s = seg[:, k]
        med = np.array([np.median(s[max(0, i-4):i+5]) for i in range(len(s))])
        ker = np.exp(-0.5 * (np.arange(-12, 13) / 5) ** 2); ker /= ker.sum()
        pad = np.pad(med, 12, mode="edge")
        seg[:, k] = np.convolve(pad, ker, mode="valid")
    out[a:b] = seg
json.dump([[round(v, 1) for v in r] for r in out.tolist()], open("src/v2/face.json", "w"))
print(n, "frames; detected", len(idx), "; mean", out.mean(0).round(1), "min", out.min(0).round(1), "max", out.max(0).round(1))
