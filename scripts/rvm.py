"""Robust Video Matting (ResNet50, ONNX) over the source frames, segment-aware.
The recurrent state is reset at every jump cut in the source and warmed up on the first frames of
the new shot (then those frames are re-run), so no ghost of the previous shot leaks through.
usage: rvm.py model.onnx frames_dir out_dir cuts.json [downsample_ratio]"""
import json, os, sys, time
import cv2, numpy as np, onnxruntime as ort

model, frames, out, cuts_file = sys.argv[1:5]
dsr = np.array([float(sys.argv[5]) if len(sys.argv) > 5 else 0.3], np.float32)
os.makedirs(out, exist_ok=True)
n = len([f for f in os.listdir(frames) if f.startswith("f_")])
bounds = [1] + [c for c in json.load(open(cuts_file)) if 1 < c <= n] + [n + 1]
so = ort.SessionOptions(); so.intra_op_num_threads = 4
s = ort.InferenceSession(model, so, providers=["CPUExecutionProvider"])
load = lambda f: (cv2.imread(f"{frames}/f_{f:04d}.jpg")[:, :, ::-1].astype(np.float32) / 255).transpose(2, 0, 1)[None]
def step(x, rec):
    fgr, pha, *rec = s.run([], {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": dsr})
    return pha, rec
t0 = time.time()
for a, b in zip(bounds, bounds[1:]):
    rec = [np.zeros([1, 1, 1, 1], np.float32)] * 4
    for f in range(a, min(a + 15, b)):  # warm-up on this shot
        _, rec = step(load(f), rec)
    for f in range(a, b):
        pha, rec = step(load(f), rec)
        cv2.imwrite(f"{out}/a_{f:04d}.png", (pha[0, 0] * 255).clip(0, 255).astype(np.uint8))
    print("segment", a, b - 1, round(time.time() - t0), "s", flush=True)
print("done")
