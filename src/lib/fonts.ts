import { continueRender, delayRender, staticFile } from "remotion";

const faces: Array<[string, string, string]> = [
  ["Quicksand", "fonts/quicksand-latin-400-normal.woff2", "400"],
  ["Quicksand", "fonts/quicksand-latin-500-normal.woff2", "500"],
  ["VT323", "fonts/vt323-latin-400-normal.woff2", "400"],
  ["Pixelify Sans", "fonts/pixelify-sans-latin-500-normal.woff2", "500"],
  ["Sacramento", "fonts/sacramento-latin-400-normal.woff2", "400"],
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("fonts");
  Promise.all(
    faces.map(([family, file, weight]) => {
      const f = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
