import sharp from "sharp";

// Usage:
// node scripts/make-spine-transparent.mjs "<input.png>" "<output.png>"
//
// Converts a light-gray/white-background crease PNG into a transparent PNG by:
// - computing luminance
// - mapping darkness -> alpha (dark = opaque, light = transparent)
// - outputting black pixels with that alpha (so only the crease remains)

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node scripts/make-spine-transparent.mjs <input.png> <output.png>");
  process.exit(1);
}

const { data, info } = await sharp(inPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const out = Buffer.alloc(data.length);

// Turn "almost white" into transparent; keep only darker center.
// You can tweak these thresholds if needed.
const t0 = 210; // above -> fully transparent
const t1 = 120; // below -> fully opaque

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  // Relative luminance (sRGB approx)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..255

  let a;
  if (lum >= t0) a = 0;
  else if (lum <= t1) a = 255;
  else a = Math.round(((t0 - lum) / (t0 - t1)) * 255);

  out[i] = 0;
  out[i + 1] = 0;
  out[i + 2] = 0;
  out[i + 3] = a;
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(outPath);
