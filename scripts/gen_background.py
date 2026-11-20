# Background plate generator used for out/foam-studio-gen.mp4 (seed 201, desk prompt). Run with a python env that has torch + diffusers + peft.
"""Generate a background plate on CPU: Realistic Vision 5.1 (SD1.5) + LCM-LoRA, 6 steps.
usage: gen_bg.py <out_prefix> <n> <seed0>"""
import sys, time, torch
from diffusers import StableDiffusionPipeline, AutoencoderKL, LCMScheduler
torch.set_num_threads(4)
vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse', torch_dtype=torch.float32)
pipe = StableDiffusionPipeline.from_pretrained('SG161222/Realistic_Vision_V5.1_noVAE', vae=vae, torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights('latent-consistency/lcm-lora-sdv1-5'); pipe.fuse_lora()
import os
prompt = os.environ.get('BG_PROMPT') or ('RAW photo, close-up eye level view across a clean glossy white desk top, white drawer cabinet on the right, '
          'white floating shelves on a warm white wall with neat skincare bottles, perfume, ceramic vase with pink tulips, '
          'cream candle, small green plant, pastel pink and cream feminine decor, bright soft natural window daylight from the left, '
          'airy beauty content creator room, no people, no chair, shallow depth of field, high detail, interior product photography')
neg = 'chair, bed, floor, window frame in center, person, people, hands, text, watermark, logo, dark, cluttered, messy, cartoon, illustration, deformed, blurry, lowres, oversaturated'
out, n, s0 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
for i in range(n):
    t = time.time()
    g = torch.Generator().manual_seed(s0 + i)
    img = pipe(prompt, negative_prompt=neg, num_inference_steps=6, guidance_scale=1.5, width=512, height=896, generator=g).images[0]
    img.save(f'{out}_{s0+i}.png'); print('saved', f'{out}_{s0+i}.png', f'{time.time()-t:.0f}s', flush=True)
