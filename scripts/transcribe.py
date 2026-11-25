import json,sys
from faster_whisper import WhisperModel
m=WhisperModel(sys.argv[2],device="cpu",compute_type="int8",cpu_threads=4)
import wave,numpy as np
_w=wave.open(sys.argv[1]);audio=np.frombuffer(_w.readframes(_w.getnframes()),np.int16).astype(np.float32)/32768
segs,info=m.transcribe(audio,word_timestamps=True,language="ms",beam_size=5,vad_filter=False,initial_prompt="Hai semua, hari ni nak share macam mana nak tahu skin type korang. Oily skin, dry skin, combination skin, normal skin. Tisu, cleanser, tunggu 30 minit.")
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}",flush=True)
json.dump(out,open(sys.argv[3],"w"),ensure_ascii=False,indent=1)
