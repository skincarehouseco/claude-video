#!/usr/bin/env bash
# Memory-friendly render: video in 250-frame chunks (fresh browser each), audio separately, then lossless join.
set -euo pipefail
cd "$(dirname "$0")/../.."
N=$(npx remotion compositions src/index.ts --log=error 2>/dev/null | awk '/^PestanaEdit/{print $4}')
N=${N:-1537}
CH=250; mkdir -p out/chunks; : > out/chunks/list.txt
OPTS="--log=error --concurrency 2 --timeout 240000 --offthreadvideo-cache-size-in-bytes 300000000"
for ((s=0; s<N; s+=CH)); do
  e=$((s+CH-1)); ((e>=N)) && e=$((N-1))
  f=out/chunks/v_$(printf %05d $s).mp4
  [ -s "$f" ] || npx remotion render src/index.ts PestanaEdit "$f" --codec h264 --crf 17 --muted --frames=$s-$e $OPTS
  echo "file '$(basename $f)'" >> out/chunks/list.txt
  echo "chunk $s-$e done"
done
npx remotion render src/index.ts PestanaEdit out/chunks/audio.wav --codec wav $OPTS
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i out/chunks/audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart out/pestana_final.mp4
echo "DONE out/pestana_final.mp4"
