"""Build RGBA speaker cut-outs (public/subject/s_XXXX.png) from graded frames + BiRefNet masks.
Masks are temporally smoothed (3-frame weighted average) to avoid edge flicker, then lightly
contracted and feathered so the cut-out blends into the cartoon background."""
import glob, os, sys, numpy as np
from PIL import Image, ImageFilter
src_dir, mask_dir, out_dir = sys.argv[1:4]
os.makedirs(out_dir, exist_ok=True)
masks = {int(os.path.basename(p)[2:6]): p for p in glob.glob(f"{mask_dir}/f_*.png")}
load = lambda n: np.asarray(Image.open(masks[n]).convert("L"), np.float32) / 255
for n in sorted(masks):
    m = load(n) * 0.5 + sum(load(k) * 0.25 for k in (n - 1, n + 1) if k in masks) * (2 if sum(k in masks for k in (n-1, n+1)) == 1 else 1)
    a = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8))
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.6))
    a = Image.fromarray((np.clip((np.asarray(a, np.float32) / 255 - 0.08) / 0.84, 0, 1) * 255).astype(np.uint8))
    rgb = Image.open(f"{src_dir}/f_{n:04d}.png").convert("RGB")
    rgb.putalpha(a)
    rgb.save(f"{out_dir}/s_{n:04d}.png", optimize=False, compress_level=3)
print("subject frames:", len(masks))
