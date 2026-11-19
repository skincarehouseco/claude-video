#!/usr/bin/env bash
# Renders all three edits to out/*.mp4 (H.264, AAC, TikTok-ready 1080x1920@30)
set -e
cd "$(dirname "$0")/.."
for id in Yello-1-CleanserDulu Yello-2-PregnantMom Yello-3-KunyitSafe; do
  npx remotion render src/index.ts "$id" "out/$id.mp4" --codec=h264 --crf=17 --audio-bitrate=256k --concurrency=4 --log=error
  echo "rendered $id"
done
