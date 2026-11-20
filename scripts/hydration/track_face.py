"""Track the speaker's face (OpenCV Haar cascade) per frame -> smoothed JSON [cx, cy, w] in 1080x1920 px."""
import cv2, json, sys, numpy as np
cap = cv2.VideoCapture(sys.argv[1])
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
raw = []
while True:
    ok, fr = cap.read()
    if not ok: break
    h, w = fr.shape[:2]; s = 360 / w
    g = cv2.cvtColor(cv2.resize(fr, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY)
    faces = casc.detectMultiScale(g, 1.1, 5, minSize=(50, 50))
    if len(faces):
        x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
        raw.append([(x + fw / 2) / s * 1080 / w, (y + fh / 2) / s * 1080 / w, fw / s * 1080 / w])
    else:
        raw.append(None)
a = np.array([r if r else [np.nan] * 3 for r in raw], float)
for k in range(3):  # fill gaps, then smooth (~0.4 s window)
    col = a[:, k]; idx = np.arange(len(col)); ok = ~np.isnan(col)
    col = np.interp(idx, idx[ok], col[ok]); ker = np.ones(13) / 13
    a[:, k] = np.convolve(np.pad(col, 6, mode="edge"), ker, mode="valid")
print("frames", len(a), "missed", sum(r is None for r in raw), "mean", a.mean(0).round(1), "min", a.min(0).round(1), "max", a.max(0).round(1))
json.dump([[round(v, 1) for v in r] for r in a], open(sys.argv[2], "w"))
