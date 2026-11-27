// usage: node scripts/otms/stills.mjs <compId> <outPrefix> <frame,frame,...> [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [id, out, frames, scale = '0.5'] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id});
for (const fr of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, frame: fr, output: `${out}_${String(fr).padStart(4, '0')}.png`, scale: Number(scale), timeoutInMilliseconds: 120000});
}
console.log('ok');
