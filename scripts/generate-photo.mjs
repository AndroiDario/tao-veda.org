/**
 * Genera le sei varianti che ResponsivePhoto.astro si aspetta per una foto:
 * <base>-{960,1600}.{jpg,webp,avif} in public/assets/photos/tao-veda/.
 *
 * Uso: node scripts/generate-photo.mjs <sorgente> <base> [--jpg=N --webp=N --avif=N]
 * Esempio: node scripts/generate-photo.mjs ~/Desktop/dario.jpg percorso-dario
 *
 * Le qualità di default sono tarate sugli asset già in produzione
 * (1600px ≈ 85 KB jpg, 45 KB webp, 22 KB avif). Le immagini con molta grana
 * comprimono peggio: si abbassano con i flag per restare dentro quel profilo.
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const [source, base] = args.filter((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};

if (!source || !base) {
  console.error("Uso: node scripts/generate-photo.mjs <sorgente> <base> [--jpg=N --webp=N --avif=N]");
  process.exit(1);
}

const outputDir = path.join(process.cwd(), "public", "assets", "photos", "tao-veda");
const widths = [960, 1600];
const formats = [
  { ext: "jpg", options: { quality: flag("jpg", 80), mozjpeg: true } },
  { ext: "webp", options: { quality: flag("webp", 78) } },
  { ext: "avif", options: { quality: flag("avif", 50) } },
];

await mkdir(outputDir, { recursive: true });

const meta = await sharp(source).metadata();
console.log(`Sorgente: ${meta.width}×${meta.height}`);

const written = [];

for (const width of widths) {
  const pipeline = sharp(source).rotate().resize({ width, withoutEnlargement: true });
  for (const { ext, options } of formats) {
    const file = path.join(outputDir, `${base}-${width}.${ext}`);
    const info = await pipeline.clone().toFormat(ext === "jpg" ? "jpeg" : ext, options).toFile(file);
    const { size } = await stat(file);
    written.push({ file: path.basename(file), dim: `${info.width}×${info.height}`, kb: Math.round(size / 1024) });
  }
}

console.table(written);

const largest = written.find((w) => w.file.endsWith("-1600.jpg")) ?? written.at(-1);
console.log(`\nwidth/height da passare a ResponsivePhoto: ${largest.dim.replace("×", " / ")}`);
