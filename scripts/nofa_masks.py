"""Foreground masks (hands, arm, tubes, swatches) for every frame with rembg isnet-general-use.
usage: nofa_masks.py frames_dir out_dir"""
import os, sys, glob
from rembg import new_session, remove
from PIL import Image
src, out = sys.argv[1:3]
os.makedirs(out, exist_ok=True)
s = new_session("isnet-general-use")
for f in sorted(glob.glob(f"{src}/f_*.jpg")):
    o = f"{out}/{os.path.basename(f)[:-4]}.png"
    if os.path.exists(o):
        continue
    remove(Image.open(f), session=s, only_mask=True).save(o)
print("done")
