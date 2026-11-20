"""Hue-difference matte for clips shot against a plain warm/pinkish white wall (the booih foam clips):
foam is greener than the wall (G-R > wall), skin is much more orange (R-B high, G-R very negative), the can is teal
and sleeves/watch are dark. Returns a soft alpha (H x W float32, 0..1)."""
import numpy as np, cv2

K = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))

def matte(f, small_hole=6000, min_blob=5000):
    x = f.astype(np.float32)
    x = cv2.GaussianBlur(x, (0, 0), 1.5)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    lum = x.mean(-1)
    # wall reference measured per frame from the image border rows (wall dominates there)
    gr_wall = np.median(np.concatenate([(g - r)[:40].ravel(), (g - r)[:, :30].ravel()]))
    rb_wall = np.median(np.concatenate([(r - b)[:40].ravel(), (r - b)[:, :30].ravel()]))
    foam = np.clip(((g - r) - gr_wall - 7) / 8, 0, 1)
    skin = np.clip(((r - b) - rb_wall - 22) / 14, 0, 1) * np.clip(((r - g) - (-gr_wall) - 14) / 12, 0, 1)
    teal = np.clip(((g - r) - 40) / 20, 0, 1)
    dark = np.clip((110 - lum) / 30, 0, 1)
    score = np.maximum.reduce([foam, skin, teal, dark])
    bmask = (score > 0.5).astype(np.uint8)
    bmask = cv2.morphologyEx(bmask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    bmask = cv2.morphologyEx(bmask, cv2.MORPH_CLOSE, K)
    holes = (1 - bmask).astype(np.uint8)
    nh, lab, st, _ = cv2.connectedComponentsWithStats(holes)
    for i in range(1, nh):
        x0, y0, w, h, area = st[i]
        if not (x0 == 0 or y0 == 0 or x0 + w >= bmask.shape[1] or y0 + h >= bmask.shape[0]) and area < small_hole:
            bmask[lab == i] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(bmask)
    keep = np.zeros_like(bmask)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > min_blob:
            keep[lab == i] = 1
    keep = cv2.erode(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    return cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2.0)
