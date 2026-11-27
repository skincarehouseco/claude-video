import sys,glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob(sys.argv[1]+'_*.png')); out=sys.argv[2]; w=int(sys.argv[3]) if len(sys.argv)>3 else 300
ims=[Image.open(f).convert('RGB') for f in fs]; h=int(ims[0].height*w/ims[0].width)
cols=min(len(ims),6); rows=(len(ims)+cols-1)//cols
c=Image.new('RGB',(cols*w,rows*h),'white'); d=ImageDraw.Draw(c)
for i,(im,f) in enumerate(zip(ims,fs)):
    c.paste(im.resize((w,h)),((i%cols)*w,(i//cols)*h)); d.text(((i%cols)*w+6,(i//cols)*h+6),f.split('_')[-1][:-4],fill='red')
c.save(out)
