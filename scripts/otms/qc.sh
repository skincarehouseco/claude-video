#!/bin/bash
# QC: format, duration, black frames, loudness (voice vs full mix), frame sheet
f=$1; out=$2
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration -of compact "$f"
echo "black frames:"; ffmpeg -v error -i "$f" -vf "blackdetect=d=0.05:pix_th=0.06" -an -f null - 2>&1 | grep black_start || echo none
echo "loudness:"; ffmpeg -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|True peak|Peak:)" | tail -3
ffmpeg -v error -y -i "$f" -vf "fps=1,scale=180:-1,tile=8x3" -frames:v 1 "$out"
