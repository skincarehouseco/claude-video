# BiRefNet-portrait via onnxruntime directly (low-memory session); writes 8-bit masks
import sys, os, time, numpy as np, onnxruntime as ort
from PIL import Image
model=os.path.expanduser(os.environ.get("MODEL","~/.rembg/models/birefnet-portrait/birefnet-portrait.onnx"))
o=ort.SessionOptions(); o.enable_cpu_mem_arena=False; o.enable_mem_pattern=False
o.graph_optimization_level=ort.GraphOptimizationLevel.ORT_ENABLE_BASIC; o.intra_op_num_threads=int(os.environ.get("THR","4"))
s=ort.InferenceSession(model,o,providers=["CPUExecutionProvider"]); inp=s.get_inputs()[0].name
src,dst=sys.argv[1],sys.argv[2]; os.makedirs(dst,exist_ok=True)
names=sys.argv[3:]
mean=np.array([0.485,0.456,0.406],np.float32); std=np.array([0.229,0.224,0.225],np.float32)
for n in names:
    out=f"{dst}/{n.replace('.jpg','.png')}"
    if os.path.exists(out): continue
    t=time.time(); im=Image.open(f"{src}/{n}").convert("RGB"); W,H=im.size
    x=(np.asarray(im.resize((1024,1024),Image.BILINEAR),np.float32)/255-mean)/std
    y=s.run(None,{inp:x.transpose(2,0,1)[None]})[0][0,0]
    y=1/(1+np.exp(-y))
    Image.fromarray((y*255).astype(np.uint8)).resize((W,H),Image.BILINEAR).save(out)
    print(n,round(time.time()-t,2),flush=True)
