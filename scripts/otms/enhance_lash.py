"""Detail enhancement for macro eyelash footage (no AI-invented detail).
Per frame: Lanczos upscale -> black-hat "dark strand" deepening (lashes/brows only) ->
edge-masked fine sharpening (flat skin untouched) -> gentle S-curve.
usage: python3 enhance_lash.py in_dir out_dir scale"""
import sys, os, glob
import numpy as np, cv2

src, dst, scale = sys.argv[1], sys.argv[2], float(sys.argv[3])
os.makedirs(dst, exist_ok=True)


def enhance(bgr):
    # 1. upscale (float, no 8-bit banding)
    img = bgr.astype(np.float32)
    if scale != 1:
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    ycc = cv2.cvtColor(np.clip(img, 0, 255) / 255.0, cv2.COLOR_BGR2YCrCb)
    Y = ycc[..., 0]
    # 2. lash/hair map: black-hat picks out thin DARK strands (lashes, brows), ignores flat skin
    k = int(round(9 * scale)) | 1
    se = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    blackhat = cv2.morphologyEx(Y, cv2.MORPH_BLACKHAT, se)
    blackhat = cv2.GaussianBlur(blackhat, (0, 0), 0.6 * scale)
    Y = Y - 0.85 * blackhat  # deepen the strands
    # 3. fine sharpening only where there is real edge structure (skin flats left alone)
    d = Y - cv2.GaussianBlur(Y, (0, 0), 1.1 * scale)
    gx = cv2.Sobel(Y, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(Y, cv2.CV_32F, 0, 1, ksize=3)
    g = cv2.GaussianBlur(np.sqrt(gx * gx + gy * gy), (0, 0), 2 * scale)
    mask = np.clip((g - 0.02) / 0.06, 0, 1)
    Y = Y + np.clip(d * 1.8, -0.07, 0.07) * mask
    # 4. gentle S-curve for a cleaner, punchier look
    Y = np.clip(Y, 0, 1)
    Y = Y + 0.06 * np.sin((Y - 0.5) * np.pi) * (1 - np.abs(2 * Y - 1))
    ycc[..., 0] = np.clip(Y, 0, 1)
    out = cv2.cvtColor(ycc, cv2.COLOR_YCrCb2BGR) * 255.0
    return np.clip(out + np.random.uniform(-0.5, 0.5, out.shape), 0, 255).astype(np.uint8)


def work(fn):
    cv2.setNumThreads(1)
    cv2.imwrite(os.path.join(dst, os.path.basename(fn)), enhance(cv2.imread(fn)), [cv2.IMWRITE_PNG_COMPRESSION, 1])


if __name__ == '__main__':
    from multiprocessing import Pool
    files = sorted(glob.glob(os.path.join(src, '*.png')))
    with Pool(int(os.environ.get('WORKERS', 3))) as p:
        for i, _ in enumerate(p.imap(work, files)):
            if i % 30 == 0:
                print(i, len(files), flush=True)
print('done')
