/**
 * Builds the @capacitor/assets inputs in assets/ from the layered icon art in
 * assets/icons/. Run via `npm run assets`, which then invokes capacitor-assets to
 * produce the platform mipmaps and splash drawables.
 *
 *   assets/icons/app_icon_original.png             composite, used as-is
 *   assets/icons/app_icon_original_background.png  adaptive background layer
 *   assets/icons/app_icon_original_foreground.png  adaptive foreground, transparent
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = (name) => path.join(ROOT, 'assets', 'icons', name);
const OUT = (name) => path.join(ROOT, 'assets', name);

// Backdrop colours, measured from app_icon_original_background.png. Keep
// `splashBackground` in android/app/src/main/res/values/colors.xml equal to MID, or the
// Android 12+ splash shows a seam between the window background and the bitmap.
const TOP = '#01324c';
const MID = '#003855';
const BOTTOM = '#002136';

/**
 * How much of the foreground layer the artwork occupies. capacitor-assets already insets
 * this layer by 16.7% to land it on the adaptive icon's 72dp safe zone, so at 1.0 the
 * artwork fills that zone edge to edge and a round launcher mask clips its corners.
 * This margin is what keeps the icon from looking zoomed in.
 */
const FOREGROUND_SCALE = 0.75;

/** The icon's backdrop, extended to an arbitrary size for the splash screen. */
const gradientSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${TOP}"/>
      <stop offset="50%" stop-color="${MID}"/>
      <stop offset="100%" stop-color="${BOTTOM}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
</svg>`;

/** Centres an image on a transparent canvas of `canvas` px, scaled to `scale` of it. */
async function padded(file, canvas, scale) {
  const inner = Math.round(canvas * scale);
  const pad = Math.round((canvas - inner) / 2);
  const artwork = await sharp(file).resize(inner, inner).png().toBuffer();
  return sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: artwork, top: pad, left: pad }])
    .png()
    .toBuffer();
}

async function main() {
  // capacitor-assets wants icons >= 1024 square and splashes >= 2732; the sources are
  // 1254, so the composite and backdrop map straight across.
  await sharp(SRC('app_icon_original.png')).png().toFile(OUT('icon-only.png'));
  await sharp(SRC('app_icon_original_background.png')).png().toFile(OUT('icon-background.png'));

  const foreground = SRC('app_icon_original_foreground.png');
  const { width } = await sharp(foreground).metadata();
  await sharp(await padded(foreground, width, FOREGROUND_SCALE))
    .png()
    .toFile(OUT('icon-foreground.png'));

  // Splash: the backdrop at 2732 with the transparent artwork centred, so the seam
  // against windowSplashScreenBackground is invisible.
  const splash = 2732;
  const logoSize = Math.round(splash * 0.28);
  const logo = await sharp(foreground).resize(logoSize, logoSize).png().toBuffer();
  const offset = Math.round((splash - logoSize) / 2);

  for (const name of ['splash.png', 'splash-dark.png']) {
    await sharp(Buffer.from(gradientSvg(splash)))
      .composite([{ input: logo, top: offset, left: offset }])
      .png()
      .toFile(OUT(name));
  }

  console.log('assets/: icon-only, icon-background, icon-foreground, splash, splash-dark');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
