"""Per-shot colour normalisation + grade of the source footage (consistent exposure across jump cuts).

Each shot's black level and average luma (measured with ffmpeg signalstats) are mapped to the same
targets, then saturation/warmth is added so the whole video has one look: not too bright, not too dark.
"""
import subprocess, sys
SRC, DST = sys.argv[1], sys.argv[2]
FPS = 30
# shot start frames (jump cuts detected with ffmpeg scene detection) and measured stats (YLOW, YAVG)
SHOTS = [
    (0, 46.8, 118.3), (188, 52.9, 129.8), (327, 54.0, 126.7), (820, 55.4, 128.9), (903, 48.4, 123.9),
    (1179, 55.4, 129.2), (1245, 60.2, 130.2), (1419, 47.3, 122.0), (1665, 46.9, 120.3), (1981, 56.6, 130.6),
]
TOTAL = 2305
BLACK, MID = 24.0, 121.0
parts, labels = [], []
for i, (start, lo, avg) in enumerate(SHOTS):
    end = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else TOTAL
    k = (MID - BLACK) / (avg - lo)
    lut = f"clip((val-{lo:.1f})*{k:.4f}+{BLACK},16,235)"
    parts.append(
        f"[0:v]trim=start_frame={start}:end_frame={end},setpts=PTS-STARTPTS,"
        f"lutyuv=y='{lut}',"
        # gentle S-curve for depth, then vibrance + slight warmth
        f"curves=all='0/0 0.25/0.23 0.5/0.5 0.75/0.78 1/1',"
        f"eq=saturation=1.32:gamma=1.0,"
        f"colorbalance=rs=0.02:bs=-0.02:rm=0.02:gm=0.0:bm=-0.02:rh=0.01:bh=-0.015[v{i}]"
    )
    labels.append(f"[v{i}]")
fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(SHOTS)}:v=1:a=0[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", fc, "-map", "[out]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-r", "30", DST], check=True)
print("graded ->", DST)
