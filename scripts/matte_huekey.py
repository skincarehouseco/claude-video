"""Hue-difference matte for clips shot against a plain warm/pinkish white wall (the booih foam clips):
foam is greener than the wall (G-R > wall), skin is much more orange (R-B high, G-R very negative), the can is teal
and sleeves/watch are dark. Returns a soft alpha (H x W float32, 0..1)."""
import numpy as np, cv2

K = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))

def local_wall(x, exclude):
    """wall colour field (G-R, R-B) by normalised convolution over pixels that are probably wall: handles the uneven
    light on the wall (warm corners, greenish/blue daylight patches) instead of one global wall colour."""
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    w = (1 - exclude).astype(np.float32)
    sig = max(x.shape[:2]) / 18
    den = cv2.GaussianBlur(w, (0, 0), sig) + 1e-3
    gr = cv2.GaussianBlur((g - r) * w, (0, 0), sig) / den
    rb = cv2.GaussianBlur((r - b) * w, (0, 0), sig) / den
    # where almost no wall is visible nearby, fall back to the frame's global wall estimate
    glob_gr = np.median((g - r)[w > 0.5]) if (w > 0.5).any() else -12
    glob_rb = np.median((r - b)[w > 0.5]) if (w > 0.5).any() else 18
    conf = np.clip(den / 0.25, 0, 1)
    return gr * conf + glob_gr * (1 - conf), rb * conf + glob_rb * (1 - conf)

def matte(f, small_hole=6000, min_blob=5000, exclude=None):
    x = f.astype(np.float32)
    x = cv2.GaussianBlur(x, (0, 0), 1.5)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    lum = x.mean(-1)
    if exclude is None:
        # wall reference measured per frame from the image border rows (wall dominates there)
        gr_wall = np.median(np.concatenate([(g - r)[:40].ravel(), (g - r)[:, :30].ravel()]))
        rb_wall = np.median(np.concatenate([(r - b)[:40].ravel(), (r - b)[:, :30].ravel()]))
    else:
        strict = (((r - b) > 45) & ((r - g) > 28)) | ((g - r) > 40) | (lum < 90)  # obvious skin / teal can / dark sleeve
        ex = cv2.dilate(np.maximum(exclude, strict.astype(np.float32)), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
        gr_wall, rb_wall = local_wall(x, np.clip(ex, 0, 1))
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
