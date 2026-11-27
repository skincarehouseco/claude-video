"""Per-frame head tracking from the speaker matte: head top y and head centre x (source px). -> src/otms/track.json"""
import sys, glob, json, numpy as np
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/*.png')); out = []
for fn in fs:
    a = np.asarray(Image.open(fn).convert('L').resize((270, 480))) > 128
    rows = np.where(a[:300].any(1))[0]
    top = rows[0] if len(rows) else 120
    band = a[top + 15: top + 95]
    cols = np.where(band.any(0))[0]
    cx = (cols[0] + cols[-1]) / 2 if len(cols) else 135
    out.append([float(cx * 4), float(top * 4)])
arr = np.array(out); k = 5
sm = np.array([arr[max(0, i - k):i + k + 1].mean(0) for i in range(len(arr))])
json.dump([[round(x, 1), round(y, 1)] for x, y in sm], open(sys.argv[2], 'w'))
print(len(sm), sm.min(0), sm.max(0))
