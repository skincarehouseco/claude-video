#!/usr/bin/env bash
# usage: scripts/stills.sh <CompositionId> <out-prefix> <sec> [sec...]  → contact sheet with a TikTok safe-zone guide
set -e
id=$1; pre=$2; shift 2; files=()
for s in "$@"; do f=$(python3 -c "print(round($s*30))"); npx remotion still src/index.ts "$id" "out/${pre}_$f.jpg" --frame=$f --log=error >/dev/null; files+=("out/${pre}_$f.jpg"); done
args=(); fc=""; i=0
for f in "${files[@]}"; do args+=(-i "$f"); fc+="[$i:v]scale=270:480,drawbox=x=20:y=42:w=212:h=318:color=red@0.5:t=1[v$i];"; i=$((i+1)); done
fc+="$(for j in $(seq 0 $((i-1))); do printf "[v$j]"; done)hstack=inputs=$i"
ffmpeg -v error -y "${args[@]}" -filter_complex "$fc" "out/${pre}_sheet.jpg"
